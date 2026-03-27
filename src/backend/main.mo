import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";



actor {
  // ================================================================
  // MIGRATION STUBS — kept for upgrade compatibility only
  // ================================================================
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type OldAppointmentStatus = { #pending; #confirmed; #completed; #cancelled };
  type OldAppointment = {
    customerName : Text; serviceName : Text; staffName : Text;
    date : Text; time : Text; status : OldAppointmentStatus;
    notes : ?Text; price : Float;
  };
  type OldCustomer    = { name : Text; phone : Text; email : Text; notes : ?Text };
  type OldService     = { name : Text; duration : Nat; price : Float; description : ?Text };
  type OldStaff       = { name : Text; role : Text; specialty : Text; phone : Text; email : Text };
  type OldUserProfile = { name : Text };
  type OldSalonProfile = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPrincipal : Principal; isActive : Bool;
    trialStartDate : Int; subscriptionActive : Bool;
  };
  type OldSalonProfileV2 = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPrincipal : Principal; isActive : Bool; pendingApproval : Bool;
    trialStartDate : Int; subscriptionActive : Bool; trialDays : Nat;
  };
  type OldSalonAppointment = {
    salonId : Nat; customerPrincipal : Principal;
    customerName : Text; customerPhone : Text;
    serviceName : Text; queueNumber : Nat;
    status : Text; createdAt : Int; date : Text;
  };
  type OldCustomerProfile = { name : Text; phone : Text };

  let appointments  = Map.empty<Nat, OldAppointment>();
  let customers     = Map.empty<Nat, OldCustomer>();
  let services      = Map.empty<Nat, OldService>();
  let staff         = Map.empty<Nat, OldStaff>();
  let userProfiles  = Map.empty<Principal, OldUserProfile>();
  var nextCustomerId : Nat = 1;
  var nextStaffId    : Nat = 1;
  let rolePrefMap    = Map.empty<Principal, Text>();
  let salonTrialDaysMap = Map.empty<Nat, Nat>();
  let salonProfiles  = Map.empty<Nat, OldSalonProfile>();
  var migrationDone  : Bool = false;
  let salonProfilesV2 = Map.empty<Nat, OldSalonProfileV2>();
  let ownerSalonMap  = Map.empty<Principal, Nat>();
  let custProfiles   = Map.empty<Principal, OldCustomerProfile>();
  let salonAppointments = Map.empty<Nat, OldSalonAppointment>();
  // ================================================================

  // ================================================================
  // TYPES (V3 — phone-based)
  // ================================================================
  public type SalonProfile = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
  };

  public type SalonWithId = {
    id : Nat; name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
  };

  public type SalonService  = { salonId : Nat; name : Text; price : Float; durationMinutes : Nat };
  public type ServiceWithId = { id : Nat; salonId : Nat; name : Text; price : Float; durationMinutes : Nat };

  public type Appointment = {
    salonId : Nat; customerPhone : Text;
    customerName : Text;
    serviceName : Text; queueNumber : Nat;
    status : Text; createdAt : Int; date : Text;
    servicePrice : Float;
  };
  public type AppointmentWithId = {
    id : Nat; salonId : Nat; customerPhone : Text;
    customerName : Text;
    serviceName : Text; queueNumber : Nat;
    status : Text; createdAt : Int; date : Text;
    servicePrice : Float;
  };

  public type CustomerProfile = { name : Text; phone : Text };

  public type DashboardStats = {
    total : Nat; active : Nat; expired : Nat; pending : Nat;
  };

  public type RevenueStats = {
    totalRevenue : Float;
    monthlyRevenue : Float;
    perSalon : [(Nat, Text, Float)];
  };

  public type OwnerRevenueSummary = {
    totalEarnings : Float;
    monthlyEarnings : Float;
    totalAppointments : Nat;
    completedAppointments : Nat;
  };

  // ================================================================
  // STATE (V3)
  // ================================================================
  let ADMIN_EMAIL : Text = "amitkrji498@gmail.com";
  // ================================================================
  // STABLE STORAGE (data persists across canister upgrades/builds)
  // ================================================================
  stable var stableAdminPasswordHash : ?Text = null;
  stable var stableNextSalonId : Nat = 1;
  stable var stableNextServiceId : Nat = 1;
  stable var stableNextAppointmentId : Nat = 1;
  stable var stableDefaultTrialDays : Nat = 7;
  stable var stablePlatformPrice : Float = 149.0;
  stable var stableSalons : [(Nat, SalonProfile)] = [];
  stable var stableServices : [(Nat, SalonService)] = [];
  stable var stableAppointments : [(Nat, Appointment)] = [];
  stable var stableCustomers : [(Text, CustomerProfile)] = [];
  stable var stableOwnerPhoneMap : [(Text, Nat)] = [];

  // State vars — auto-restored from stable memory on upgrade
  var adminPasswordHash : ?Text = stableAdminPasswordHash;
  var nextSalonId        : Nat = stableNextSalonId;
  var nextServiceId      : Nat = stableNextServiceId;
  var nextAppointmentId  : Nat = stableNextAppointmentId;
  var defaultTrialDays   : Nat = stableDefaultTrialDays;
  var platformSubscriptionPrice : Float = stablePlatformPrice;
  let MAX_SHOPS          : Nat = 100;

  // V3 maps (phone-keyed) — filled from stable in postupgrade
  let salonProfilesV3    = Map.empty<Nat, SalonProfile>();
  let salonServicesList  = Map.empty<Nat, SalonService>();
  let salonAppointmentsV3 = Map.empty<Nat, Appointment>();
  let custProfilesByPhone = Map.empty<Text, CustomerProfile>();
  let ownerPhoneSalonMap  = Map.empty<Text, Nat>();

  // ================================================================
  // HELPERS
  // ================================================================
  func isTrialExpired(s : SalonProfile) : Bool {
    let trialNanos : Int = s.trialDays * 86_400 * 1_000_000_000;
    Time.now() - s.trialStartDate > trialNanos;
  };

  func isSalonEffectivelyActive(s : SalonProfile) : Bool {
    s.isActive and not s.pendingApproval and
    (s.subscriptionActive or not isTrialExpired(s));
  };

  func makeSalonWithId(id : Nat, s : SalonProfile) : SalonWithId {
    { id; name = s.name; address = s.address; phone = s.phone;
      city = s.city; ownerPhone = s.ownerPhone; isActive = s.isActive;
      pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
      subscriptionActive = s.subscriptionActive; trialDays = s.trialDays };
  };

  func countApprovedSalons() : Nat {
    var count : Nat = 0;
    for ((_, s) in salonProfilesV3.entries().toArray().vals()) {
      if (not s.pendingApproval) { count += 1 };
    };
    count;
  };

  func getCurrentMonthStart() : Int {
    let now = Time.now();
    let nanosPerDay : Int = 86_400_000_000_000;
    let nanosPerHour : Int = 3_600_000_000_000;
    let nanosPerMinute : Int = 60_000_000_000;
    let nanosPerSecond : Int = 1_000_000_000;
    
    // Approximate: get days since epoch, then calculate month
    let daysSinceEpoch = now / nanosPerDay;
    let yearsSinceEpoch = daysSinceEpoch / 365;
    let year = 1970 + yearsSinceEpoch;
    
    // Rough approximation: get current month by dividing remaining days
    let daysInYear = daysSinceEpoch - (yearsSinceEpoch * 365);
    let month = (daysInYear / 30) + 1;
    
    // Calculate first day of current month (approximation)
    let daysToMonthStart = (yearsSinceEpoch * 365) + ((month - 1) * 30);
    daysToMonthStart * nanosPerDay;
  };

  func isCurrentMonth(timestamp : Int) : Bool {
    let monthStart = getCurrentMonthStart();
    timestamp >= monthStart;
  };

  // ================================================================
  // ADMIN AUTH
  // ================================================================
  public query func adminPasswordIsSet() : async Bool {
    switch (adminPasswordHash) { case (null) { false }; case (?_) { true } };
  };

  public func adminSetPassword(email : Text, passwordHash : Text) : async Bool {
    if (email != ADMIN_EMAIL) { return false };
    switch (adminPasswordHash) {
      case (null) { adminPasswordHash := ?passwordHash; true };
      case (?_) { false };
    };
  };

  public query func adminLogin(email : Text, passwordHash : Text) : async Bool {
    if (email != ADMIN_EMAIL) { return false };
    switch (adminPasswordHash) {
      case (null) { false };
      case (?stored) { stored == passwordHash };
    };
  };

  // ================================================================
  // ADMIN — SUBSCRIPTION PRICE
  // ================================================================
  public query func adminGetSubscriptionPrice() : async Float {
    platformSubscriptionPrice;
  };

  public func adminSetSubscriptionPrice(price : Float) : async () {
    if (price < 0.0) { Runtime.trap("Price must be non-negative") };
    platformSubscriptionPrice := price;
  };

  // ================================================================
  // ADMIN — DASHBOARD
  // ================================================================
  public query func adminGetDashboardStats() : async DashboardStats {
    var total : Nat = 0; var active : Nat = 0;
    var expired : Nat = 0; var pending : Nat = 0;
    for ((_, s) in salonProfilesV3.entries().toArray().vals()) {
      if (s.pendingApproval) { pending += 1 }
      else {
        total += 1;
        if (isSalonEffectivelyActive(s)) { active += 1 } else { expired += 1 };
      };
    };
    { total; active; expired; pending };
  };

  public query func adminGetAllSalons() : async [SalonWithId] {
    salonProfilesV3.entries().toArray()
      .filterMap(func((id, s)) {
        if (not s.pendingApproval) { ?makeSalonWithId(id, s) } else { null }
      });
  };

  public query func adminGetPendingSalons() : async [SalonWithId] {
    salonProfilesV3.entries().toArray()
      .filterMap(func((id, s)) {
        if (s.pendingApproval) { ?makeSalonWithId(id, s) } else { null }
      });
  };

  public func adminApproveSalon(salonId : Nat) : async () {
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = true;
          pendingApproval = false; trialStartDate = Time.now();
          subscriptionActive = false; trialDays = s.trialDays;
        });
      };
    };
  };

  public func adminRejectSalon(salonId : Nat) : async () {
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.remove(salonId);
        ownerPhoneSalonMap.remove(s.ownerPhone);
      };
    };
  };

  public func adminSetSalonActive(salonId : Nat, active : Bool) : async () {
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = active;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
        });
      };
    };
  };

  public func adminSetSalonSubscription(salonId : Nat, active : Bool) : async () {
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = s.isActive;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = active; trialDays = s.trialDays;
        });
      };
    };
  };

  public query func adminGetDefaultTrialDays() : async Nat { defaultTrialDays };

  public func adminSetDefaultTrialDays(days : Nat) : async () {
    if (days == 0) { Runtime.trap("Trial days must be at least 1") };
    defaultTrialDays := days;
  };

  public func adminSetSalonTrialDays(salonId : Nat, days : Nat) : async () {
    if (days == 0) { Runtime.trap("Trial days must be at least 1") };
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = s.isActive;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = s.subscriptionActive; trialDays = days;
        });
      };
    };
  };

  public func adminProcessTrialExpirations() : async Nat {
    var count : Nat = 0;
    for ((id, s) in salonProfilesV3.entries().toArray().vals()) {
      if (s.isActive and not s.pendingApproval and not s.subscriptionActive and isTrialExpired(s)) {
        salonProfilesV3.add(id, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = false;
          pendingApproval = false; trialStartDate = s.trialStartDate;
          subscriptionActive = false; trialDays = s.trialDays;
        });
        count += 1;
      };
    };
    count;
  };

  // ================================================================
  // ADMIN — REVENUE TRACKING
  // ================================================================
  public query func adminGetRevenueStats() : async RevenueStats {

    var totalRevenue : Float = 0.0;
    var monthlyRevenue : Float = 0.0;
    let salonRevenueMap = Map.empty<Nat, Float>();

    // Calculate revenue from completed appointments
    for ((_, appt) in salonAppointmentsV3.entries().toArray().vals()) {
      if (appt.status == "completed") {
        totalRevenue += appt.servicePrice;
        
        // Add to monthly if in current month
        if (isCurrentMonth(appt.createdAt)) {
          monthlyRevenue += appt.servicePrice;
        };

        // Accumulate per salon
        let currentSalonRevenue = switch (salonRevenueMap.get(appt.salonId)) {
          case (null) { 0.0 };
          case (?rev) { rev };
        };
        salonRevenueMap.add(appt.salonId, currentSalonRevenue + appt.servicePrice);
      };
    };

    // Build perSalon array with salon names
    let perSalonArray = salonRevenueMap.entries().toArray().filterMap(func((salonId, revenue)) {
      switch (salonProfilesV3.get(salonId)) {
        case (null) { null };
        case (?salon) { ?(salonId, salon.name, revenue) };
      };
    });

    { totalRevenue; monthlyRevenue; perSalon = perSalonArray };
  };

  // ================================================================
  // SALON OWNER APIs (phone-based)
  // ================================================================
  public func registerSalonByPhone(ownerPhone : Text, name : Text, address : Text, phone : Text, city : Text) : async Nat {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (?_) { Runtime.trap("You already have a registered salon") };
      case (null) {};
    };
    if (countApprovedSalons() >= MAX_SHOPS) {
      Runtime.trap("Maximum shop limit (100) reached.");
    };
    let id = nextSalonId;
    nextSalonId += 1;
    salonProfilesV3.add(id, {
      name; address; phone; city;
      ownerPhone; isActive = false; pendingApproval = true;
      trialStartDate = 0; subscriptionActive = false; trialDays = defaultTrialDays;
    });
    ownerPhoneSalonMap.add(ownerPhone, id);
    id;
  };

  public func updateOwnerSalonByPhone(ownerPhone : Text, name : Text, address : Text, phone : Text, city : Text) : async () {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { Runtime.trap("No salon found for this phone") };
      case (?salonId) {
        switch (salonProfilesV3.get(salonId)) {
          case (null) { Runtime.trap("Salon not found") };
          case (?s) {
            salonProfilesV3.add(salonId, {
              name; address; phone; city;
              ownerPhone = s.ownerPhone; isActive = s.isActive;
              pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
              subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
            });
          };
        };
      };
    };
  };

  public query func getOwnerSalonByPhone(ownerPhone : Text) : async ?SalonWithId {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { null };
      case (?salonId) {
        switch (salonProfilesV3.get(salonId)) {
          case (null) { null };
          case (?s) { ?makeSalonWithId(salonId, s) };
        };
      };
    };
  };

  public query func getOwnerRevenueSummaryByPhone(ownerPhone : Text) : async OwnerRevenueSummary {
    // Look up salon for this owner
    let salonId = switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { Runtime.trap("No salon found for this phone number") };
      case (?id) { id };
    };

    var totalEarnings : Float = 0.0;
    var monthlyEarnings : Float = 0.0;
    var totalAppointments : Nat = 0;
    var completedAppointments : Nat = 0;

    // Calculate statistics for this salon
    for ((_, appt) in salonAppointmentsV3.entries().toArray().vals()) {
      if (appt.salonId == salonId) {
        totalAppointments += 1;
        
        if (appt.status == "completed") {
          completedAppointments += 1;
          totalEarnings += appt.servicePrice;
          
          if (isCurrentMonth(appt.createdAt)) {
            monthlyEarnings += appt.servicePrice;
          };
        };
      };
    };

    { totalEarnings; monthlyEarnings; totalAppointments; completedAppointments };
  };

  public func addSalonServiceByPhone(ownerPhone : Text, salonId : Nat, name : Text, price : Float, durationMinutes : Nat) : async Nat {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { Runtime.trap("You don't own a salon") };
      case (?ownedId) {
        if (ownedId != salonId) { Runtime.trap("You can only add services to your own salon") };
      };
    };
    let id = nextServiceId;
    nextServiceId += 1;
    salonServicesList.add(id, { salonId; name; price; durationMinutes });
    id;
  };

  public func deleteSalonServiceByPhone(ownerPhone : Text, salonId : Nat, serviceId : Nat) : async () {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { Runtime.trap("You don't own a salon") };
      case (?ownedId) {
        if (ownedId != salonId) { Runtime.trap("You can only delete from your own salon") };
        salonServicesList.remove(serviceId);
      };
    };
  };

  public query func getSalonAppointmentsForDateByPhone(ownerPhone : Text, salonId : Nat, date : Text) : async [AppointmentWithId] {
    let callerOwns = switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (?id) { id == salonId };
      case (null) { false };
    };
    if (not callerOwns) { Runtime.trap("Unauthorized") };
    salonAppointmentsV3.entries().toArray().filterMap(func((id, a)) {
      if (a.salonId == salonId and a.date == date) {
        ?{ id; salonId = a.salonId; customerPhone = a.customerPhone;
           customerName = a.customerName;
           serviceName = a.serviceName; queueNumber = a.queueNumber;
           status = a.status; createdAt = a.createdAt; date = a.date;
           servicePrice = a.servicePrice }
      } else { null }
    }).sort(func(a, b) { Nat.compare(a.queueNumber, b.queueNumber) });
  };

  public func updateAppointmentStatusByPhone(ownerPhone : Text, appointmentId : Nat, newStatus : Text) : async () {
    switch (salonAppointmentsV3.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appt) {
        let callerOwns = switch (ownerPhoneSalonMap.get(ownerPhone)) {
          case (?id) { id == appt.salonId };
          case (null) { false };
        };
        if (not callerOwns) { Runtime.trap("Unauthorized") };
        salonAppointmentsV3.add(appointmentId, {
          salonId = appt.salonId; customerPhone = appt.customerPhone;
          customerName = appt.customerName;
          serviceName = appt.serviceName; queueNumber = appt.queueNumber;
          status = newStatus; createdAt = appt.createdAt; date = appt.date;
          servicePrice = appt.servicePrice;
        });
      };
    };
  };

  // ================================================================
  // PUBLIC READ APIs
  // ================================================================
  public query func getAllActiveSalons() : async [SalonWithId] {
    salonProfilesV3.entries().toArray().filterMap(func((id, s)) {
      if (isSalonEffectivelyActive(s)) { ?makeSalonWithId(id, s) } else { null }
    });
  };

  public query func getSalonById(id : Nat) : async ?SalonWithId {
    switch (salonProfilesV3.get(id)) {
      case (null) { null };
      case (?s) { ?makeSalonWithId(id, s) };
    };
  };

  public query func getSalonServices(salonId : Nat) : async [ServiceWithId] {
    salonServicesList.entries().toArray().filterMap(func((id, s)) {
      if (s.salonId == salonId) {
        ?{ id; salonId = s.salonId; name = s.name; price = s.price; durationMinutes = s.durationMinutes }
      } else { null }
    });
  };

  // ================================================================
  // CUSTOMER APIs (phone-based)
  // ================================================================
  public func bookAppointmentByPhone(customerPhone : Text, salonId : Nat, customerName : Text, serviceName : Text, date : Text) : async Nat {
    // Look up service price
    var servicePrice : Float = 0.0;
    label findPrice for ((_, service) in salonServicesList.entries().toArray().vals()) {
      if (service.salonId == salonId and service.name == serviceName) {
        servicePrice := service.price;
        break findPrice;
      };
    };

    let existingCount = salonAppointmentsV3.values().toArray()
      .filter(func(a) { a.salonId == salonId and a.date == date and a.status != "cancelled" }).size();
    let queueNumber = existingCount + 1;
    let id = nextAppointmentId;
    nextAppointmentId += 1;
    salonAppointmentsV3.add(id, {
      salonId; customerPhone;
      customerName;
      serviceName; queueNumber;
      status = "pending"; createdAt = Time.now(); date;
      servicePrice;
    });
    id;
  };

  public query func getMyAppointmentsByPhone(customerPhone : Text) : async [AppointmentWithId] {
    salonAppointmentsV3.entries().toArray().filterMap(func((id, a)) {
      if (a.customerPhone == customerPhone) {
        ?{ id; salonId = a.salonId; customerPhone = a.customerPhone;
           customerName = a.customerName;
           serviceName = a.serviceName; queueNumber = a.queueNumber;
           status = a.status; createdAt = a.createdAt; date = a.date;
           servicePrice = a.servicePrice }
      } else { null }
    });
  };

  public query func getQueueInfo(appointmentId : Nat) : async (Nat, Nat) {
    switch (salonAppointmentsV3.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?myAppt) {
        let ahead = salonAppointmentsV3.values().toArray().filter(func(a) {
          a.salonId == myAppt.salonId and a.date == myAppt.date
          and a.queueNumber < myAppt.queueNumber
          and a.status != "completed" and a.status != "cancelled"
        }).size();
        (myAppt.queueNumber, ahead);
      };
    };
  };

  public func saveCustomerProfileByPhone(phone : Text, name : Text) : async () {
    custProfilesByPhone.add(phone, { name; phone });
  };

  public query func getMyCustomerProfileByPhone(phone : Text) : async ?CustomerProfile {
    custProfilesByPhone.get(phone);
  };

  // ================================================================
  // UPGRADE HOOKS — preserve all data across builds
  // ================================================================
  system func preupgrade() {
    stableAdminPasswordHash := adminPasswordHash;
    stableNextSalonId := nextSalonId;
    stableNextServiceId := nextServiceId;
    stableNextAppointmentId := nextAppointmentId;
    stableDefaultTrialDays := defaultTrialDays;
    stablePlatformPrice := platformSubscriptionPrice;
    stableSalons := salonProfilesV3.entries().toArray();
    stableServices := salonServicesList.entries().toArray();
    stableAppointments := salonAppointmentsV3.entries().toArray();
    stableCustomers := custProfilesByPhone.entries().toArray();
    stableOwnerPhoneMap := ownerPhoneSalonMap.entries().toArray();
  };

  system func postupgrade() {
    for ((k, v) in stableSalons.vals()) { salonProfilesV3.add(k, v) };
    for ((k, v) in stableServices.vals()) { salonServicesList.add(k, v) };
    for ((k, v) in stableAppointments.vals()) { salonAppointmentsV3.add(k, v) };
    for ((k, v) in stableCustomers.vals()) { custProfilesByPhone.add(k, v) };
    for ((k, v) in stableOwnerPhoneMap.vals()) { ownerPhoneSalonMap.add(k, v) };
    // Clear stable arrays after restore to free memory
    stableSalons := [];
    stableServices := [];
    stableAppointments := [];
    stableCustomers := [];
    stableOwnerPhoneMap := [];
  };
};

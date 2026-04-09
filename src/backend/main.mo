import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
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
    latitude : ?Float;
    longitude : ?Float;
    closedDays : [Bool]; // 7 booleans: index 0=Sunday, 1=Monday, ..., 6=Saturday
  };

  // V3 migration: old profile without location fields
  type SalonProfileV3Old = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
  };

  // V3 with location fields but without closedDays — matches previously-deployed salonProfilesV3 map type
  type SalonProfileV3WithLoc = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
    latitude : ?Float;
    longitude : ?Float;
  };

  public type SalonWithId = {
    id : Nat; name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
    latitude : ?Float;
    longitude : ?Float;
    closedDays : [Bool];
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
    customerName : Text; serviceName : Text; queueNumber : Nat;
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
  // TYPES FOR NOTIFICATION SYSTEM
  // ================================================================
  public type ServiceSession = {
    appointmentId : Nat;
    startTime : Int;
    durationMinutes : Nat;
  };

  public type QueueScheduleEntry = {
    appointmentId : Nat;
    estimatedStartTime : Int;
    queueNumber : Nat;
    customerName : Text;
    serviceName : Text;
  };

  public type PushSubscription = {
    endpoint : Text;
    p256dh : Text;
    auth : Text;
  };

  // ================================================================
  // TYPES FOR SUBSCRIPTION REQUEST SYSTEM
  // ================================================================
  public type PlanPricing = {
    planName : Text;
    planDays : Nat;
    originalPrice : Float;
    discountPercent : Float;
  };

  public type SubRequest = {
    id : Nat;
    ownerPhone : Text;
    salonName : Text;
    planName : Text;
    planDays : Nat;
    originalPrice : Float;
    discountPercent : Float;
    finalPrice : Float;
    savings : Float;
    requestTime : Int;
    screenshotBase64 : Text;
    status : Text;
    approvedAt : Int;
  };

  public type SubscriptionHistory = {
    id : Nat;
    salonId : Nat;
    ownerPhone : Text;
    salonName : Text;
    planName : Text;
    planDays : Nat;
    originalPrice : Float;
    discountPercent : Float;
    finalPrice : Float;
    savings : Float;
    startDate : Int;
    endDate : Int;
    approvedAt : Int;
    transactionId : Text;
  };

  public type SalonPhoto = {
    id : Nat;
    salonId : Nat;
    ownerPhone : Text;
    url : Text;
    uploadedAt : Int;
  };

  // ================================================================
  // STATE (V3)
  // ================================================================
  let ADMIN_EMAIL : Text = "amitkrji498@gmail.com";

  // ================================================================
  // STABLE STORAGE (data persists across canister upgrades/builds)
  // ================================================================
  var stableAdminPasswordHash : ?Text = null;
  var stableNextSalonId : Nat = 1;
  var stableNextServiceId : Nat = 1;
  var stableNextAppointmentId : Nat = 1;
  var stableDefaultTrialDays : Nat = 7;
  var stablePlatformPrice : Float = 149.0;
  var stableSalons : [(Nat, SalonProfileV3Old)] = [];
  var stableSalonsOld : [(Nat, SalonProfileV3Old)] = [];
  var stableServices : [(Nat, SalonService)] = [];
  var stableAppointments : [(Nat, Appointment)] = [];
  var stableCustomers : [(Text, CustomerProfile)] = [];
  var stableOwnerPhoneMap : [(Text, Nat)] = [];
  var stableOwnerPasswords : [(Text, Text)] = [];
  var stableServiceSessions : [(Nat, ServiceSession)] = [];
  var stableNotifiedAppointments : [Nat] = [];
  var stablePushSubscriptions : [(Text, PushSubscription)] = [];
  var stableNextSubRequestId : Nat = 1;
  var stableSubRequests : [(Nat, SubRequest)] = [];
  var stablePlanPricings : [(Text, PlanPricing)] = [];
  var stableNextSubHistoryId : Nat = 1;
  var stableSubHistory : [(Nat, SubscriptionHistory)] = [];
  var stableNextPhotoId : Nat = 1;
  var stablePhotos : [(Nat, SalonPhoto)] = [];
  var stableSalonClosedDays : [(Nat, [Bool])] = [];

  // State vars — auto-restored from stable memory on upgrade
  var adminPasswordHash : ?Text = stableAdminPasswordHash;
  var nextSalonId        : Nat = stableNextSalonId;
  var nextServiceId      : Nat = stableNextServiceId;
  var nextAppointmentId  : Nat = stableNextAppointmentId;
  var defaultTrialDays   : Nat = stableDefaultTrialDays;
  var platformSubscriptionPrice : Float = stablePlatformPrice;
  var nextSubRequestId   : Nat = stableNextSubRequestId;
  var nextSubHistoryId   : Nat = stableNextSubHistoryId;
  var nextPhotoId        : Nat = stableNextPhotoId;
  let MAX_SHOPS          : Nat = 100;

  // V3 maps (phone-keyed) — filled from stable in postupgrade
  let salonProfilesV3    = Map.empty<Nat, SalonProfileV3WithLoc>();
  let salonClosedDaysMapV3 = Map.empty<Nat, [Bool]>();
  let salonServicesList  = Map.empty<Nat, SalonService>();
  let salonAppointmentsV3 = Map.empty<Nat, Appointment>();
  let custProfilesByPhone = Map.empty<Text, CustomerProfile>();
  let ownerPhoneSalonMap  = Map.empty<Text, Nat>();
  let ownerPasswordMap    = Map.empty<Text, Text>();

  // Notification system state
  let serviceSessionsBySalon = Map.empty<Nat, ServiceSession>();
  let notifiedAppointments = Map.empty<Nat, Bool>();
  let pushSubscriptionsByPhone = Map.empty<Text, PushSubscription>();

  // Subscription request maps
  let subRequestsMap = Map.empty<Nat, SubRequest>();
  let planPricingsMap = Map.empty<Text, PlanPricing>();
  let subHistoryMap = Map.empty<Nat, SubscriptionHistory>();
  let salonPhotosMap = Map.empty<Nat, SalonPhoto>();

  // ================================================================
  // AUTHORIZATION HELPERS
  // ================================================================
  func requireAdminAuth(email : Text, passwordHash : Text) {
    if (email != ADMIN_EMAIL) {
      Runtime.trap("Unauthorized: Invalid admin credentials");
    };
    switch (adminPasswordHash) {
      case (null) {
        Runtime.trap("Unauthorized: Admin password not set");
      };
      case (?stored) {
        if (stored != passwordHash) {
          Runtime.trap("Unauthorized: Invalid admin credentials");
        };
      };
    };
  };

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

  // Merge base profile + closedDays into full SalonProfile
  func toFullProfile(base : SalonProfileV3WithLoc, salonId : Nat) : SalonProfile {
    let days = switch (salonClosedDaysMapV3.get(salonId)) {
      case (?d) { d };
      case (null) { [false, false, false, false, false, false, false] };
    };
    { name = base.name; address = base.address; phone = base.phone; city = base.city;
      ownerPhone = base.ownerPhone; isActive = base.isActive;
      pendingApproval = base.pendingApproval; trialStartDate = base.trialStartDate;
      subscriptionActive = base.subscriptionActive; trialDays = base.trialDays;
      latitude = base.latitude; longitude = base.longitude;
      closedDays = days };
  };

  func getSalonFull(salonId : Nat) : ?SalonProfile {
    switch (salonProfilesV3.get(salonId)) {
      case (null) { null };
      case (?base) { ?toFullProfile(base, salonId) };
    };
  };

  func putSalonFull(salonId : Nat, s : SalonProfile) {
    salonProfilesV3.add(salonId, {
      name = s.name; address = s.address; phone = s.phone; city = s.city;
      ownerPhone = s.ownerPhone; isActive = s.isActive;
      pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
      subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
      latitude = s.latitude; longitude = s.longitude;
    });
    salonClosedDaysMapV3.add(salonId, s.closedDays);
  };

  func makeSalonWithId(id : Nat, s : SalonProfile) : SalonWithId {
    { id; name = s.name; address = s.address; phone = s.phone;
      city = s.city; ownerPhone = s.ownerPhone; isActive = s.isActive;
      pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
      subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
      latitude = s.latitude; longitude = s.longitude;
      closedDays = s.closedDays };
  };

  func countApprovedSalons() : Nat {
    var count : Nat = 0;
    for ((id, base) in salonProfilesV3.entries().toArray().vals()) {
      let s = toFullProfile(base, id);
      if (not s.pendingApproval) { count += 1 };
    };
    count;
  };

  func getCurrentMonthStart() : Int {
    let now = Time.now();
    let nanosPerDay : Int = 86_400_000_000_000;
    let daysSinceEpoch = now / nanosPerDay;
    let yearsSinceEpoch = daysSinceEpoch / 365;
    let daysInYear = daysSinceEpoch - (yearsSinceEpoch * 365);
    let month = (daysInYear / 30) + 1;
    let daysToMonthStart = (yearsSinceEpoch * 365) + ((month - 1) * 30);
    daysToMonthStart * nanosPerDay;
  };

  func isCurrentMonth(timestamp : Int) : Bool {
    let monthStart = getCurrentMonthStart();
    timestamp >= monthStart;
  };

  func getDefaultPlanPricing(planName : Text) : PlanPricing {
    if (planName == "30 दिन") {
      { planName; planDays = 30; originalPrice = 149.0; discountPercent = 0.0 }
    } else if (planName == "90 दिन") {
      { planName; planDays = 90; originalPrice = 399.0; discountPercent = 0.0 }
    } else if (planName == "120 दिन") {
      { planName; planDays = 120; originalPrice = 499.0; discountPercent = 0.0 }
    } else {
      { planName; planDays = 365; originalPrice = 1299.0; discountPercent = 0.0 }
    };
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
  public query func adminGetSubscriptionPrice(email : Text, passwordHash : Text) : async Float {
    requireAdminAuth(email, passwordHash);
    platformSubscriptionPrice;
  };

  public func adminSetSubscriptionPrice(email : Text, passwordHash : Text, price : Float) : async () {
    requireAdminAuth(email, passwordHash);
    if (price < 0.0) { Runtime.trap("Price must be non-negative") };
    platformSubscriptionPrice := price;
  };

  // ================================================================
  // ADMIN — DASHBOARD
  // ================================================================
  public query func adminGetDashboardStats(email : Text, passwordHash : Text) : async DashboardStats {
    requireAdminAuth(email, passwordHash);
    var total : Nat = 0; var active : Nat = 0;
    var expired : Nat = 0; var pending : Nat = 0;
    for ((id, base) in salonProfilesV3.entries().toArray().vals()) {
      let s = toFullProfile(base, id);
      if (s.pendingApproval) { pending += 1 }
      else {
        total += 1;
        if (isSalonEffectivelyActive(s)) { active += 1 } else { expired += 1 };
      };
    };
    { total; active; expired; pending };
  };

  public query func adminGetAllSalons(email : Text, passwordHash : Text) : async [SalonWithId] {
    requireAdminAuth(email, passwordHash);
    salonProfilesV3.entries().toArray()
      .filterMap(func((id, base)) {
        let s = toFullProfile(base, id);
        if (not s.pendingApproval) { ?makeSalonWithId(id, s) } else { null }
      });
  };

  public query func adminGetPendingSalons(email : Text, passwordHash : Text) : async [SalonWithId] {
    requireAdminAuth(email, passwordHash);
    salonProfilesV3.entries().toArray()
      .filterMap(func((id, base)) {
        let s = toFullProfile(base, id);
        if (s.pendingApproval) { ?makeSalonWithId(id, s) } else { null }
      });
  };

  public func adminApproveSalon(email : Text, passwordHash : Text, salonId : Nat) : async () {
    requireAdminAuth(email, passwordHash);
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = true;
          pendingApproval = false; trialStartDate = Time.now();
          subscriptionActive = false; trialDays = s.trialDays;
          latitude = s.latitude; longitude = s.longitude;
        });
      };
    };
  };

  public func adminRejectSalon(email : Text, passwordHash : Text, salonId : Nat) : async () {
    requireAdminAuth(email, passwordHash);
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.remove(salonId);
        ownerPhoneSalonMap.remove(s.ownerPhone);
      };
    };
  };

  public func adminSetSalonActive(email : Text, passwordHash : Text, salonId : Nat, active : Bool) : async () {
    requireAdminAuth(email, passwordHash);
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = active;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
          latitude = s.latitude; longitude = s.longitude;
        });
      };
    };
  };

  public func adminSetSalonSubscription(email : Text, passwordHash : Text, salonId : Nat, active : Bool) : async () {
    requireAdminAuth(email, passwordHash);
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = s.isActive;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = active; trialDays = s.trialDays;
          latitude = s.latitude; longitude = s.longitude;
        });
      };
    };
  };

  public query func adminGetDefaultTrialDays(email : Text, passwordHash : Text) : async Nat {
    requireAdminAuth(email, passwordHash);
    defaultTrialDays;
  };

  public func adminSetDefaultTrialDays(email : Text, passwordHash : Text, days : Nat) : async () {
    requireAdminAuth(email, passwordHash);
    if (days == 0) { Runtime.trap("Trial days must be at least 1") };
    defaultTrialDays := days;
  };

  public func adminSetSalonTrialDays(email : Text, passwordHash : Text, salonId : Nat, days : Nat) : async () {
    requireAdminAuth(email, passwordHash);
    if (days == 0) { Runtime.trap("Trial days must be at least 1") };
    switch (salonProfilesV3.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV3.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = s.isActive;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = s.subscriptionActive; trialDays = days;
          latitude = s.latitude; longitude = s.longitude;
        });
      };
    };
  };

  public func adminProcessTrialExpirations(email : Text, passwordHash : Text) : async Nat {
    requireAdminAuth(email, passwordHash);
    var count : Nat = 0;
    for ((id, s) in salonProfilesV3.entries().toArray().vals()) {
      let full = toFullProfile(s, id);
      if (s.isActive and not s.pendingApproval and not s.subscriptionActive and isTrialExpired(full)) {
        salonProfilesV3.add(id, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPhone = s.ownerPhone; isActive = false;
          pendingApproval = false; trialStartDate = s.trialStartDate;
          subscriptionActive = false; trialDays = s.trialDays;
          latitude = s.latitude; longitude = s.longitude;
        });
        count += 1;
      };
    };
    count;
  };

  // ================================================================
  // ADMIN — REVENUE TRACKING
  // ================================================================
  public query func adminGetRevenueStats(email : Text, passwordHash : Text) : async RevenueStats {
    requireAdminAuth(email, passwordHash);
    var totalRevenue : Float = 0.0;
    var monthlyRevenue : Float = 0.0;
    let salonRevenueMap = Map.empty<Nat, Float>();

    for ((_, appt) in salonAppointmentsV3.entries().toArray().vals()) {
      if (appt.status == "completed") {
        totalRevenue += appt.servicePrice;
        if (isCurrentMonth(appt.createdAt)) {
          monthlyRevenue += appt.servicePrice;
        };
        let currentSalonRevenue = switch (salonRevenueMap.get(appt.salonId)) {
          case (null) { 0.0 };
          case (?rev) { rev };
        };
        salonRevenueMap.add(appt.salonId, currentSalonRevenue + appt.servicePrice);
      };
    };

    let perSalonArray = salonRevenueMap.entries().toArray().filterMap(func((salonId, revenue)) {
      switch (salonProfilesV3.get(salonId)) {
        case (null) { null };
        case (?salon) { ?(salonId, salon.name, revenue) };
      };
    });
    { totalRevenue; monthlyRevenue; perSalon = perSalonArray };
  };

  // ================================================================
  // ADMIN — BACKUP & RESTORE
  // ================================================================
  public query func adminGetAllSalonsForBackup(email : Text, passwordHash : Text) : async [SalonWithId] {
    requireAdminAuth(email, passwordHash);
    salonProfilesV3.entries().toArray().map(func((id, base)) {
      makeSalonWithId(id, toFullProfile(base, id))
    });
  };

  public query func adminGetAllServicesForBackup(email : Text, passwordHash : Text) : async [ServiceWithId] {
    requireAdminAuth(email, passwordHash);
    salonServicesList.entries().toArray().map(func((id, s)) {
      { id; salonId = s.salonId; name = s.name; price = s.price; durationMinutes = s.durationMinutes }
    });
  };

  public query func adminGetAllAppointmentsForBackup(email : Text, passwordHash : Text) : async [AppointmentWithId] {
    requireAdminAuth(email, passwordHash);
    salonAppointmentsV3.entries().toArray().map(func((id, a)) {
      { id; salonId = a.salonId; customerPhone = a.customerPhone;
        customerName = a.customerName; serviceName = a.serviceName;
        queueNumber = a.queueNumber; status = a.status;
        createdAt = a.createdAt; date = a.date; servicePrice = a.servicePrice }
    });
  };

  public query func adminGetAllCustomersForBackup(email : Text, passwordHash : Text) : async [CustomerProfile] {
    requireAdminAuth(email, passwordHash);
    custProfilesByPhone.values().toArray();
  };

  public query func adminGetOwnerPhoneMapForBackup(email : Text, passwordHash : Text) : async [(Text, Nat)] {
    requireAdminAuth(email, passwordHash);
    ownerPhoneSalonMap.entries().toArray();
  };

  public query func adminGetNextIdsForBackup(email : Text, passwordHash : Text) : async (Nat, Nat, Nat) {
    requireAdminAuth(email, passwordHash);
    (nextSalonId, nextServiceId, nextAppointmentId);
  };

  public func adminRestoreAllData(
    email : Text,
    passwordHash : Text,
    salons : [SalonWithId],
    svcs : [ServiceWithId],
    appts : [AppointmentWithId],
    custs : [CustomerProfile],
    ownerPhoneMap : [(Text, Nat)],
    nSalonId : Nat,
    nServiceId : Nat,
    nAppointmentId : Nat
  ) : async () {
    requireAdminAuth(email, passwordHash);
    for ((k, _) in salonProfilesV3.entries().toArray().vals()) {
      salonProfilesV3.remove(k);
    };
    for ((k, _) in salonServicesList.entries().toArray().vals()) {
      salonServicesList.remove(k);
    };
    for ((k, _) in salonAppointmentsV3.entries().toArray().vals()) {
      salonAppointmentsV3.remove(k);
    };
    for ((k, _) in custProfilesByPhone.entries().toArray().vals()) {
      custProfilesByPhone.remove(k);
    };
    for ((k, _) in ownerPhoneSalonMap.entries().toArray().vals()) {
      ownerPhoneSalonMap.remove(k);
    };
    for (s in salons.vals()) {
      salonProfilesV3.add(s.id, {
        name = s.name; address = s.address; phone = s.phone; city = s.city;
        ownerPhone = s.ownerPhone; isActive = s.isActive;
        pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
        subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
        latitude = s.latitude; longitude = s.longitude;
      });
      salonClosedDaysMapV3.add(s.id, s.closedDays);
    };
    for (svc in svcs.vals()) {
      salonServicesList.add(svc.id, {
        salonId = svc.salonId; name = svc.name;
        price = svc.price; durationMinutes = svc.durationMinutes;
      });
    };
    for (a in appts.vals()) {
      salonAppointmentsV3.add(a.id, {
        salonId = a.salonId; customerPhone = a.customerPhone;
        customerName = a.customerName; serviceName = a.serviceName;
        queueNumber = a.queueNumber; status = a.status;
        createdAt = a.createdAt; date = a.date; servicePrice = a.servicePrice;
      });
    };
    for (c in custs.vals()) {
      custProfilesByPhone.add(c.phone, c);
    };
    for ((phone, sId) in ownerPhoneMap.vals()) {
      ownerPhoneSalonMap.add(phone, sId);
    };
    nextSalonId := nSalonId;
    nextServiceId := nServiceId;
    nextAppointmentId := nAppointmentId;
  };

  // ================================================================
  // SALON OWNER AUTH V2 — password-based
  // ================================================================
  public func salonOwnerRegisterV2(
    ownerPhone : Text,
    salonName : Text,
    services : [Text],
    passwordHash : Text
  ) : async Text {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (?_) { return "already_registered" };
      case (null) {};
    };
    if (countApprovedSalons() >= MAX_SHOPS) {
      return "limit_reached";
    };
    let id = nextSalonId;
    nextSalonId += 1;
    salonProfilesV3.add(id, {
      name = salonName; address = ""; phone = ownerPhone; city = "";
      ownerPhone; isActive = false; pendingApproval = true;
      trialStartDate = 0; subscriptionActive = false; trialDays = defaultTrialDays;
      latitude = null; longitude = null;
    });
    ownerPhoneSalonMap.add(ownerPhone, id);
    ownerPasswordMap.add(ownerPhone, passwordHash);
    for (serviceName in services.vals()) {
      if (serviceName != "") {
        let svcId = nextServiceId;
        nextServiceId += 1;
        salonServicesList.add(svcId, {
          salonId = id; name = serviceName; price = 0.0; durationMinutes = 30;
        });
      };
    };
    "ok"
  };

  public query func salonOwnerLogin(
    ownerPhone : Text,
    passwordHash : Text
  ) : async (Text, ?SalonWithId) {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { return ("not_found", null) };
      case (?salonId) {
        switch (ownerPasswordMap.get(ownerPhone)) {
          case (null) { return ("no_password", null) };
          case (?stored) {
            if (stored != passwordHash) {
              return ("wrong_password", null);
            };
            switch (salonProfilesV3.get(salonId)) {
              case (null) { return ("not_found", null) };
              case (?salon) {
                let full = toFullProfile(salon, salonId);
                if (salon.pendingApproval) {
                  return ("pending", ?makeSalonWithId(salonId, full));
                } else if (not salon.isActive) {
                  return ("inactive", ?makeSalonWithId(salonId, full));
                } else {
                  return ("approved", ?makeSalonWithId(salonId, full));
                };
              };
            };
          };
        };
      };
    };
  };

  public func salonOwnerSetPassword(ownerPhone : Text, passwordHash : Text) : async Bool {
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { return false };
      case (?_) {
        switch (ownerPasswordMap.get(ownerPhone)) {
          case (?_) { return false };
          case (null) {
            ownerPasswordMap.add(ownerPhone, passwordHash);
            true
          };
        };
      };
    };
  };

  public func adminResetOwnerPassword(email : Text, passwordHash : Text, ownerPhone : Text, newPasswordHash : Text) : async Bool {
    requireAdminAuth(email, passwordHash);
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { return false };
      case (?_) {
        ownerPasswordMap.add(ownerPhone, newPasswordHash);
        true
      };
    };
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
      latitude = null; longitude = null;
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
              latitude = s.latitude; longitude = s.longitude;
            });
          };
        };
      };
    };
  };

  public func updateSalonLocation(ownerPhone : Text, passwordHash : Text, latitude : Float, longitude : Float) : async Bool {
    switch (ownerPasswordMap.get(ownerPhone)) {
      case (null) { return false };
      case (?stored) {
        if (stored != passwordHash) { return false };
      };
    };
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { return false };
      case (?salonId) {
        switch (salonProfilesV3.get(salonId)) {
          case (null) { return false };
          case (?s) {
            salonProfilesV3.add(salonId, {
              name = s.name; address = s.address; phone = s.phone; city = s.city;
              ownerPhone = s.ownerPhone; isActive = s.isActive;
              pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
              subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
              latitude = ?latitude; longitude = ?longitude;
            });
            true
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
          case (?base) { ?makeSalonWithId(salonId, toFullProfile(base, salonId)) };
        };
      };
    };
  };

  public query func getOwnerRevenueSummaryByPhone(ownerPhone : Text) : async OwnerRevenueSummary {
    let salonId = switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { Runtime.trap("No salon found for this phone number") };
      case (?id) { id };
    };

    var totalEarnings : Float = 0.0;
    var monthlyEarnings : Float = 0.0;
    var totalAppointments : Nat = 0;
    var completedAppointments : Nat = 0;

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
    salonProfilesV3.entries().toArray().filterMap(func((id, base)) {
      let s = toFullProfile(base, id);
      if (isSalonEffectivelyActive(s)) { ?makeSalonWithId(id, s) } else { null }
    });
  };

  public query func getSalonById(id : Nat) : async ?SalonWithId {
    switch (salonProfilesV3.get(id)) {
      case (null) { null };
      case (?base) { ?makeSalonWithId(id, toFullProfile(base, id)) };
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
    // Validate salon exists and check closed days
    switch (getSalonFull(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?salon) {
        // Parse date (YYYY-MM-DD) to get day of week
        // index 0=Sunday, 1=Monday, ..., 6=Saturday
        let parts = date.split(#char '-');
        let partsArr = parts.toArray();
        if (partsArr.size() == 3) {
          switch (Nat.fromText(partsArr[0]), Nat.fromText(partsArr[1]), Nat.fromText(partsArr[2])) {
            case (?y, ?m, ?d) {
              // Tomohiko Sakamoto's algorithm for day of week
              let t : [Nat] = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
              var year = y;
              if (m < 3) { year -= 1 };
              let dow = (year + year / 4 - year / 100 + year / 400 + t[m - 1] + d) % 7;
              // dow: 0=Sunday, 1=Monday, ..., 6=Saturday
              if (dow < salon.closedDays.size() and salon.closedDays[dow]) {
                Runtime.trap("Yeh salon is din band rehta hai");
              };
            };
            case (_) {};
          };
        };
      };
    };

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
  // SERVICE SESSION TIMER
  // ================================================================
  public func startServiceSession(ownerPhone : Text, appointmentId : Nat, durationMinutes : Nat) : async () {
    let appt = switch (salonAppointmentsV3.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?a) { a };
    };
    let callerOwns = switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (?id) { id == appt.salonId };
      case (null) { false };
    };
    if (not callerOwns) { Runtime.trap("Unauthorized") };
    serviceSessionsBySalon.add(appt.salonId, {
      appointmentId;
      startTime = Time.now();
      durationMinutes;
    });
  };

  public query func getCurrentServiceSession(salonId : Nat) : async ?ServiceSession {
    serviceSessionsBySalon.get(salonId);
  };

  public func clearServiceSession(ownerPhone : Text) : async () {
    let salonId = switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { Runtime.trap("No salon found for this phone") };
      case (?id) { id };
    };
    serviceSessionsBySalon.remove(salonId);
  };

  // ================================================================
  // QUEUE SCHEDULE
  // ================================================================
  public query func getQueueScheduleForSalon(salonId : Nat, date : Text) : async [QueueScheduleEntry] {
    let currentSession = serviceSessionsBySalon.get(salonId);
    let appts = salonAppointmentsV3.entries().toArray().filterMap(func((id, a)) {
      if (a.salonId == salonId and a.date == date and
          a.status != "completed" and a.status != "cancelled") {
        ?{ id; appt = a }
      } else { null }
    }).sort(func(a, b) { Nat.compare(a.appt.queueNumber, b.appt.queueNumber) });

    var currentTime = switch (currentSession) {
      case (null) { Time.now() };
      case (?session) {
        session.startTime + (session.durationMinutes * 60 * 1_000_000_000)
      };
    };

    appts.map(func(entry) {
      var serviceDuration : Nat = 30;
      label findDuration for ((_, svc) in salonServicesList.entries().toArray().vals()) {
        if (svc.salonId == salonId and svc.name == entry.appt.serviceName) {
          serviceDuration := svc.durationMinutes;
          break findDuration;
        };
      };
      let estimatedStart = currentTime;
      currentTime += serviceDuration * 60 * 1_000_000_000;
      {
        appointmentId = entry.id;
        estimatedStartTime = estimatedStart;
        queueNumber = entry.appt.queueNumber;
        customerName = entry.appt.customerName;
        serviceName = entry.appt.serviceName;
      }
    });
  };

  // ================================================================
  // NOTIFICATION SYSTEM
  // ================================================================
  public shared ({ caller }) func getPendingNotifications(salonId : Nat, date : Text) : async [Nat] {
    let now = Time.now();
    let twentyMinutesInNanos : Int = 20 * 60 * 1_000_000_000;
    let schedule = await getQueueScheduleForSalon(salonId, date);
    schedule.filterMap(func(entry) {
      let timeUntilStart = entry.estimatedStartTime - now;
      let alreadyNotified = switch (notifiedAppointments.get(entry.appointmentId)) {
        case (?true) { true };
        case (_) { false };
      };
      if (timeUntilStart <= twentyMinutesInNanos and timeUntilStart > 0 and not alreadyNotified) {
        ?entry.appointmentId
      } else { null }
    });
  };

  public func markNotificationSent(ownerPhone : Text, appointmentId : Nat) : async () {
    let appt = switch (salonAppointmentsV3.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?a) { a };
    };
    let callerOwns = switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (?id) { id == appt.salonId };
      case (null) { false };
    };
    if (not callerOwns) { Runtime.trap("Unauthorized") };
    notifiedAppointments.add(appointmentId, true);
  };

  // ================================================================
  // PUSH SUBSCRIPTIONS
  // ================================================================
  public func savePushSubscription(
    customerPhone : Text,
    endpoint : Text,
    p256dh : Text,
    auth : Text
  ) : async () {
    pushSubscriptionsByPhone.add(customerPhone, { endpoint; p256dh; auth });
  };

  public query func getPushSubscription(requestorPhone : Text, customerPhone : Text) : async ?PushSubscription {
    if (requestorPhone == customerPhone) {
      return pushSubscriptionsByPhone.get(customerPhone);
    };
    switch (ownerPhoneSalonMap.get(requestorPhone)) {
      case (?_) { return pushSubscriptionsByPhone.get(customerPhone) };
      case (null) {
        Runtime.trap("Unauthorized");
      };
    };
  };

  // ================================================================
  // PLAN PRICING — Admin controlled
  // ================================================================
  public query func adminGetAllPlanPricings(email : Text, passwordHash : Text) : async [PlanPricing] {
    requireAdminAuth(email, passwordHash);
    let planNames = ["30 दिन", "90 दिन", "120 दिन", "365 दिन"];
    planNames.map(func(name) {
      switch (planPricingsMap.get(name)) {
        case (?p) { p };
        case (null) { getDefaultPlanPricing(name) };
      };
    });
  };

  public func adminSetPlanPricing(email : Text, passwordHash : Text, planName : Text, originalPrice : Float, discountPercent : Float) : async () {
    requireAdminAuth(email, passwordHash);
    if (originalPrice < 0.0) { Runtime.trap("Price must be non-negative") };
    if (discountPercent < 0.0 or discountPercent > 100.0) { Runtime.trap("Discount must be 0-100") };
    let planDays : Nat = if (planName == "30 दिन") { 30 }
      else if (planName == "90 दिन") { 90 }
      else if (planName == "120 दिन") { 120 }
      else { 365 };
    planPricingsMap.add(planName, { planName; planDays; originalPrice; discountPercent });
  };

  public query func getPlanPricings() : async [PlanPricing] {
    let planNames = ["30 दिन", "90 दिन", "120 दिन", "365 दिन"];
    planNames.map(func(name) {
      switch (planPricingsMap.get(name)) {
        case (?p) { p };
        case (null) { getDefaultPlanPricing(name) };
      };
    });
  };

  // ================================================================
  // SUBSCRIPTION REQUESTS — Full backend system
  // ================================================================

  public func submitSubscriptionRequest(
    ownerPhone : Text,
    salonName : Text,
    planName : Text,
    planDays : Nat,
    originalPrice : Float,
    discountPercent : Float,
    finalPrice : Float,
    savings : Float,
    screenshotBase64 : Text
  ) : async Nat {
    let id = nextSubRequestId;
    nextSubRequestId += 1;
    subRequestsMap.add(id, {
      id;
      ownerPhone;
      salonName;
      planName;
      planDays;
      originalPrice;
      discountPercent;
      finalPrice;
      savings;
      requestTime = Time.now();
      screenshotBase64;
      status = "pending";
      approvedAt = 0;
    });
    id;
  };

  public query func adminGetAllSubRequests(email : Text, passwordHash : Text) : async [SubRequest] {
    requireAdminAuth(email, passwordHash);
    subRequestsMap.values().toArray();
  };

  public query func adminGetPendingSubRequests(email : Text, passwordHash : Text) : async [SubRequest] {
    requireAdminAuth(email, passwordHash);
    subRequestsMap.values().toArray().filter(func(r) { r.status == "pending" });
  };

  public query func getMySubRequests(ownerPhone : Text) : async [SubRequest] {
    subRequestsMap.values().toArray().filter(func(r) { r.ownerPhone == ownerPhone });
  };

  public func adminApproveSubRequest(email : Text, passwordHash : Text, requestId : Nat) : async Bool {
    requireAdminAuth(email, passwordHash);
    switch (subRequestsMap.get(requestId)) {
      case (null) { return false };
      case (?req) {
        if (req.status != "pending") { return false };

        let approvedAt = Time.now();
        subRequestsMap.add(requestId, {
          id = req.id;
          ownerPhone = req.ownerPhone;
          salonName = req.salonName;
          planName = req.planName;
          planDays = req.planDays;
          originalPrice = req.originalPrice;
          discountPercent = req.discountPercent;
          finalPrice = req.finalPrice;
          savings = req.savings;
          requestTime = req.requestTime;
          screenshotBase64 = req.screenshotBase64;
          status = "approved";
          approvedAt;
        });

        switch (ownerPhoneSalonMap.get(req.ownerPhone)) {
          case (null) {};
          case (?salonId) {
            switch (salonProfilesV3.get(salonId)) {
              case (null) {};
              case (?s) {
                salonProfilesV3.add(salonId, {
                  name = s.name; address = s.address; phone = s.phone; city = s.city;
                  ownerPhone = s.ownerPhone; isActive = true;
                  pendingApproval = false; trialStartDate = s.trialStartDate;
                  subscriptionActive = true; trialDays = s.trialDays;
                  latitude = s.latitude; longitude = s.longitude;
                });

                let startDate = Time.now();
                let endDate = startDate + (req.planDays * 86_400 * 1_000_000_000);
                let historyId = nextSubHistoryId;
                nextSubHistoryId += 1;
                subHistoryMap.add(historyId, {
                  id = historyId;
                  salonId;
                  ownerPhone = req.ownerPhone;
                  salonName = req.salonName;
                  planName = req.planName;
                  planDays = req.planDays;
                  originalPrice = req.originalPrice;
                  discountPercent = req.discountPercent;
                  finalPrice = req.finalPrice;
                  savings = req.savings;
                  startDate;
                  endDate;
                  approvedAt;
                  transactionId = requestId.toText();
                });
              };
            };
          };
        };
        true
      };
    };
  };

  public func adminRejectSubRequest(email : Text, passwordHash : Text, requestId : Nat) : async Bool {
    requireAdminAuth(email, passwordHash);
    switch (subRequestsMap.get(requestId)) {
      case (null) { return false };
      case (?req) {
        if (req.status != "pending") { return false };
        subRequestsMap.add(requestId, {
          id = req.id;
          ownerPhone = req.ownerPhone;
          salonName = req.salonName;
          planName = req.planName;
          planDays = req.planDays;
          originalPrice = req.originalPrice;
          discountPercent = req.discountPercent;
          finalPrice = req.finalPrice;
          savings = req.savings;
          requestTime = req.requestTime;
          screenshotBase64 = req.screenshotBase64;
          status = "rejected";
          approvedAt = 0;
        });
        true
      };
    };
  };

  public func adminExpireOldSubRequests(email : Text, passwordHash : Text) : async Nat {
    requireAdminAuth(email, passwordHash);
    let twoHoursNanos : Int = 2 * 60 * 60 * 1_000_000_000;
    let now = Time.now();
    var count : Nat = 0;
    for ((id, req) in subRequestsMap.entries().toArray().vals()) {
      if (req.status == "pending" and (now - req.requestTime) > twoHoursNanos) {
        subRequestsMap.add(id, {
          id = req.id;
          ownerPhone = req.ownerPhone;
          salonName = req.salonName;
          planName = req.planName;
          planDays = req.planDays;
          originalPrice = req.originalPrice;
          discountPercent = req.discountPercent;
          finalPrice = req.finalPrice;
          savings = req.savings;
          requestTime = req.requestTime;
          screenshotBase64 = req.screenshotBase64;
          status = "expired";
          approvedAt = 0;
        });
        count += 1;
      };
    };
    count;
  };

  public query func adminGetSubRequestEarnings(email : Text, passwordHash : Text) : async (Float, Float, Nat) {
    requireAdminAuth(email, passwordHash);
    var total : Float = 0.0;
    var monthly : Float = 0.0;
    var approvedCount : Nat = 0;
    for ((_, req) in subRequestsMap.entries().toArray().vals()) {
      if (req.status == "approved") {
        total += req.finalPrice;
        approvedCount += 1;
        if (isCurrentMonth(req.approvedAt)) {
          monthly += req.finalPrice;
        };
      };
    };
    (total, monthly, approvedCount);
  };

  public query func adminGetSubHistory(email : Text, passwordHash : Text) : async [SubscriptionHistory] {
    requireAdminAuth(email, passwordHash);
    subHistoryMap.values().toArray().sort(func(a, b) { Int.compare(b.approvedAt, a.approvedAt) });
  };

  public query func getMySubHistory(ownerPhone : Text) : async [SubscriptionHistory] {
    subHistoryMap.values().toArray().filter(func(h) { h.ownerPhone == ownerPhone }).sort(func(a, b) { Int.compare(b.approvedAt, a.approvedAt) });
  };


  // ================================================================
  // SALON PHOTOS
  // ================================================================
  public func uploadSalonPhoto(ownerPhone : Text, passwordHash : Text, url : Text) : async Nat {
    switch (ownerPasswordMap.get(ownerPhone)) {
      case (null) { Runtime.trap("Owner not found") };
      case (?stored) {
        if (stored != passwordHash) { Runtime.trap("Invalid credentials") };
      };
    };
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?salonId) {
        let existing = salonPhotosMap.values().toArray().filter(func(p) { p.salonId == salonId });
        if (existing.size() >= 10) { Runtime.trap("Max 10 photos allowed") };
        let photoId = nextPhotoId;
        nextPhotoId += 1;
        let photo : SalonPhoto = {
          id = photoId;
          salonId;
          ownerPhone;
          url;
          uploadedAt = Time.now();
        };
        salonPhotosMap.add(photoId, photo);
        photoId
      };
    };
  };

  public query func getSalonPhotos(salonId : Nat) : async [SalonPhoto] {
    salonPhotosMap.values().toArray().filter(func(p) { p.salonId == salonId })
  };

  public func deleteSalonPhoto(ownerPhone : Text, passwordHash : Text, photoId : Nat) : async Bool {
    switch (ownerPasswordMap.get(ownerPhone)) {
      case (null) { Runtime.trap("Owner not found") };
      case (?stored) {
        if (stored != passwordHash) { Runtime.trap("Invalid credentials") };
      };
    };
    switch (salonPhotosMap.get(photoId)) {
      case (null) { false };
      case (?photo) {
        if (photo.ownerPhone != ownerPhone) { Runtime.trap("Not your photo") };
        ignore salonPhotosMap.remove(photoId);
        true
      };
    };
  };

  // ================================================================
  // SALON CLOSED DAYS
  // ================================================================
  public func setSalonClosedDays(ownerPhone : Text, passwordHash : Text, closedDays : [Bool]) : async { #ok; #err : Text } {
    switch (ownerPasswordMap.get(ownerPhone)) {
      case (null) { return #err("Owner not found") };
      case (?stored) {
        if (stored != passwordHash) { return #err("Invalid credentials") };
      };
    };
    if (closedDays.size() != 7) {
      return #err("closedDays must have exactly 7 elements (one per day of the week)");
    };
    switch (ownerPhoneSalonMap.get(ownerPhone)) {
      case (null) { return #err("Salon not found") };
      case (?salonId) {
        switch (salonProfilesV3.get(salonId)) {
          case (null) { return #err("Salon profile not found") };
          case (?_) {
            salonClosedDaysMapV3.add(salonId, closedDays);
            #ok
          };
        };
      };
    };
  };

  public query func getSalonClosedDays(salonId : Nat) : async { #ok : [Bool]; #err : Text } {
    switch (salonProfilesV3.get(salonId)) {
      case (null) { #err("Salon not found") };
      case (?_) {
        let days = switch (salonClosedDaysMapV3.get(salonId)) {
          case (?d) { d };
          case (null) { [false, false, false, false, false, false, false] };
        };
        #ok(days)
      };
    };
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
    stableSalons := salonProfilesV3.entries().toArray().map(func((k, v)) {
      (k, {
        name = v.name; address = v.address; phone = v.phone; city = v.city;
        ownerPhone = v.ownerPhone; isActive = v.isActive;
        pendingApproval = v.pendingApproval; trialStartDate = v.trialStartDate;
        subscriptionActive = v.subscriptionActive; trialDays = v.trialDays;
      })
    });
    stableSalonClosedDays := salonClosedDaysMapV3.entries().toArray();
    stableSalonsOld := [];
    stableServices := salonServicesList.entries().toArray();
    stableAppointments := salonAppointmentsV3.entries().toArray();
    stableCustomers := custProfilesByPhone.entries().toArray();
    stableOwnerPhoneMap := ownerPhoneSalonMap.entries().toArray();
    stableOwnerPasswords := ownerPasswordMap.entries().toArray();
    stableServiceSessions := serviceSessionsBySalon.entries().toArray();
    stableNotifiedAppointments := notifiedAppointments.keys().toArray();
    stablePushSubscriptions := pushSubscriptionsByPhone.entries().toArray();
    stableNextSubRequestId := nextSubRequestId;
    stableSubRequests := subRequestsMap.entries().toArray();
    stablePlanPricings := planPricingsMap.entries().toArray();
    stableNextSubHistoryId := nextSubHistoryId;
    stableSubHistory := subHistoryMap.entries().toArray();
    stableNextPhotoId := nextPhotoId;
    stablePhotos := salonPhotosMap.entries().toArray();
  };

  system func postupgrade() {
    // Migrate old-format salons (without lat/lon) if present
    for ((k, v) in stableSalonsOld.vals()) {
      salonProfilesV3.add(k, {
        name = v.name; address = v.address; phone = v.phone; city = v.city;
        ownerPhone = v.ownerPhone; isActive = v.isActive;
        pendingApproval = v.pendingApproval; trialStartDate = v.trialStartDate;
        subscriptionActive = v.subscriptionActive; trialDays = v.trialDays;
        latitude = null; longitude = null;
      });
    };
    // Load new-format salons (stored as SalonProfileV3Old, add null lat/lon)
    for ((k, v) in stableSalons.vals()) {
      salonProfilesV3.add(k, {
        name = v.name; address = v.address; phone = v.phone; city = v.city;
        ownerPhone = v.ownerPhone; isActive = v.isActive;
        pendingApproval = v.pendingApproval; trialStartDate = v.trialStartDate;
        subscriptionActive = v.subscriptionActive; trialDays = v.trialDays;
        latitude = null; longitude = null;
      });
    };
    for ((k, v) in stableServices.vals()) { salonServicesList.add(k, v) };
    for ((k, v) in stableAppointments.vals()) { salonAppointmentsV3.add(k, v) };
    for ((k, v) in stableCustomers.vals()) { custProfilesByPhone.add(k, v) };
    for ((k, v) in stableOwnerPhoneMap.vals()) { ownerPhoneSalonMap.add(k, v) };
    for ((k, v) in stableOwnerPasswords.vals()) { ownerPasswordMap.add(k, v) };
    for ((k, v) in stableServiceSessions.vals()) { serviceSessionsBySalon.add(k, v) };
    for (k in stableNotifiedAppointments.vals()) { notifiedAppointments.add(k, true) };
    for ((k, v) in stablePushSubscriptions.vals()) { pushSubscriptionsByPhone.add(k, v) };
    for ((k, v) in stableSubRequests.vals()) { subRequestsMap.add(k, v) };
    for ((k, v) in stablePlanPricings.vals()) { planPricingsMap.add(k, v) };
    for ((k, v) in stableSubHistory.vals()) { subHistoryMap.add(k, v) };
    for ((k, v) in stablePhotos.vals()) { salonPhotosMap.add(k, v) };
    // Restore closedDays for salons that had them saved
    for ((k, days) in stableSalonClosedDays.vals()) {
      salonClosedDaysMapV3.add(k, days);
    };
    nextSubRequestId := stableNextSubRequestId;
    nextSubHistoryId := stableNextSubHistoryId;
    stableSalons := [];
    stableSalonsOld := [];
    stableServices := [];
    stableAppointments := [];
    stableCustomers := [];
    stableOwnerPhoneMap := [];
    stableOwnerPasswords := [];
    stableServiceSessions := [];
    stableNotifiedAppointments := [];
    stablePushSubscriptions := [];
    stableSubRequests := [];
    stablePlanPricings := [];
    stableSubHistory := [];
    stablePhotos := [];
    stableSalonClosedDays := [];
  };
};

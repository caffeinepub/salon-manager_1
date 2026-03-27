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
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ================================================================
  // MIGRATION STUBS — keep exact names from previous version
  // so stable variables are NOT implicitly discarded (M0169).
  // ================================================================
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

  // Old SalonProfile WITHOUT pendingApproval (matches previous version exactly)
  type OldSalonProfile = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPrincipal : Principal; isActive : Bool;
    trialStartDate : Int; subscriptionActive : Bool;
  };

  // Keep all old stable variable names and types so they aren’t discarded
  let appointments  = Map.empty<Nat, OldAppointment>();
  let customers     = Map.empty<Nat, OldCustomer>();
  let services      = Map.empty<Nat, OldService>();
  let staff         = Map.empty<Nat, OldStaff>();
  let userProfiles  = Map.empty<Principal, OldUserProfile>();
  var nextCustomerId: Nat = 1;
  var nextStaffId   : Nat = 1;
  var platformSubscriptionPrice : Float = 149.0;
  let rolePrefMap   = Map.empty<Principal, Text>();

  // salonTrialDaysMap — old separate map; keep for migration data
  let salonTrialDaysMap = Map.empty<Nat, Nat>();

  // salonProfiles — old type (without pendingApproval).
  // Motoko loads old stable data into this. We migrate to salonProfilesV2 in postupgrade.
  let salonProfiles = Map.empty<Nat, OldSalonProfile>();
  // ================================================================

  // ---- New types ----
  public type SalonProfile = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPrincipal : Principal;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
  };

  public type SalonWithId = {
    id : Nat; name : Text; address : Text; phone : Text; city : Text;
    ownerPrincipal : Principal;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
  };

  public type SalonService   = { salonId : Nat; name : Text; price : Float; durationMinutes : Nat };
  public type ServiceWithId  = { id : Nat; salonId : Nat; name : Text; price : Float; durationMinutes : Nat };

  public type SalonAppointment = {
    salonId : Nat; customerPrincipal : Principal;
    customerName : Text; customerPhone : Text;
    serviceName : Text; queueNumber : Nat;
    status : Text; createdAt : Int; date : Text;
  };
  public type AppointmentWithId = {
    id : Nat; salonId : Nat; customerPrincipal : Principal;
    customerName : Text; customerPhone : Text;
    serviceName : Text; queueNumber : Nat;
    status : Text; createdAt : Int; date : Text;
  };

  public type CustomerProfile = { name : Text; phone : Text };

  public type DashboardStats = {
    total : Nat; active : Nat; expired : Nat; pending : Nat;
  };

  // ---- New stable state (V2) ----
  var nextSalonId       : Nat = 1;
  var nextServiceId     : Nat = 1;
  var nextAppointmentId : Nat = 1;
  var defaultTrialDays  : Nat = 7;
  let MAX_SHOPS         : Nat = 100;

  // V2 salonProfiles WITH pendingApproval — different name to avoid type clash
  let salonProfilesV2   = Map.empty<Nat, SalonProfile>();
  let salonServicesList = Map.empty<Nat, SalonService>();
  let salonAppointments = Map.empty<Nat, SalonAppointment>();
  let custProfiles      = Map.empty<Principal, CustomerProfile>();
  let ownerSalonMap     = Map.empty<Principal, Nat>();

  var migrationDone : Bool = false;

  // Admin auth
  let ADMIN_EMAIL : Text = "amitkrji498@gmail.com";
  var adminPasswordHash : ?Text = null;

  // ---- Migration: salonProfiles (old) → salonProfilesV2 (new) ----
  system func postupgrade() {
    if (not migrationDone) {
      for ((id, s) in salonProfiles.entries().toArray().vals()) {
        let customTrialDays = switch (salonTrialDaysMap.get(id)) {
          case (?d) { d };
          case (null) { defaultTrialDays };
        };
        if (salonProfilesV2.get(id) == null) {
          salonProfilesV2.add(id, {
            name = s.name; address = s.address; phone = s.phone; city = s.city;
            ownerPrincipal = s.ownerPrincipal; isActive = s.isActive;
            pendingApproval = false;  // existing salons are approved
            trialStartDate = s.trialStartDate; subscriptionActive = s.subscriptionActive;
            trialDays = customTrialDays;
          });
          ownerSalonMap.add(s.ownerPrincipal, id);
          // Keep nextSalonId ahead of migrated IDs
          if (id >= nextSalonId) { nextSalonId := id + 1 };
        };
      };
      migrationDone := true;
    };
  };

  // ---- Helpers ----
  func isTrialExpired(s : SalonProfile) : Bool {
    let trialNanos : Int = s.trialDays * 86_400 * 1_000_000_000;
    Time.now() - s.trialStartDate > trialNanos;
  };

  func isSalonEffectivelyActive(s : SalonProfile) : Bool {
    s.isActive and not s.pendingApproval and
    (s.subscriptionActive or not isTrialExpired(s));
  };

  func makeSalonWithId(id : Nat, s : SalonProfile) : SalonWithId {
    { id = id; name = s.name; address = s.address; phone = s.phone;
      city = s.city; ownerPrincipal = s.ownerPrincipal; isActive = s.isActive;
      pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
      subscriptionActive = s.subscriptionActive; trialDays = s.trialDays };
  };

  func countApprovedSalons() : Nat {
    var count : Nat = 0;
    for ((_, s) in salonProfilesV2.entries().toArray().vals()) {
      if (not s.pendingApproval) { count += 1 };
    };
    count;
  };

  // ---- Admin Auth ----
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

  // ---- Admin Dashboard ----
  public query func adminGetDashboardStats() : async DashboardStats {
    var total : Nat = 0; var active : Nat = 0;
    var expired : Nat = 0; var pending : Nat = 0;
    for ((_, s) in salonProfilesV2.entries().toArray().vals()) {
      if (s.pendingApproval) { pending += 1 }
      else {
        total += 1;
        if (isSalonEffectivelyActive(s)) { active += 1 } else { expired += 1 };
      };
    };
    { total = total; active = active; expired = expired; pending = pending };
  };

  public query func adminGetAllSalons() : async [SalonWithId] {
    salonProfilesV2.entries().toArray()
      .filterMap(func((id, s)) {
        if (not s.pendingApproval) { ?makeSalonWithId(id, s) } else { null }
      });
  };

  public query func adminGetPendingSalons() : async [SalonWithId] {
    salonProfilesV2.entries().toArray()
      .filterMap(func((id, s)) {
        if (s.pendingApproval) { ?makeSalonWithId(id, s) } else { null }
      });
  };

  public func adminApproveSalon(salonId : Nat) : async () {
    switch (salonProfilesV2.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV2.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPrincipal = s.ownerPrincipal; isActive = true;
          pendingApproval = false; trialStartDate = Time.now();
          subscriptionActive = false; trialDays = s.trialDays;
        });
      };
    };
  };

  public func adminRejectSalon(salonId : Nat) : async () {
    switch (salonProfilesV2.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV2.remove(salonId);
        ownerSalonMap.remove(s.ownerPrincipal);
      };
    };
  };

  public func adminSetSalonActive(salonId : Nat, active : Bool) : async () {
    switch (salonProfilesV2.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV2.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPrincipal = s.ownerPrincipal; isActive = active;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
        });
      };
    };
  };

  public func adminSetSalonSubscription(salonId : Nat, active : Bool) : async () {
    switch (salonProfilesV2.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV2.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPrincipal = s.ownerPrincipal; isActive = s.isActive;
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
    switch (salonProfilesV2.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfilesV2.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPrincipal = s.ownerPrincipal; isActive = s.isActive;
          pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
          subscriptionActive = s.subscriptionActive; trialDays = days;
        });
      };
    };
  };

  public func adminProcessTrialExpirations() : async Nat {
    var count : Nat = 0;
    for ((id, s) in salonProfilesV2.entries().toArray().vals()) {
      if (s.isActive and not s.pendingApproval and not s.subscriptionActive and isTrialExpired(s)) {
        salonProfilesV2.add(id, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPrincipal = s.ownerPrincipal; isActive = false;
          pendingApproval = false; trialStartDate = s.trialStartDate;
          subscriptionActive = false; trialDays = s.trialDays;
        });
        count += 1;
      };
    };
    count;
  };

  // ---- Salon Owner APIs ----
  public shared ({ caller }) func registerSalon(name : Text, address : Text, phone : Text, city : Text) : async Nat {
    switch (ownerSalonMap.get(caller)) {
      case (?_) { Runtime.trap("You already have a registered salon") };
      case (null) {};
    };
    if (countApprovedSalons() >= MAX_SHOPS) {
      Runtime.trap("Maximum shop limit (100) reached.");
    };
    let id = nextSalonId;
    nextSalonId += 1;
    salonProfilesV2.add(id, {
      name = name; address = address; phone = phone; city = city;
      ownerPrincipal = caller; isActive = false; pendingApproval = true;
      trialStartDate = 0; subscriptionActive = false; trialDays = defaultTrialDays;
    });
    ownerSalonMap.add(caller, id);
    id;
  };

  public shared ({ caller }) func updateMySalon(name : Text, address : Text, phone : Text, city : Text) : async () {
    switch (ownerSalonMap.get(caller)) {
      case (null) { Runtime.trap("No salon found") };
      case (?salonId) {
        switch (salonProfilesV2.get(salonId)) {
          case (null) { Runtime.trap("Salon not found") };
          case (?s) {
            salonProfilesV2.add(salonId, {
              name = name; address = address; phone = phone; city = city;
              ownerPrincipal = s.ownerPrincipal; isActive = s.isActive;
              pendingApproval = s.pendingApproval; trialStartDate = s.trialStartDate;
              subscriptionActive = s.subscriptionActive; trialDays = s.trialDays;
            });
          };
        };
      };
    };
  };

  public query ({ caller }) func getMySalon() : async ?SalonWithId {
    switch (ownerSalonMap.get(caller)) {
      case (null) { null };
      case (?salonId) {
        switch (salonProfilesV2.get(salonId)) {
          case (null) { null };
          case (?s) { ?makeSalonWithId(salonId, s) };
        };
      };
    };
  };

  public shared ({ caller }) func addSalonService(salonId : Nat, name : Text, price : Float, durationMinutes : Nat) : async Nat {
    switch (ownerSalonMap.get(caller)) {
      case (null) { Runtime.trap("You don't own a salon") };
      case (?ownedId) {
        if (ownedId != salonId) { Runtime.trap("You can only add services to your own salon") };
      };
    };
    let id = nextServiceId;
    nextServiceId += 1;
    salonServicesList.add(id, { salonId = salonId; name = name; price = price; durationMinutes = durationMinutes });
    id;
  };

  public shared ({ caller }) func deleteSalonService(salonId : Nat, serviceId : Nat) : async () {
    switch (ownerSalonMap.get(caller)) {
      case (null) { Runtime.trap("You don't own a salon") };
      case (?ownedId) {
        if (ownedId != salonId) { Runtime.trap("You can only delete from your own salon") };
        salonServicesList.remove(serviceId);
      };
    };
  };

  public query func getSalonServices(salonId : Nat) : async [ServiceWithId] {
    salonServicesList.entries().toArray().filterMap(func((id, s)) {
      if (s.salonId == salonId) {
        ?{ id = id; salonId = s.salonId; name = s.name; price = s.price; durationMinutes = s.durationMinutes }
      } else { null }
    });
  };

  public query ({ caller }) func getSalonAppointmentsForDate(salonId : Nat, date : Text) : async [AppointmentWithId] {
    let callerOwns = switch (ownerSalonMap.get(caller)) {
      case (?id) { id == salonId };
      case (null) { false };
    };
    if (not callerOwns) { Runtime.trap("Unauthorized") };
    salonAppointments.entries().toArray().filterMap(func((id, a)) {
      if (a.salonId == salonId and a.date == date) {
        ?{ id = id; salonId = a.salonId; customerPrincipal = a.customerPrincipal;
           customerName = a.customerName; customerPhone = a.customerPhone;
           serviceName = a.serviceName; queueNumber = a.queueNumber;
           status = a.status; createdAt = a.createdAt; date = a.date }
      } else { null }
    }).sort(func(a, b) { Nat.compare(a.queueNumber, b.queueNumber) });
  };

  public shared ({ caller }) func updateAppointmentStatus(appointmentId : Nat, newStatus : Text) : async () {
    switch (salonAppointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appt) {
        let callerOwns = switch (ownerSalonMap.get(caller)) {
          case (?id) { id == appt.salonId };
          case (null) { false };
        };
        if (not callerOwns) { Runtime.trap("Unauthorized") };
        salonAppointments.add(appointmentId, {
          salonId = appt.salonId; customerPrincipal = appt.customerPrincipal;
          customerName = appt.customerName; customerPhone = appt.customerPhone;
          serviceName = appt.serviceName; queueNumber = appt.queueNumber;
          status = newStatus; createdAt = appt.createdAt; date = appt.date;
        });
      };
    };
  };

  // ---- Customer APIs ----
  public query func getAllActiveSalons() : async [SalonWithId] {
    salonProfilesV2.entries().toArray().filterMap(func((id, s)) {
      if (isSalonEffectivelyActive(s)) { ?makeSalonWithId(id, s) } else { null }
    });
  };

  public query func getSalonById(id : Nat) : async ?SalonWithId {
    switch (salonProfilesV2.get(id)) {
      case (null) { null };
      case (?s) { ?makeSalonWithId(id, s) };
    };
  };

  public shared ({ caller }) func bookAppointment(salonId : Nat, customerName : Text, customerPhone : Text, serviceName : Text, date : Text) : async Nat {
    let existingCount = salonAppointments.values().toArray()
      .filter(func(a) { a.salonId == salonId and a.date == date and a.status != "cancelled" }).size();
    let queueNumber = existingCount + 1;
    let id = nextAppointmentId;
    nextAppointmentId += 1;
    salonAppointments.add(id, {
      salonId = salonId; customerPrincipal = caller;
      customerName = customerName; customerPhone = customerPhone;
      serviceName = serviceName; queueNumber = queueNumber;
      status = "pending"; createdAt = Time.now(); date = date;
    });
    id;
  };

  public query ({ caller }) func getMyAppointments() : async [AppointmentWithId] {
    salonAppointments.entries().toArray().filterMap(func((id, a)) {
      if (a.customerPrincipal == caller) {
        ?{ id = id; salonId = a.salonId; customerPrincipal = a.customerPrincipal;
           customerName = a.customerName; customerPhone = a.customerPhone;
           serviceName = a.serviceName; queueNumber = a.queueNumber;
           status = a.status; createdAt = a.createdAt; date = a.date }
      } else { null }
    });
  };

  public query func getQueueInfo(appointmentId : Nat) : async (Nat, Nat) {
    switch (salonAppointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?myAppt) {
        let ahead = salonAppointments.values().toArray().filter(func(a) {
          a.salonId == myAppt.salonId and a.date == myAppt.date
          and a.queueNumber < myAppt.queueNumber
          and a.status != "completed" and a.status != "cancelled"
        }).size();
        (myAppt.queueNumber, ahead);
      };
    };
  };

  public shared ({ caller }) func saveCustomerProfile(name : Text, phone : Text) : async () {
    custProfiles.add(caller, { name = name; phone = phone });
  };

  public query ({ caller }) func getMyCustomerProfile() : async ?CustomerProfile {
    custProfiles.get(caller);
  };
};

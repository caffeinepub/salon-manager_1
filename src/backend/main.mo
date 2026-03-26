import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ================================================================
  // MIGRATION STUBS: old stable variables from previous version
  // These must be declared with old types so Motoko can drop them.
  // ================================================================
  type OldAppointmentStatus = { #pending; #confirmed; #completed; #cancelled };
  type OldAppointment = {
    customerName : Text;
    serviceName : Text;
    staffName : Text;
    date : Text;
    time : Text;
    status : OldAppointmentStatus;
    notes : ?Text;
    price : Float;
  };
  type OldCustomer = { name : Text; phone : Text; email : Text; notes : ?Text };
  type OldService = { name : Text; duration : Nat; price : Float; description : ?Text };
  type OldStaff = { name : Text; role : Text; specialty : Text; phone : Text; email : Text };
  type OldUserProfile = { name : Text };

  // Old maps kept with old types — will be empty after migration
  let appointments = Map.empty<Nat, OldAppointment>();
  let customers = Map.empty<Nat, OldCustomer>();
  let services = Map.empty<Nat, OldService>();
  let staff = Map.empty<Nat, OldStaff>();
  let userProfiles = Map.empty<Principal, OldUserProfile>();
  var nextCustomerId : Nat = 1;
  var nextStaffId : Nat = 1;
  // ================================================================

  // ---- New Types ----
  public type SalonProfile = {
    name : Text;
    address : Text;
    phone : Text;
    city : Text;
    ownerPrincipal : Principal;
    isActive : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
  };

  public type SalonService = {
    salonId : Nat;
    name : Text;
    price : Float;
    durationMinutes : Nat;
  };

  public type SalonAppointment = {
    salonId : Nat;
    customerPrincipal : Principal;
    customerName : Text;
    customerPhone : Text;
    serviceName : Text;
    queueNumber : Nat;
    status : Text;
    createdAt : Int;
    date : Text;
  };

  public type CustomerProfile = {
    name : Text;
    phone : Text;
  };

  public type SalonWithId = {
    id : Nat;
    name : Text;
    address : Text;
    phone : Text;
    city : Text;
    ownerPrincipal : Principal;
    isActive : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
  };

  public type AppointmentWithId = {
    id : Nat;
    salonId : Nat;
    customerPrincipal : Principal;
    customerName : Text;
    customerPhone : Text;
    serviceName : Text;
    queueNumber : Nat;
    status : Text;
    createdAt : Int;
    date : Text;
  };

  public type ServiceWithId = {
    id : Nat;
    salonId : Nat;
    name : Text;
    price : Float;
    durationMinutes : Nat;
  };

  // ---- New State (renamed to avoid stable var conflicts) ----
  var nextSalonId : Nat = 1;
  var nextServiceId : Nat = 1;
  var nextAppointmentId : Nat = 1;
  var platformSubscriptionPrice : Float = 299.0;

  let salonProfiles = Map.empty<Nat, SalonProfile>();
  let salonServicesList = Map.empty<Nat, SalonService>();
  let salonAppointments = Map.empty<Nat, SalonAppointment>();
  let custProfiles = Map.empty<Principal, CustomerProfile>();
  let rolePrefMap = Map.empty<Principal, Text>();
  let ownerSalonMap = Map.empty<Principal, Nat>();

  // ---- Salon Owner APIs ----
  public shared ({ caller }) func registerSalon(name : Text, address : Text, phone : Text, city : Text) : async Nat {
    switch (ownerSalonMap.get(caller)) {
      case (?_) { Runtime.trap("You already have a registered salon") };
      case (null) {};
    };
    let id = nextSalonId;
    nextSalonId += 1;
    salonProfiles.add(id, {
      name = name;
      address = address;
      phone = phone;
      city = city;
      ownerPrincipal = caller;
      isActive = true;
      trialStartDate = Time.now();
      subscriptionActive = false;
    });
    ownerSalonMap.add(caller, id);
    id;
  };

  public shared ({ caller }) func updateMySalon(name : Text, address : Text, phone : Text, city : Text) : async () {
    switch (ownerSalonMap.get(caller)) {
      case (null) { Runtime.trap("No salon found for this account") };
      case (?salonId) {
        switch (salonProfiles.get(salonId)) {
          case (null) { Runtime.trap("Salon not found") };
          case (?existing) {
            salonProfiles.add(salonId, {
              name = name;
              address = address;
              phone = phone;
              city = city;
              ownerPrincipal = existing.ownerPrincipal;
              isActive = existing.isActive;
              trialStartDate = existing.trialStartDate;
              subscriptionActive = existing.subscriptionActive;
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
        switch (salonProfiles.get(salonId)) {
          case (null) { null };
          case (?s) {
            ?{ id = salonId; name = s.name; address = s.address; phone = s.phone; city = s.city; ownerPrincipal = s.ownerPrincipal; isActive = s.isActive; trialStartDate = s.trialStartDate; subscriptionActive = s.subscriptionActive };
          };
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
        if (ownedId != salonId) { Runtime.trap("You can only delete services from your own salon") };
      };
    };
    salonServicesList.remove(serviceId);
  };

  public query func getSalonServices(salonId : Nat) : async [ServiceWithId] {
    salonServicesList.entries().toArray().filterMap(
      func((id, s)) {
        if (s.salonId == salonId) {
          ?{ id = id; salonId = s.salonId; name = s.name; price = s.price; durationMinutes = s.durationMinutes };
        } else { null };
      }
    );
  };

  public query ({ caller }) func getSalonAppointmentsForDate(salonId : Nat, date : Text) : async [AppointmentWithId] {
    let callerOwns = switch (ownerSalonMap.get(caller)) {
      case (?id) { id == salonId };
      case (null) { AccessControl.isAdmin(accessControlState, caller) };
    };
    if (not callerOwns) { Runtime.trap("Unauthorized") };
    salonAppointments.entries().toArray().filterMap(
      func((id, a)) {
        if (a.salonId == salonId and a.date == date) {
          ?{ id = id; salonId = a.salonId; customerPrincipal = a.customerPrincipal; customerName = a.customerName; customerPhone = a.customerPhone; serviceName = a.serviceName; queueNumber = a.queueNumber; status = a.status; createdAt = a.createdAt; date = a.date };
        } else { null };
      }
    ).sort(func(a, b) { Nat.compare(a.queueNumber, b.queueNumber) });
  };

  public query ({ caller }) func getAllSalonAppointments(salonId : Nat) : async [AppointmentWithId] {
    let callerOwns = switch (ownerSalonMap.get(caller)) {
      case (?id) { id == salonId };
      case (null) { AccessControl.isAdmin(accessControlState, caller) };
    };
    if (not callerOwns) { Runtime.trap("Unauthorized") };
    salonAppointments.entries().toArray().filterMap(
      func((id, a)) {
        if (a.salonId == salonId) {
          ?{ id = id; salonId = a.salonId; customerPrincipal = a.customerPrincipal; customerName = a.customerName; customerPhone = a.customerPhone; serviceName = a.serviceName; queueNumber = a.queueNumber; status = a.status; createdAt = a.createdAt; date = a.date };
        } else { null };
      }
    ).sort(func(a, b) { Nat.compare(a.queueNumber, b.queueNumber) });
  };

  public shared ({ caller }) func updateAppointmentStatus(appointmentId : Nat, newStatus : Text) : async () {
    switch (salonAppointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appt) {
        let callerOwns = switch (ownerSalonMap.get(caller)) {
          case (?id) { id == appt.salonId };
          case (null) { AccessControl.isAdmin(accessControlState, caller) };
        };
        if (not callerOwns) { Runtime.trap("Unauthorized") };
        salonAppointments.add(appointmentId, {
          salonId = appt.salonId;
          customerPrincipal = appt.customerPrincipal;
          customerName = appt.customerName;
          customerPhone = appt.customerPhone;
          serviceName = appt.serviceName;
          queueNumber = appt.queueNumber;
          status = newStatus;
          createdAt = appt.createdAt;
          date = appt.date;
        });
      };
    };
  };

  // ---- Customer APIs ----
  public query func getAllActiveSalons() : async [SalonWithId] {
    salonProfiles.entries().toArray().filterMap(
      func((id, s)) {
        if (s.isActive) {
          ?{ id = id; name = s.name; address = s.address; phone = s.phone; city = s.city; ownerPrincipal = s.ownerPrincipal; isActive = s.isActive; trialStartDate = s.trialStartDate; subscriptionActive = s.subscriptionActive };
        } else { null };
      }
    );
  };

  public query func getSalonById(id : Nat) : async ?SalonWithId {
    switch (salonProfiles.get(id)) {
      case (null) { null };
      case (?s) {
        ?{ id = id; name = s.name; address = s.address; phone = s.phone; city = s.city; ownerPrincipal = s.ownerPrincipal; isActive = s.isActive; trialStartDate = s.trialStartDate; subscriptionActive = s.subscriptionActive };
      };
    };
  };

  public shared ({ caller }) func bookAppointment(salonId : Nat, customerName : Text, customerPhone : Text, serviceName : Text, date : Text) : async Nat {
    let existingCount = salonAppointments.values().toArray().filter(
      func(a) { a.salonId == salonId and a.date == date and a.status != "cancelled" }
    ).size();
    let queueNumber = existingCount + 1;
    let id = nextAppointmentId;
    nextAppointmentId += 1;
    salonAppointments.add(id, {
      salonId = salonId;
      customerPrincipal = caller;
      customerName = customerName;
      customerPhone = customerPhone;
      serviceName = serviceName;
      queueNumber = queueNumber;
      status = "pending";
      createdAt = Time.now();
      date = date;
    });
    id;
  };

  public query ({ caller }) func getMyAppointments() : async [AppointmentWithId] {
    salonAppointments.entries().toArray().filterMap(
      func((id, a)) {
        if (a.customerPrincipal == caller) {
          ?{ id = id; salonId = a.salonId; customerPrincipal = a.customerPrincipal; customerName = a.customerName; customerPhone = a.customerPhone; serviceName = a.serviceName; queueNumber = a.queueNumber; status = a.status; createdAt = a.createdAt; date = a.date };
        } else { null };
      }
    );
  };

  public query func getQueueInfo(appointmentId : Nat) : async (Nat, Nat) {
    switch (salonAppointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?myAppt) {
        let ahead = salonAppointments.values().toArray().filter(
          func(a) {
            a.salonId == myAppt.salonId
            and a.date == myAppt.date
            and a.queueNumber < myAppt.queueNumber
            and a.status != "completed"
            and a.status != "cancelled"
          }
        ).size();
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

  public shared ({ caller }) func setMyRolePreference(role : Text) : async () {
    rolePrefMap.add(caller, role);
  };

  public query ({ caller }) func getMyRolePreference() : async ?Text {
    rolePrefMap.get(caller);
  };

  // ---- Platform / Admin APIs ----
  public shared ({ caller }) func setPlatformSubscriptionPrice(price : Float) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can set subscription price");
    };
    platformSubscriptionPrice := price;
  };

  public query func getPlatformSubscriptionPrice() : async Float {
    platformSubscriptionPrice;
  };

  public query ({ caller }) func adminGetAllSalons() : async [SalonWithId] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can view all salons");
    };
    salonProfiles.entries().toArray().map(
      func((id, s)) {
        { id = id; name = s.name; address = s.address; phone = s.phone; city = s.city; ownerPrincipal = s.ownerPrincipal; isActive = s.isActive; trialStartDate = s.trialStartDate; subscriptionActive = s.subscriptionActive };
      }
    );
  };

  public shared ({ caller }) func adminSetSalonSubscription(salonId : Nat, active : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can update subscriptions");
    };
    switch (salonProfiles.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfiles.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPrincipal = s.ownerPrincipal; isActive = s.isActive;
          trialStartDate = s.trialStartDate; subscriptionActive = active;
        });
      };
    };
  };

  public shared ({ caller }) func adminSetSalonActive(salonId : Nat, active : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can activate/deactivate salons");
    };
    switch (salonProfiles.get(salonId)) {
      case (null) { Runtime.trap("Salon not found") };
      case (?s) {
        salonProfiles.add(salonId, {
          name = s.name; address = s.address; phone = s.phone; city = s.city;
          ownerPrincipal = s.ownerPrincipal; isActive = active;
          trialStartDate = s.trialStartDate; subscriptionActive = s.subscriptionActive;
        });
      };
    };
  };
};

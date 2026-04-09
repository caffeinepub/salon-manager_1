import Map "mo:core/Map";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

// Migration module: adds salonClosedDaysMapV3 (new stable map for per-salon closed days).
// The salonProfilesV3 map type is UNCHANGED (no closedDays in the map value type).
module {

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
  type OldSalonProfileLegacy = {
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
  type OldSalonProfileV3Old = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text; isActive : Bool; pendingApproval : Bool;
    trialStartDate : Int; subscriptionActive : Bool; trialDays : Nat;
  };
  // The stable map value type for salonProfilesV3 — same in both old and new canister
  type SalonProfile_v3 = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text; isActive : Bool; pendingApproval : Bool;
    trialStartDate : Int; subscriptionActive : Bool; trialDays : Nat;
    latitude : ?Float; longitude : ?Float;
    // No closedDays — stored separately in salonClosedDaysMapV3
  };
  type SalonService  = { salonId : Nat; name : Text; price : Float; durationMinutes : Nat };
  type Appointment = {
    salonId : Nat; customerPhone : Text; customerName : Text;
    serviceName : Text; queueNumber : Nat; status : Text;
    createdAt : Int; date : Text; servicePrice : Float;
  };
  type CustomerProfileV3 = { name : Text; phone : Text };
  type ServiceSession = { appointmentId : Nat; startTime : Int; durationMinutes : Nat };
  type PushSubscription = { endpoint : Text; p256dh : Text; auth : Text };
  type PlanPricing = {
    planName : Text; planDays : Nat; originalPrice : Float; discountPercent : Float;
  };
  type SubRequest = {
    id : Nat; ownerPhone : Text; salonName : Text; planName : Text; planDays : Nat;
    originalPrice : Float; discountPercent : Float; finalPrice : Float; savings : Float;
    requestTime : Int; screenshotBase64 : Text; status : Text; approvedAt : Int;
  };
  type SubscriptionHistory = {
    id : Nat; salonId : Nat; ownerPhone : Text; salonName : Text;
    planName : Text; planDays : Nat; originalPrice : Float; discountPercent : Float;
    finalPrice : Float; savings : Float; startDate : Int; endDate : Int;
    approvedAt : Int; transactionId : Text;
  };
  type SalonPhoto = { id : Nat; salonId : Nat; ownerPhone : Text; url : Text; uploadedAt : Int };

  // ---- OldActor: previously-deployed stable state ----
  // Does NOT have salonClosedDaysMapV3
  type OldActor = {
    appointments    : Map.Map<Nat, OldAppointment>;
    customers       : Map.Map<Nat, OldCustomer>;
    services        : Map.Map<Nat, OldService>;
    staff           : Map.Map<Nat, OldStaff>;
    userProfiles    : Map.Map<Principal, OldUserProfile>;
    var nextCustomerId : Nat;
    var nextStaffId    : Nat;
    rolePrefMap        : Map.Map<Principal, Text>;
    salonTrialDaysMap  : Map.Map<Nat, Nat>;
    salonProfiles      : Map.Map<Nat, OldSalonProfileLegacy>;
    var migrationDone  : Bool;
    salonProfilesV2    : Map.Map<Nat, OldSalonProfileV2>;
    ownerSalonMap      : Map.Map<Principal, Nat>;
    custProfiles       : Map.Map<Principal, OldCustomerProfile>;
    salonAppointments  : Map.Map<Nat, OldSalonAppointment>;
    var stableAdminPasswordHash : ?Text;
    var stableNextSalonId       : Nat;
    var stableNextServiceId     : Nat;
    var stableNextAppointmentId : Nat;
    var stableDefaultTrialDays  : Nat;
    var stablePlatformPrice     : Float;
    var stableSalons            : [(Nat, OldSalonProfileV3Old)];
    var stableSalonsOld         : [(Nat, OldSalonProfileV3Old)];
    var stableServices          : [(Nat, SalonService)];
    var stableAppointments      : [(Nat, Appointment)];
    var stableCustomers         : [(Text, CustomerProfileV3)];
    var stableOwnerPhoneMap     : [(Text, Nat)];
    var stableOwnerPasswords    : [(Text, Text)];
    var stableServiceSessions   : [(Nat, ServiceSession)];
    var stableNotifiedAppointments : [Nat];
    var stablePushSubscriptions : [(Text, PushSubscription)];
    var stableNextSubRequestId  : Nat;
    var stableSubRequests       : [(Nat, SubRequest)];
    var stablePlanPricings      : [(Text, PlanPricing)];
    var stableNextSubHistoryId  : Nat;
    var stableSubHistory        : [(Nat, SubscriptionHistory)];
    var stableNextPhotoId       : Nat;
    var stablePhotos            : [(Nat, SalonPhoto)];
    salonProfilesV3     : Map.Map<Nat, SalonProfile_v3>;
    salonServicesList   : Map.Map<Nat, SalonService>;
    salonAppointmentsV3 : Map.Map<Nat, Appointment>;
    custProfilesByPhone : Map.Map<Text, CustomerProfileV3>;
    ownerPhoneSalonMap  : Map.Map<Text, Nat>;
    ownerPasswordMap    : Map.Map<Text, Text>;
    serviceSessionsBySalon  : Map.Map<Nat, ServiceSession>;
    notifiedAppointments    : Map.Map<Nat, Bool>;
    pushSubscriptionsByPhone : Map.Map<Text, PushSubscription>;
    subRequestsMap   : Map.Map<Nat, SubRequest>;
    planPricingsMap  : Map.Map<Text, PlanPricing>;
    subHistoryMap    : Map.Map<Nat, SubscriptionHistory>;
    salonPhotosMap   : Map.Map<Nat, SalonPhoto>;
  };

  // ---- NewActor: new stable state — adds salonClosedDaysMapV3 ----
  type NewActor = {
    appointments    : Map.Map<Nat, OldAppointment>;
    customers       : Map.Map<Nat, OldCustomer>;
    services        : Map.Map<Nat, OldService>;
    staff           : Map.Map<Nat, OldStaff>;
    userProfiles    : Map.Map<Principal, OldUserProfile>;
    var nextCustomerId : Nat;
    var nextStaffId    : Nat;
    rolePrefMap        : Map.Map<Principal, Text>;
    salonTrialDaysMap  : Map.Map<Nat, Nat>;
    salonProfiles      : Map.Map<Nat, OldSalonProfileLegacy>;
    var migrationDone  : Bool;
    salonProfilesV2    : Map.Map<Nat, OldSalonProfileV2>;
    ownerSalonMap      : Map.Map<Principal, Nat>;
    custProfiles       : Map.Map<Principal, OldCustomerProfile>;
    salonAppointments  : Map.Map<Nat, OldSalonAppointment>;
    var stableAdminPasswordHash : ?Text;
    var stableNextSalonId       : Nat;
    var stableNextServiceId     : Nat;
    var stableNextAppointmentId : Nat;
    var stableDefaultTrialDays  : Nat;
    var stablePlatformPrice     : Float;
    var stableSalons            : [(Nat, OldSalonProfileV3Old)];
    var stableSalonsOld         : [(Nat, OldSalonProfileV3Old)];
    var stableServices          : [(Nat, SalonService)];
    var stableAppointments      : [(Nat, Appointment)];
    var stableCustomers         : [(Text, CustomerProfileV3)];
    var stableOwnerPhoneMap     : [(Text, Nat)];
    var stableOwnerPasswords    : [(Text, Text)];
    var stableServiceSessions   : [(Nat, ServiceSession)];
    var stableNotifiedAppointments : [Nat];
    var stablePushSubscriptions : [(Text, PushSubscription)];
    var stableNextSubRequestId  : Nat;
    var stableSubRequests       : [(Nat, SubRequest)];
    var stablePlanPricings      : [(Text, PlanPricing)];
    var stableNextSubHistoryId  : Nat;
    var stableSubHistory        : [(Nat, SubscriptionHistory)];
    var stableNextPhotoId       : Nat;
    var stablePhotos            : [(Nat, SalonPhoto)];
    // NEW stable field added in this version
    var stableSalonClosedDays   : [(Nat, [Bool])];
    salonProfilesV3     : Map.Map<Nat, SalonProfile_v3>;
    salonClosedDaysMapV3 : Map.Map<Nat, [Bool]>;
    salonServicesList   : Map.Map<Nat, SalonService>;
    salonAppointmentsV3 : Map.Map<Nat, Appointment>;
    custProfilesByPhone : Map.Map<Text, CustomerProfileV3>;
    ownerPhoneSalonMap  : Map.Map<Text, Nat>;
    ownerPasswordMap    : Map.Map<Text, Text>;
    serviceSessionsBySalon  : Map.Map<Nat, ServiceSession>;
    notifiedAppointments    : Map.Map<Nat, Bool>;
    pushSubscriptionsByPhone : Map.Map<Text, PushSubscription>;
    subRequestsMap   : Map.Map<Nat, SubRequest>;
    planPricingsMap  : Map.Map<Text, PlanPricing>;
    subHistoryMap    : Map.Map<Nat, SubscriptionHistory>;
    salonPhotosMap   : Map.Map<Nat, SalonPhoto>;
  };

  public func run(old : OldActor) : NewActor {
    {
      appointments    = old.appointments;
      customers       = old.customers;
      services        = old.services;
      staff           = old.staff;
      userProfiles    = old.userProfiles;
      var nextCustomerId = old.nextCustomerId;
      var nextStaffId    = old.nextStaffId;
      rolePrefMap        = old.rolePrefMap;
      salonTrialDaysMap  = old.salonTrialDaysMap;
      salonProfiles      = old.salonProfiles;
      var migrationDone  = old.migrationDone;
      salonProfilesV2    = old.salonProfilesV2;
      ownerSalonMap      = old.ownerSalonMap;
      custProfiles       = old.custProfiles;
      salonAppointments  = old.salonAppointments;
      var stableAdminPasswordHash = old.stableAdminPasswordHash;
      var stableNextSalonId       = old.stableNextSalonId;
      var stableNextServiceId     = old.stableNextServiceId;
      var stableNextAppointmentId = old.stableNextAppointmentId;
      var stableDefaultTrialDays  = old.stableDefaultTrialDays;
      var stablePlatformPrice     = old.stablePlatformPrice;
      var stableSalons            = old.stableSalons;
      var stableSalonsOld         = old.stableSalonsOld;
      var stableServices          = old.stableServices;
      var stableAppointments      = old.stableAppointments;
      var stableCustomers         = old.stableCustomers;
      var stableOwnerPhoneMap     = old.stableOwnerPhoneMap;
      var stableOwnerPasswords    = old.stableOwnerPasswords;
      var stableServiceSessions   = old.stableServiceSessions;
      var stableNotifiedAppointments = old.stableNotifiedAppointments;
      var stablePushSubscriptions = old.stablePushSubscriptions;
      var stableNextSubRequestId  = old.stableNextSubRequestId;
      var stableSubRequests       = old.stableSubRequests;
      var stablePlanPricings      = old.stablePlanPricings;
      var stableNextSubHistoryId  = old.stableNextSubHistoryId;
      var stableSubHistory        = old.stableSubHistory;
      var stableNextPhotoId       = old.stableNextPhotoId;
      var stablePhotos            = old.stablePhotos;
      // New field — initialized empty; all salons start with no closed days
      var stableSalonClosedDays   = [];
      salonProfilesV3     = old.salonProfilesV3;
      // New map — initialized empty
      salonClosedDaysMapV3 = Map.empty<Nat, [Bool]>();
      salonServicesList   = old.salonServicesList;
      salonAppointmentsV3 = old.salonAppointmentsV3;
      custProfilesByPhone = old.custProfilesByPhone;
      ownerPhoneSalonMap  = old.ownerPhoneSalonMap;
      ownerPasswordMap    = old.ownerPasswordMap;
      serviceSessionsBySalon  = old.serviceSessionsBySalon;
      notifiedAppointments    = old.notifiedAppointments;
      pushSubscriptionsByPhone = old.pushSubscriptionsByPhone;
      subRequestsMap   = old.subRequestsMap;
      planPricingsMap  = old.planPricingsMap;
      subHistoryMap    = old.subHistoryMap;
      salonPhotosMap   = old.salonPhotosMap;
    }
  };
}

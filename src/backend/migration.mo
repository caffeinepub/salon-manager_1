// Migration module: adds latitude/longitude optional fields to SalonProfile
// Old SalonProfile (from .old/src/backend/main.mo) had no lat/lon fields.
// New SalonProfile adds latitude : ?Float and longitude : ?Float.
import Map "mo:core/Map";

module {
  // Old V3 SalonProfile — no latitude/longitude fields
  type OldSalonProfileV3 = {
    name : Text; address : Text; phone : Text; city : Text;
    ownerPhone : Text;
    isActive : Bool;
    pendingApproval : Bool;
    trialStartDate : Int;
    subscriptionActive : Bool;
    trialDays : Nat;
  };

  // New SalonProfile — with latitude/longitude
  type NewSalonProfileV3 = {
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

  // Only specify the fields that are changing
  type OldActor = {
    salonProfilesV3 : Map.Map<Nat, OldSalonProfileV3>;
  };

  type NewActor = {
    salonProfilesV3 : Map.Map<Nat, NewSalonProfileV3>;
  };

  public func run(old : OldActor) : NewActor {
    let newSalonProfilesV3 = old.salonProfilesV3.map<Nat, OldSalonProfileV3, NewSalonProfileV3>(
      func(_id, s) {
        { s with latitude = null; longitude = null }
      }
    );
    { salonProfilesV3 = newSalonProfilesV3 }
  };
};

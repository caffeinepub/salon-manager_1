/* eslint-disable */
// @ts-nocheck
export const idlFactory = ({ IDL }) => {
  const SalonWithId = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'address' : IDL.Text,
    'phone' : IDL.Text,
    'city' : IDL.Text,
    'ownerPrincipal' : IDL.Principal,
    'isActive' : IDL.Bool,
    'pendingApproval' : IDL.Bool,
    'trialStartDate' : IDL.Int,
    'subscriptionActive' : IDL.Bool,
    'trialDays' : IDL.Nat,
  });
  const ServiceWithId = IDL.Record({
    'id' : IDL.Nat,
    'salonId' : IDL.Nat,
    'name' : IDL.Text,
    'price' : IDL.Float64,
    'durationMinutes' : IDL.Nat,
  });
  const AppointmentWithId = IDL.Record({
    'id' : IDL.Nat,
    'salonId' : IDL.Nat,
    'customerPrincipal' : IDL.Principal,
    'customerName' : IDL.Text,
    'customerPhone' : IDL.Text,
    'serviceName' : IDL.Text,
    'queueNumber' : IDL.Nat,
    'status' : IDL.Text,
    'createdAt' : IDL.Int,
    'date' : IDL.Text,
  });
  const CustomerProfile = IDL.Record({
    'name' : IDL.Text,
    'phone' : IDL.Text,
  });
  const AdminDashboardStats = IDL.Record({
    'total' : IDL.Nat,
    'active' : IDL.Nat,
    'expired' : IDL.Nat,
    'pending' : IDL.Nat,
  });
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  return IDL.Service({
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    // Admin auth
    'adminPasswordIsSet' : IDL.Func([], [IDL.Bool], ['query']),
    'adminSetPassword' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'adminLogin' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], ['query']),
    // Admin dashboard
    'adminGetDashboardStats' : IDL.Func([], [AdminDashboardStats], ['query']),
    'adminGetAllSalons' : IDL.Func([], [IDL.Vec(SalonWithId)], ['query']),
    'adminGetPendingSalons' : IDL.Func([], [IDL.Vec(SalonWithId)], ['query']),
    'adminApproveSalon' : IDL.Func([IDL.Nat], [], []),
    'adminRejectSalon' : IDL.Func([IDL.Nat], [], []),
    'adminSetSalonActive' : IDL.Func([IDL.Nat, IDL.Bool], [], []),
    'adminSetSalonSubscription' : IDL.Func([IDL.Nat, IDL.Bool], [], []),
    'adminGetDefaultTrialDays' : IDL.Func([], [IDL.Nat], ['query']),
    'adminSetDefaultTrialDays' : IDL.Func([IDL.Nat], [], []),
    'adminSetSalonTrialDays' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'adminProcessTrialExpirations' : IDL.Func([], [IDL.Nat], []),
    // Salon owner
    'registerSalon' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'updateMySalon' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
    'getMySalon' : IDL.Func([], [IDL.Opt(SalonWithId)], ['query']),
    'addSalonService' : IDL.Func([IDL.Nat, IDL.Text, IDL.Float64, IDL.Nat], [IDL.Nat], []),
    'deleteSalonService' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'getSalonServices' : IDL.Func([IDL.Nat], [IDL.Vec(ServiceWithId)], ['query']),
    'getSalonAppointmentsForDate' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Vec(AppointmentWithId)], ['query']),
    'updateAppointmentStatus' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    // Customer
    'getAllActiveSalons' : IDL.Func([], [IDL.Vec(SalonWithId)], ['query']),
    'getSalonById' : IDL.Func([IDL.Nat], [IDL.Opt(SalonWithId)], ['query']),
    'bookAppointment' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'getMyAppointments' : IDL.Func([], [IDL.Vec(AppointmentWithId)], ['query']),
    'getQueueInfo' : IDL.Func([IDL.Nat], [IDL.Nat, IDL.Nat], ['query']),
    'saveCustomerProfile' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'getMyCustomerProfile' : IDL.Func([], [IDL.Opt(CustomerProfile)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };

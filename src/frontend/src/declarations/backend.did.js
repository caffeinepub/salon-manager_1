/* eslint-disable */
// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user' : IDL.Null,
  'guest' : IDL.Null,
});
export const AppointmentStatus = IDL.Variant({
  'cancelled' : IDL.Null,
  'pending' : IDL.Null,
  'completed' : IDL.Null,
  'confirmed' : IDL.Null,
});
export const Appointment = IDL.Record({
  'customerName' : IDL.Text,
  'status' : AppointmentStatus,
  'serviceName' : IDL.Text,
  'staffName' : IDL.Text,
  'date' : IDL.Text,
  'time' : IDL.Text,
  'notes' : IDL.Opt(IDL.Text),
  'price' : IDL.Float64,
});
export const Customer = IDL.Record({
  'name' : IDL.Text,
  'email' : IDL.Text,
  'notes' : IDL.Opt(IDL.Text),
  'phone' : IDL.Text,
});
export const Service = IDL.Record({
  'duration' : IDL.Nat,
  'name' : IDL.Text,
  'description' : IDL.Opt(IDL.Text),
  'price' : IDL.Float64,
});
export const Staff = IDL.Record({
  'name' : IDL.Text,
  'role' : IDL.Text,
  'email' : IDL.Text,
  'specialty' : IDL.Text,
  'phone' : IDL.Text,
});
export const UserProfile = IDL.Record({ 'name' : IDL.Text });
export const DashboardStats = IDL.Record({
  'totalServices' : IDL.Nat,
  'totalStaff' : IDL.Nat,
  'totalRevenue' : IDL.Float64,
  'totalAppointments' : IDL.Nat,
  'totalCustomers' : IDL.Nat,
});

export const SalonWithId = IDL.Record({
  'id' : IDL.Nat,
  'name' : IDL.Text,
  'address' : IDL.Text,
  'phone' : IDL.Text,
  'city' : IDL.Text,
  'ownerPrincipal' : IDL.Principal,
  'isActive' : IDL.Bool,
  'trialStartDate' : IDL.Int,
  'subscriptionActive' : IDL.Bool,
});

export const ServiceWithId = IDL.Record({
  'id' : IDL.Nat,
  'salonId' : IDL.Nat,
  'name' : IDL.Text,
  'price' : IDL.Float64,
  'durationMinutes' : IDL.Nat,
});

export const AppointmentWithId = IDL.Record({
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

export const CustomerProfile = IDL.Record({
  'name' : IDL.Text,
  'phone' : IDL.Text,
});

export const idlService = IDL.Service({});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({
    'admin' : IDL.Null,
    'user' : IDL.Null,
    'guest' : IDL.Null,
  });
  const AppointmentStatus = IDL.Variant({
    'cancelled' : IDL.Null,
    'pending' : IDL.Null,
    'completed' : IDL.Null,
    'confirmed' : IDL.Null,
  });
  const Appointment = IDL.Record({
    'customerName' : IDL.Text,
    'status' : AppointmentStatus,
    'serviceName' : IDL.Text,
    'staffName' : IDL.Text,
    'date' : IDL.Text,
    'time' : IDL.Text,
    'notes' : IDL.Opt(IDL.Text),
    'price' : IDL.Float64,
  });
  const Customer = IDL.Record({
    'name' : IDL.Text,
    'email' : IDL.Text,
    'notes' : IDL.Opt(IDL.Text),
    'phone' : IDL.Text,
  });
  const Service = IDL.Record({
    'duration' : IDL.Nat,
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'price' : IDL.Float64,
  });
  const Staff = IDL.Record({
    'name' : IDL.Text,
    'role' : IDL.Text,
    'email' : IDL.Text,
    'specialty' : IDL.Text,
    'phone' : IDL.Text,
  });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const DashboardStats = IDL.Record({
    'totalServices' : IDL.Nat,
    'totalStaff' : IDL.Nat,
    'totalRevenue' : IDL.Float64,
    'totalAppointments' : IDL.Nat,
    'totalCustomers' : IDL.Nat,
  });
  const SalonWithId = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'address' : IDL.Text,
    'phone' : IDL.Text,
    'city' : IDL.Text,
    'ownerPrincipal' : IDL.Principal,
    'isActive' : IDL.Bool,
    'trialStartDate' : IDL.Int,
    'subscriptionActive' : IDL.Bool,
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

  return IDL.Service({
    // Authorization methods
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    // Legacy methods (kept for compatibility)
    'createAppointment' : IDL.Func([Appointment], [IDL.Nat], []),
    'createCustomer' : IDL.Func([Customer], [IDL.Nat], []),
    'createService' : IDL.Func([Service], [IDL.Nat], []),
    'createStaff' : IDL.Func([Staff], [IDL.Nat], []),
    'deleteAppointment' : IDL.Func([IDL.Nat], [], []),
    'deleteCustomer' : IDL.Func([IDL.Nat], [], []),
    'deleteService' : IDL.Func([IDL.Nat], [], []),
    'deleteStaff' : IDL.Func([IDL.Nat], [], []),
    'getAllAppointments' : IDL.Func([], [IDL.Vec(Appointment)], ['query']),
    'getAllCustomers' : IDL.Func([], [IDL.Vec(Customer)], ['query']),
    'getAllServices' : IDL.Func([], [IDL.Vec(Service)], ['query']),
    'getAllStaff' : IDL.Func([], [IDL.Vec(Staff)], ['query']),
    'getAppointment' : IDL.Func([IDL.Nat], [Appointment], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getCustomer' : IDL.Func([IDL.Nat], [Customer], ['query']),
    'getDashboardStats' : IDL.Func([], [DashboardStats], ['query']),
    'getService' : IDL.Func([IDL.Nat], [Service], ['query']),
    'getStaff' : IDL.Func([IDL.Nat], [Staff], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'searchAppointmentsByCustomerName' : IDL.Func([IDL.Text], [IDL.Vec(Appointment)], ['query']),
    'searchCustomersByName' : IDL.Func([IDL.Text], [IDL.Vec(Customer)], ['query']),
    'updateAppointment' : IDL.Func([IDL.Nat, Appointment], [], []),
    'updateCustomer' : IDL.Func([IDL.Nat, Customer], [], []),
    'updateService' : IDL.Func([IDL.Nat, Service], [], []),
    'updateStaff' : IDL.Func([IDL.Nat, Staff], [], []),
    // Salon Owner APIs
    'registerSalon' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'updateMySalon' : IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text], [], []),
    'getMySalon' : IDL.Func([], [IDL.Opt(SalonWithId)], ['query']),
    'addSalonService' : IDL.Func([IDL.Nat, IDL.Text, IDL.Float64, IDL.Nat], [IDL.Nat], []),
    'deleteSalonService' : IDL.Func([IDL.Nat, IDL.Nat], [], []),
    'getSalonServices' : IDL.Func([IDL.Nat], [IDL.Vec(ServiceWithId)], ['query']),
    'getSalonAppointmentsForDate' : IDL.Func([IDL.Nat, IDL.Text], [IDL.Vec(AppointmentWithId)], ['query']),
    'getAllSalonAppointments' : IDL.Func([IDL.Nat], [IDL.Vec(AppointmentWithId)], ['query']),
    'updateAppointmentStatus' : IDL.Func([IDL.Nat, IDL.Text], [], []),
    // Customer APIs
    'getAllActiveSalons' : IDL.Func([], [IDL.Vec(SalonWithId)], ['query']),
    'getSalonById' : IDL.Func([IDL.Nat], [IDL.Opt(SalonWithId)], ['query']),
    'bookAppointment' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [IDL.Nat], []),
    'getMyAppointments' : IDL.Func([], [IDL.Vec(AppointmentWithId)], ['query']),
    'getQueueInfo' : IDL.Func([IDL.Nat], [IDL.Nat, IDL.Nat], ['query']),
    'saveCustomerProfile' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'getMyCustomerProfile' : IDL.Func([], [IDL.Opt(CustomerProfile)], ['query']),
    'setMyRolePreference' : IDL.Func([IDL.Text], [], []),
    'getMyRolePreference' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    // Admin APIs
    'setPlatformSubscriptionPrice' : IDL.Func([IDL.Float64], [], []),
    'getPlatformSubscriptionPrice' : IDL.Func([], [IDL.Float64], ['query']),
    'adminGetAllSalons' : IDL.Func([], [IDL.Vec(SalonWithId)], ['query']),
    'adminSetSalonSubscription' : IDL.Func([IDL.Nat, IDL.Bool], [], []),
    'adminSetSalonActive' : IDL.Func([IDL.Nat, IDL.Bool], [], []),
  });
};

export const init = ({ IDL }) => { return []; };

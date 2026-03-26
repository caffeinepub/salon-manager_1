/* eslint-disable */
// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export interface Appointment {
  'customerName' : string,
  'status' : AppointmentStatus,
  'serviceName' : string,
  'staffName' : string,
  'date' : string,
  'time' : string,
  'notes' : [] | [string],
  'price' : number,
}
export type AppointmentStatus = { 'cancelled' : null } |
  { 'pending' : null } |
  { 'completed' : null } |
  { 'confirmed' : null };
export interface Customer {
  'name' : string,
  'email' : string,
  'notes' : [] | [string],
  'phone' : string,
}
export interface DashboardStats {
  'totalServices' : bigint,
  'totalStaff' : bigint,
  'totalRevenue' : number,
  'totalAppointments' : bigint,
  'totalCustomers' : bigint,
}
export interface Service {
  'duration' : bigint,
  'name' : string,
  'description' : [] | [string],
  'price' : number,
}
export interface Staff {
  'name' : string,
  'role' : string,
  'email' : string,
  'specialty' : string,
  'phone' : string,
}
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };

export interface SalonWithId {
  'id' : bigint,
  'name' : string,
  'address' : string,
  'phone' : string,
  'city' : string,
  'ownerPrincipal' : Principal,
  'isActive' : boolean,
  'trialStartDate' : bigint,
  'subscriptionActive' : boolean,
}
export interface ServiceWithId {
  'id' : bigint,
  'salonId' : bigint,
  'name' : string,
  'price' : number,
  'durationMinutes' : bigint,
}
export interface AppointmentWithId {
  'id' : bigint,
  'salonId' : bigint,
  'customerPrincipal' : Principal,
  'customerName' : string,
  'customerPhone' : string,
  'serviceName' : string,
  'queueNumber' : bigint,
  'status' : string,
  'createdAt' : bigint,
  'date' : string,
}
export interface CustomerProfile {
  'name' : string,
  'phone' : string,
}

export interface _SERVICE {
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'createAppointment' : ActorMethod<[Appointment], bigint>,
  'createCustomer' : ActorMethod<[Customer], bigint>,
  'createService' : ActorMethod<[Service], bigint>,
  'createStaff' : ActorMethod<[Staff], bigint>,
  'deleteAppointment' : ActorMethod<[bigint], undefined>,
  'deleteCustomer' : ActorMethod<[bigint], undefined>,
  'deleteService' : ActorMethod<[bigint], undefined>,
  'deleteStaff' : ActorMethod<[bigint], undefined>,
  'getAllAppointments' : ActorMethod<[], Array<Appointment>>,
  'getAllCustomers' : ActorMethod<[], Array<Customer>>,
  'getAllServices' : ActorMethod<[], Array<Service>>,
  'getAllStaff' : ActorMethod<[], Array<Staff>>,
  'getAppointment' : ActorMethod<[bigint], Appointment>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getCustomer' : ActorMethod<[bigint], Customer>,
  'getDashboardStats' : ActorMethod<[], DashboardStats>,
  'getService' : ActorMethod<[bigint], Service>,
  'getStaff' : ActorMethod<[bigint], Staff>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'searchAppointmentsByCustomerName' : ActorMethod<[string], Array<Appointment>>,
  'searchCustomersByName' : ActorMethod<[string], Array<Customer>>,
  'updateAppointment' : ActorMethod<[bigint, Appointment], undefined>,
  'updateCustomer' : ActorMethod<[bigint, Customer], undefined>,
  'updateService' : ActorMethod<[bigint, Service], undefined>,
  'updateStaff' : ActorMethod<[bigint, Staff], undefined>,
  'registerSalon' : ActorMethod<[string, string, string, string], bigint>,
  'updateMySalon' : ActorMethod<[string, string, string, string], undefined>,
  'getMySalon' : ActorMethod<[], [] | [SalonWithId]>,
  'addSalonService' : ActorMethod<[bigint, string, number, bigint], bigint>,
  'deleteSalonService' : ActorMethod<[bigint, bigint], undefined>,
  'getSalonServices' : ActorMethod<[bigint], Array<ServiceWithId>>,
  'getSalonAppointmentsForDate' : ActorMethod<[bigint, string], Array<AppointmentWithId>>,
  'getAllSalonAppointments' : ActorMethod<[bigint], Array<AppointmentWithId>>,
  'updateAppointmentStatus' : ActorMethod<[bigint, string], undefined>,
  'getAllActiveSalons' : ActorMethod<[], Array<SalonWithId>>,
  'getSalonById' : ActorMethod<[bigint], [] | [SalonWithId]>,
  'bookAppointment' : ActorMethod<[bigint, string, string, string, string], bigint>,
  'getMyAppointments' : ActorMethod<[], Array<AppointmentWithId>>,
  'getQueueInfo' : ActorMethod<[bigint], [bigint, bigint]>,
  'saveCustomerProfile' : ActorMethod<[string, string], undefined>,
  'getMyCustomerProfile' : ActorMethod<[], [] | [CustomerProfile]>,
  'setMyRolePreference' : ActorMethod<[string], undefined>,
  'getMyRolePreference' : ActorMethod<[], [] | [string]>,
  'setPlatformSubscriptionPrice' : ActorMethod<[number], undefined>,
  'getPlatformSubscriptionPrice' : ActorMethod<[], number>,
  'adminGetAllSalons' : ActorMethod<[], Array<SalonWithId>>,
  'adminSetSalonSubscription' : ActorMethod<[bigint, boolean], undefined>,
  'adminSetSalonActive' : ActorMethod<[bigint, boolean], undefined>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

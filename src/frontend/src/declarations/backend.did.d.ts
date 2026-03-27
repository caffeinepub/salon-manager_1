import type { Principal } from '@dfinity/principal';

export interface SalonWithId {
  id: bigint;
  name: string;
  address: string;
  phone: string;
  city: string;
  ownerPrincipal: Principal;
  isActive: boolean;
  pendingApproval: boolean;
  trialStartDate: bigint;
  subscriptionActive: boolean;
  trialDays: bigint;
}

export interface ServiceWithId {
  id: bigint;
  salonId: bigint;
  name: string;
  price: number;
  durationMinutes: bigint;
}

export interface AppointmentWithId {
  id: bigint;
  salonId: bigint;
  customerPrincipal: Principal;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  queueNumber: bigint;
  status: string;
  createdAt: bigint;
  date: string;
}

export interface CustomerProfile {
  name: string;
  phone: string;
}

export interface AdminDashboardStats {
  total: bigint;
  active: bigint;
  expired: bigint;
  pending: bigint;
}

export interface _SERVICE {
  adminPasswordIsSet(): Promise<boolean>;
  adminSetPassword(email: string, passwordHash: string): Promise<boolean>;
  adminLogin(email: string, passwordHash: string): Promise<boolean>;
  adminGetDashboardStats(): Promise<AdminDashboardStats>;
  adminGetAllSalons(): Promise<SalonWithId[]>;
  adminGetPendingSalons(): Promise<SalonWithId[]>;
  adminApproveSalon(salonId: bigint): Promise<void>;
  adminRejectSalon(salonId: bigint): Promise<void>;
  adminSetSalonActive(salonId: bigint, active: boolean): Promise<void>;
  adminSetSalonSubscription(salonId: bigint, active: boolean): Promise<void>;
  adminGetDefaultTrialDays(): Promise<bigint>;
  adminSetDefaultTrialDays(days: bigint): Promise<void>;
  adminSetSalonTrialDays(salonId: bigint, days: bigint): Promise<void>;
  adminProcessTrialExpirations(): Promise<bigint>;
  registerSalon(name: string, address: string, phone: string, city: string): Promise<bigint>;
  updateMySalon(name: string, address: string, phone: string, city: string): Promise<void>;
  getMySalon(): Promise<[] | [SalonWithId]>;
  addSalonService(salonId: bigint, name: string, price: number, durationMinutes: bigint): Promise<bigint>;
  deleteSalonService(salonId: bigint, serviceId: bigint): Promise<void>;
  getSalonServices(salonId: bigint): Promise<ServiceWithId[]>;
  getSalonAppointmentsForDate(salonId: bigint, date: string): Promise<AppointmentWithId[]>;
  updateAppointmentStatus(appointmentId: bigint, status: string): Promise<void>;
  getAllActiveSalons(): Promise<SalonWithId[]>;
  getSalonById(id: bigint): Promise<[] | [SalonWithId]>;
  bookAppointment(salonId: bigint, customerName: string, customerPhone: string, serviceName: string, date: string): Promise<bigint>;
  getMyAppointments(): Promise<AppointmentWithId[]>;
  getQueueInfo(appointmentId: bigint): Promise<[bigint, bigint]>;
  saveCustomerProfile(name: string, phone: string): Promise<void>;
  getMyCustomerProfile(): Promise<[] | [CustomerProfile]>;
  isCallerAdmin(): Promise<boolean>;
}

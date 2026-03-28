import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SalonWithId {
    id: bigint;
    trialDays: bigint;
    city: string;
    name: string;
    ownerPhone: string;
    pendingApproval: boolean;
    isActive: boolean;
    subscriptionActive: boolean;
    address: string;
    phone: string;
    trialStartDate: bigint;
}
export interface OwnerRevenueSummary {
    monthlyEarnings: number;
    completedAppointments: bigint;
    totalEarnings: number;
    totalAppointments: bigint;
}
export interface ServiceWithId {
    id: bigint;
    name: string;
    durationMinutes: bigint;
    price: number;
    salonId: bigint;
}
export interface CustomerProfile {
    name: string;
    phone: string;
}
export interface RevenueStats {
    perSalon: Array<[bigint, string, number]>;
    totalRevenue: number;
    monthlyRevenue: number;
}
export interface DashboardStats {
    total: bigint;
    active: bigint;
    expired: bigint;
    pending: bigint;
}
export interface AppointmentWithId {
    id: bigint;
    customerName: string;
    status: string;
    serviceName: string;
    customerPhone: string;
    date: string;
    createdAt: bigint;
    queueNumber: bigint;
    servicePrice: number;
    salonId: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSalonServiceByPhone(ownerPhone: string, salonId: bigint, name: string, price: number, durationMinutes: bigint): Promise<bigint>;
    adminApproveSalon(salonId: bigint): Promise<void>;
    adminGetAllSalons(): Promise<Array<SalonWithId>>;
    adminGetAllSalonsForBackup(): Promise<Array<SalonWithId>>;
    adminGetAllServicesForBackup(): Promise<Array<ServiceWithId>>;
    adminGetAllAppointmentsForBackup(): Promise<Array<AppointmentWithId>>;
    adminGetAllCustomersForBackup(): Promise<Array<CustomerProfile>>;
    adminGetOwnerPhoneMapForBackup(): Promise<Array<[string, bigint]>>;
    adminGetNextIdsForBackup(): Promise<[bigint, bigint, bigint]>;
    adminRestoreAllData(salons: Array<SalonWithId>, services: Array<ServiceWithId>, appointments: Array<AppointmentWithId>, customers: Array<CustomerProfile>, ownerPhoneMap: Array<[string, bigint]>, nSalonId: bigint, nServiceId: bigint, nAppointmentId: bigint): Promise<void>;
    adminGetDashboardStats(): Promise<DashboardStats>;
    adminGetDefaultTrialDays(): Promise<bigint>;
    adminGetPendingSalons(): Promise<Array<SalonWithId>>;
    adminGetRevenueStats(): Promise<RevenueStats>;
    adminGetSubscriptionPrice(): Promise<number>;
    adminLogin(email: string, passwordHash: string): Promise<boolean>;
    adminPasswordIsSet(): Promise<boolean>;
    adminProcessTrialExpirations(): Promise<bigint>;
    adminRejectSalon(salonId: bigint): Promise<void>;
    adminSetDefaultTrialDays(days: bigint): Promise<void>;
    adminSetPassword(email: string, passwordHash: string): Promise<boolean>;
    adminSetSalonActive(salonId: bigint, active: boolean): Promise<void>;
    adminSetSalonSubscription(salonId: bigint, active: boolean): Promise<void>;
    adminSetSalonTrialDays(salonId: bigint, days: bigint): Promise<void>;
    adminSetSubscriptionPrice(price: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointmentByPhone(customerPhone: string, salonId: bigint, customerName: string, serviceName: string, date: string): Promise<bigint>;
    deleteSalonServiceByPhone(ownerPhone: string, salonId: bigint, serviceId: bigint): Promise<void>;
    getAllActiveSalons(): Promise<Array<SalonWithId>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyAppointmentsByPhone(customerPhone: string): Promise<Array<AppointmentWithId>>;
    getMyCustomerProfileByPhone(phone: string): Promise<CustomerProfile | null>;
    getOwnerRevenueSummaryByPhone(ownerPhone: string): Promise<OwnerRevenueSummary>;
    getOwnerSalonByPhone(ownerPhone: string): Promise<SalonWithId | null>;
    getQueueInfo(appointmentId: bigint): Promise<[bigint, bigint]>;
    getSalonAppointmentsForDateByPhone(ownerPhone: string, salonId: bigint, date: string): Promise<Array<AppointmentWithId>>;
    getSalonById(id: bigint): Promise<SalonWithId | null>;
    getSalonServices(salonId: bigint): Promise<Array<ServiceWithId>>;
    isCallerAdmin(): Promise<boolean>;
    registerSalonByPhone(ownerPhone: string, name: string, address: string, phone: string, city: string): Promise<bigint>;
    saveCustomerProfileByPhone(phone: string, name: string): Promise<void>;
    updateAppointmentStatusByPhone(ownerPhone: string, appointmentId: bigint, newStatus: string): Promise<void>;
    updateOwnerSalonByPhone(ownerPhone: string, name: string, address: string, phone: string, city: string): Promise<void>;
}

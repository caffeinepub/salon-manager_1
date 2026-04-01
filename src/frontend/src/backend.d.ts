import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface PushSubscription {
    endpoint: string;
    auth: string;
    p256dh: string;
}
export interface QueueScheduleEntry {
    customerName: string;
    serviceName: string;
    estimatedStartTime: bigint;
    queueNumber: bigint;
    appointmentId: bigint;
}
export interface ServiceWithId {
    id: bigint;
    name: string;
    durationMinutes: bigint;
    price: number;
    salonId: bigint;
}
export interface OwnerRevenueSummary {
    monthlyEarnings: number;
    completedAppointments: bigint;
    totalEarnings: number;
    totalAppointments: bigint;
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
export interface ServiceSession {
    startTime: bigint;
    durationMinutes: bigint;
    appointmentId: bigint;
}
export interface CustomerProfile {
    name: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSalonServiceByPhone(ownerPhone: string, salonId: bigint, name: string, price: number, durationMinutes: bigint): Promise<bigint>;
    adminApproveSalon(salonId: bigint): Promise<void>;
    adminGetAllAppointmentsForBackup(): Promise<Array<AppointmentWithId>>;
    adminGetAllCustomersForBackup(): Promise<Array<CustomerProfile>>;
    adminGetAllSalons(): Promise<Array<SalonWithId>>;
    adminGetAllSalonsForBackup(): Promise<Array<SalonWithId>>;
    adminGetAllServicesForBackup(): Promise<Array<ServiceWithId>>;
    adminGetDashboardStats(): Promise<DashboardStats>;
    adminGetDefaultTrialDays(): Promise<bigint>;
    adminGetNextIdsForBackup(): Promise<[bigint, bigint, bigint]>;
    adminGetOwnerPhoneMapForBackup(): Promise<Array<[string, bigint]>>;
    adminGetPendingSalons(): Promise<Array<SalonWithId>>;
    adminGetRevenueStats(): Promise<RevenueStats>;
    adminGetSubscriptionPrice(): Promise<number>;
    adminLogin(email: string, passwordHash: string): Promise<boolean>;
    adminPasswordIsSet(): Promise<boolean>;
    adminProcessTrialExpirations(): Promise<bigint>;
    adminRejectSalon(salonId: bigint): Promise<void>;
    adminResetOwnerPassword(ownerPhone: string, newPasswordHash: string): Promise<boolean>;
    adminRestoreAllData(salons: Array<SalonWithId>, svcs: Array<ServiceWithId>, appts: Array<AppointmentWithId>, custs: Array<CustomerProfile>, ownerPhoneMap: Array<[string, bigint]>, nSalonId: bigint, nServiceId: bigint, nAppointmentId: bigint): Promise<void>;
    adminSetDefaultTrialDays(days: bigint): Promise<void>;
    adminSetPassword(email: string, passwordHash: string): Promise<boolean>;
    adminSetSalonActive(salonId: bigint, active: boolean): Promise<void>;
    adminSetSalonSubscription(salonId: bigint, active: boolean): Promise<void>;
    adminSetSalonTrialDays(salonId: bigint, days: bigint): Promise<void>;
    adminSetSubscriptionPrice(price: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointmentByPhone(customerPhone: string, salonId: bigint, customerName: string, serviceName: string, date: string): Promise<bigint>;
    clearServiceSession(ownerPhone: string): Promise<void>;
    deleteSalonServiceByPhone(ownerPhone: string, salonId: bigint, serviceId: bigint): Promise<void>;
    getAllActiveSalons(): Promise<Array<SalonWithId>>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentServiceSession(salonId: bigint): Promise<ServiceSession | null>;
    getMyAppointmentsByPhone(customerPhone: string): Promise<Array<AppointmentWithId>>;
    getMyCustomerProfileByPhone(phone: string): Promise<CustomerProfile | null>;
    getOwnerRevenueSummaryByPhone(ownerPhone: string): Promise<OwnerRevenueSummary>;
    getOwnerSalonByPhone(ownerPhone: string): Promise<SalonWithId | null>;
    getPendingNotifications(salonId: bigint, date: string): Promise<Array<bigint>>;
    getPushSubscription(requestorPhone: string, customerPhone: string): Promise<PushSubscription | null>;
    getQueueInfo(appointmentId: bigint): Promise<[bigint, bigint]>;
    getQueueScheduleForSalon(salonId: bigint, date: string): Promise<Array<QueueScheduleEntry>>;
    getSalonAppointmentsForDateByPhone(ownerPhone: string, salonId: bigint, date: string): Promise<Array<AppointmentWithId>>;
    getSalonById(id: bigint): Promise<SalonWithId | null>;
    getSalonServices(salonId: bigint): Promise<Array<ServiceWithId>>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationSent(ownerPhone: string, appointmentId: bigint): Promise<void>;
    registerSalonByPhone(ownerPhone: string, name: string, address: string, phone: string, city: string): Promise<bigint>;
    salonOwnerLogin(ownerPhone: string, passwordHash: string): Promise<[string, SalonWithId | null]>;
    salonOwnerRegisterV2(ownerPhone: string, salonName: string, services: Array<string>, passwordHash: string): Promise<string>;
    salonOwnerSetPassword(ownerPhone: string, passwordHash: string): Promise<boolean>;
    saveCustomerProfileByPhone(phone: string, name: string): Promise<void>;
    savePushSubscription(customerPhone: string, endpoint: string, p256dh: string, auth: string): Promise<void>;
    startServiceSession(ownerPhone: string, appointmentId: bigint, durationMinutes: bigint): Promise<void>;
    updateAppointmentStatusByPhone(ownerPhone: string, appointmentId: bigint, newStatus: string): Promise<void>;
    updateOwnerSalonByPhone(ownerPhone: string, name: string, address: string, phone: string, city: string): Promise<void>;
}

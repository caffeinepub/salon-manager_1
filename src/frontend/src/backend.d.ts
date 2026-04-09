import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PushSubscription {
    endpoint: string;
    auth: string;
    p256dh: string;
}
export interface SalonPhoto {
    id: bigint;
    url: string;
    ownerPhone: string;
    salonId: bigint;
    uploadedAt: bigint;
}
export interface SubscriptionHistory {
    id: bigint;
    finalPrice: number;
    originalPrice: number;
    endDate: bigint;
    approvedAt: bigint;
    ownerPhone: string;
    discountPercent: number;
    savings: number;
    planDays: bigint;
    planName: string;
    salonName: string;
    salonId: bigint;
    transactionId: string;
    startDate: bigint;
}
export interface CustomerProfile {
    name: string;
    phone: string;
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
    latitude?: number;
    trialDays: bigint;
    city: string;
    name: string;
    ownerPhone: string;
    pendingApproval: boolean;
    isActive: boolean;
    subscriptionActive: boolean;
    longitude?: number;
    address: string;
    phone: string;
    trialStartDate: bigint;
    closedDays: Array<boolean>;
}
export interface PlanPricing {
    originalPrice: number;
    discountPercent: number;
    planDays: bigint;
    planName: string;
}
export interface QueueScheduleEntry {
    customerName: string;
    serviceName: string;
    estimatedStartTime: bigint;
    queueNumber: bigint;
    appointmentId: bigint;
}
export interface SubRequest {
    id: bigint;
    finalPrice: number;
    status: string;
    originalPrice: number;
    approvedAt: bigint;
    ownerPhone: string;
    discountPercent: number;
    savings: number;
    planDays: bigint;
    screenshotBase64: string;
    planName: string;
    salonName: string;
    requestTime: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSalonServiceByPhone(ownerPhone: string, salonId: bigint, name: string, price: number, durationMinutes: bigint): Promise<bigint>;
    adminApproveSalon(email: string, passwordHash: string, salonId: bigint): Promise<void>;
    adminApproveSubRequest(email: string, passwordHash: string, requestId: bigint): Promise<boolean>;
    adminExpireOldSubRequests(email: string, passwordHash: string): Promise<bigint>;
    adminGetAllAppointmentsForBackup(email: string, passwordHash: string): Promise<Array<AppointmentWithId>>;
    adminGetAllCustomersForBackup(email: string, passwordHash: string): Promise<Array<CustomerProfile>>;
    adminGetAllPlanPricings(email: string, passwordHash: string): Promise<Array<PlanPricing>>;
    adminGetAllSalons(email: string, passwordHash: string): Promise<Array<SalonWithId>>;
    adminGetAllSalonsForBackup(email: string, passwordHash: string): Promise<Array<SalonWithId>>;
    adminGetAllServicesForBackup(email: string, passwordHash: string): Promise<Array<ServiceWithId>>;
    adminGetAllSubRequests(email: string, passwordHash: string): Promise<Array<SubRequest>>;
    adminGetDashboardStats(email: string, passwordHash: string): Promise<DashboardStats>;
    adminGetDefaultTrialDays(email: string, passwordHash: string): Promise<bigint>;
    adminGetNextIdsForBackup(email: string, passwordHash: string): Promise<[bigint, bigint, bigint]>;
    adminGetOwnerPhoneMapForBackup(email: string, passwordHash: string): Promise<Array<[string, bigint]>>;
    adminGetPendingSalons(email: string, passwordHash: string): Promise<Array<SalonWithId>>;
    adminGetPendingSubRequests(email: string, passwordHash: string): Promise<Array<SubRequest>>;
    adminGetRevenueStats(email: string, passwordHash: string): Promise<RevenueStats>;
    adminGetSubHistory(email: string, passwordHash: string): Promise<Array<SubscriptionHistory>>;
    adminGetSubRequestEarnings(email: string, passwordHash: string): Promise<[number, number, bigint]>;
    adminGetSubscriptionPrice(email: string, passwordHash: string): Promise<number>;
    adminLogin(email: string, passwordHash: string): Promise<boolean>;
    adminPasswordIsSet(): Promise<boolean>;
    adminProcessTrialExpirations(email: string, passwordHash: string): Promise<bigint>;
    adminRejectSalon(email: string, passwordHash: string, salonId: bigint): Promise<void>;
    adminRejectSubRequest(email: string, passwordHash: string, requestId: bigint): Promise<boolean>;
    adminResetOwnerPassword(email: string, passwordHash: string, ownerPhone: string, newPasswordHash: string): Promise<boolean>;
    adminRestoreAllData(email: string, passwordHash: string, salons: Array<SalonWithId>, svcs: Array<ServiceWithId>, appts: Array<AppointmentWithId>, custs: Array<CustomerProfile>, ownerPhoneMap: Array<[string, bigint]>, nSalonId: bigint, nServiceId: bigint, nAppointmentId: bigint): Promise<void>;
    adminSetDefaultTrialDays(email: string, passwordHash: string, days: bigint): Promise<void>;
    adminSetPassword(email: string, passwordHash: string): Promise<boolean>;
    adminSetPlanPricing(email: string, passwordHash: string, planName: string, originalPrice: number, discountPercent: number): Promise<void>;
    adminSetSalonActive(email: string, passwordHash: string, salonId: bigint, active: boolean): Promise<void>;
    adminSetSalonSubscription(email: string, passwordHash: string, salonId: bigint, active: boolean): Promise<void>;
    adminSetSalonTrialDays(email: string, passwordHash: string, salonId: bigint, days: bigint): Promise<void>;
    adminSetSubscriptionPrice(email: string, passwordHash: string, price: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookAppointmentByPhone(customerPhone: string, salonId: bigint, customerName: string, serviceName: string, date: string): Promise<bigint>;
    clearServiceSession(ownerPhone: string): Promise<void>;
    deleteSalonPhoto(ownerPhone: string, passwordHash: string, photoId: bigint): Promise<boolean>;
    deleteSalonServiceByPhone(ownerPhone: string, salonId: bigint, serviceId: bigint): Promise<void>;
    getAllActiveSalons(): Promise<Array<SalonWithId>>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentServiceSession(salonId: bigint): Promise<ServiceSession | null>;
    getMyAppointmentsByPhone(customerPhone: string): Promise<Array<AppointmentWithId>>;
    getMyCustomerProfileByPhone(phone: string): Promise<CustomerProfile | null>;
    getMySubHistory(ownerPhone: string): Promise<Array<SubscriptionHistory>>;
    getMySubRequests(ownerPhone: string): Promise<Array<SubRequest>>;
    getOwnerRevenueSummaryByPhone(ownerPhone: string): Promise<OwnerRevenueSummary>;
    getOwnerSalonByPhone(ownerPhone: string): Promise<SalonWithId | null>;
    getPendingNotifications(salonId: bigint, date: string): Promise<Array<bigint>>;
    getPlanPricings(): Promise<Array<PlanPricing>>;
    getPushSubscription(requestorPhone: string, customerPhone: string): Promise<PushSubscription | null>;
    getQueueInfo(appointmentId: bigint): Promise<[bigint, bigint]>;
    getQueueScheduleForSalon(salonId: bigint, date: string): Promise<Array<QueueScheduleEntry>>;
    getSalonAppointmentsForDateByPhone(ownerPhone: string, salonId: bigint, date: string): Promise<Array<AppointmentWithId>>;
    getSalonById(id: bigint): Promise<SalonWithId | null>;
    getSalonClosedDays(salonId: bigint): Promise<{
        __kind__: "ok";
        ok: Array<boolean>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getSalonPhotos(salonId: bigint): Promise<Array<SalonPhoto>>;
    getSalonServices(salonId: bigint): Promise<Array<ServiceWithId>>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationSent(ownerPhone: string, appointmentId: bigint): Promise<void>;
    registerSalonByPhone(ownerPhone: string, name: string, address: string, phone: string, city: string): Promise<bigint>;
    salonOwnerLogin(ownerPhone: string, passwordHash: string): Promise<[string, SalonWithId | null]>;
    salonOwnerRegisterV2(ownerPhone: string, salonName: string, services: Array<string>, passwordHash: string): Promise<string>;
    salonOwnerSetPassword(ownerPhone: string, passwordHash: string): Promise<boolean>;
    saveCustomerProfileByPhone(phone: string, name: string): Promise<void>;
    savePushSubscription(customerPhone: string, endpoint: string, p256dh: string, auth: string): Promise<void>;
    setSalonClosedDays(ownerPhone: string, passwordHash: string, closedDays: Array<boolean>): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    startServiceSession(ownerPhone: string, appointmentId: bigint, durationMinutes: bigint): Promise<void>;
    submitSubscriptionRequest(ownerPhone: string, salonName: string, planName: string, planDays: bigint, originalPrice: number, discountPercent: number, finalPrice: number, savings: number, screenshotBase64: string): Promise<bigint>;
    updateAppointmentStatusByPhone(ownerPhone: string, appointmentId: bigint, newStatus: string): Promise<void>;
    updateOwnerSalonByPhone(ownerPhone: string, name: string, address: string, phone: string, city: string): Promise<void>;
    updateSalonLocation(ownerPhone: string, passwordHash: string, latitude: number, longitude: number): Promise<boolean>;
    uploadSalonPhoto(ownerPhone: string, passwordHash: string, url: string): Promise<bigint>;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Staff {
    name: string;
    role: string;
    email: string;
    specialty: string;
    phone: string;
}
export interface Service {
    duration: bigint;
    name: string;
    description?: string;
    price: number;
}
export interface Appointment {
    customerName: string;
    status: AppointmentStatus;
    serviceName: string;
    staffName: string;
    date: string;
    time: string;
    notes?: string;
    price: number;
}
export interface Customer {
    name: string;
    email: string;
    notes?: string;
    phone: string;
}
export interface DashboardStats {
    totalServices: bigint;
    totalStaff: bigint;
    totalRevenue: number;
    totalAppointments: bigint;
    totalCustomers: bigint;
}
export interface UserProfile {
    name: string;
}
export enum AppointmentStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAppointment(appointment: Appointment): Promise<bigint>;
    createCustomer(customer: Customer): Promise<bigint>;
    createService(service: Service): Promise<bigint>;
    createStaff(staffMember: Staff): Promise<bigint>;
    deleteAppointment(id: bigint): Promise<void>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteService(id: bigint): Promise<void>;
    deleteStaff(id: bigint): Promise<void>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllServices(): Promise<Array<Service>>;
    getAllStaff(): Promise<Array<Staff>>;
    getAppointment(id: bigint): Promise<Appointment>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: bigint): Promise<Customer>;
    getDashboardStats(): Promise<DashboardStats>;
    getService(id: bigint): Promise<Service>;
    getStaff(id: bigint): Promise<Staff>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchAppointmentsByCustomerName(customerName: string): Promise<Array<Appointment>>;
    searchCustomersByName(name: string): Promise<Array<Customer>>;
    updateAppointment(id: bigint, appointment: Appointment): Promise<void>;
    updateCustomer(id: bigint, customer: Customer): Promise<void>;
    updateService(id: bigint, service: Service): Promise<void>;
    updateStaff(id: bigint, staffMember: Staff): Promise<void>;
}

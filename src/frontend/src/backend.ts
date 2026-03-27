/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
function candid_some<T>(value: T): [T] { return [value]; }
function candid_none<T>(): [] { return []; }
function record_opt_to_undefined<T>(arg: T | null): T | undefined { return arg == null ? undefined : arg; }

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null){
        if (blob) { this._blob = blob; }
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob { return new ExternalBlob(url, null); }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) { return this._blob; }
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string { return this.directURL; }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export interface SalonWithId {
    id: bigint;
    name: string;
    address: string;
    phone: string;
    city: string;
    ownerPrincipal: any;
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
    customerPrincipal: any;
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
    // Admin auth
    adminPasswordIsSet(): Promise<boolean>;
    adminSetPassword(email: string, passwordHash: string): Promise<boolean>;
    adminLogin(email: string, passwordHash: string): Promise<boolean>;
    // Admin dashboard
    adminGetDashboardStats(): Promise<AdminDashboardStats>;
    adminGetAllSalons(): Promise<Array<SalonWithId>>;
    adminGetPendingSalons(): Promise<Array<SalonWithId>>;
    adminApproveSalon(salonId: bigint): Promise<void>;
    adminRejectSalon(salonId: bigint): Promise<void>;
    adminSetSalonActive(salonId: bigint, active: boolean): Promise<void>;
    adminSetSalonSubscription(salonId: bigint, active: boolean): Promise<void>;
    adminGetDefaultTrialDays(): Promise<bigint>;
    adminSetDefaultTrialDays(days: bigint): Promise<void>;
    adminSetSalonTrialDays(salonId: bigint, days: bigint): Promise<void>;
    adminProcessTrialExpirations(): Promise<bigint>;
    // Salon owner
    registerSalon(name: string, address: string, phone: string, city: string): Promise<bigint>;
    updateMySalon(name: string, address: string, phone: string, city: string): Promise<void>;
    getMySalon(): Promise<SalonWithId | null>;
    addSalonService(salonId: bigint, name: string, price: number, durationMinutes: bigint): Promise<bigint>;
    deleteSalonService(salonId: bigint, serviceId: bigint): Promise<void>;
    getSalonServices(salonId: bigint): Promise<Array<ServiceWithId>>;
    getSalonAppointmentsForDate(salonId: bigint, date: string): Promise<Array<AppointmentWithId>>;
    updateAppointmentStatus(appointmentId: bigint, newStatus: string): Promise<void>;
    // Customer
    getAllActiveSalons(): Promise<Array<SalonWithId>>;
    getSalonById(id: bigint): Promise<SalonWithId | null>;
    bookAppointment(salonId: bigint, customerName: string, customerPhone: string, serviceName: string, date: string): Promise<bigint>;
    getMyAppointments(): Promise<Array<AppointmentWithId>>;
    getQueueInfo(appointmentId: bigint): Promise<[bigint, bigint]>;
    saveCustomerProfile(name: string, phone: string): Promise<void>;
    getMyCustomerProfile(): Promise<CustomerProfile | null>;
    // Legacy
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    getDashboardStats(): Promise<DashboardStats>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllServices(): Promise<Array<Service>>;
    getAllStaff(): Promise<Array<Staff>>;
    createAppointment(appointment: Appointment): Promise<bigint>;
    createCustomer(customer: Customer): Promise<bigint>;
    createService(service: Service): Promise<bigint>;
    createStaff(staffMember: Staff): Promise<bigint>;
    deleteAppointment(id: bigint): Promise<void>;
    deleteCustomer(id: bigint): Promise<void>;
    deleteService(id: bigint): Promise<void>;
    deleteStaff(id: bigint): Promise<void>;
    searchAppointmentsByCustomerName(customerName: string): Promise<Array<Appointment>>;
    searchCustomersByName(name: string): Promise<Array<Customer>>;
    updateAppointment(id: bigint, appointment: Appointment): Promise<void>;
    updateCustomer(id: bigint, customer: Customer): Promise<void>;
    updateService(id: bigint, service: Service): Promise<void>;
    updateStaff(id: bigint, staffMember: Staff): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getCustomer(id: bigint): Promise<Customer>;
    getService(id: bigint): Promise<Service>;
    getStaff(id: bigint): Promise<Staff>;
    getAppointment(id: bigint): Promise<Appointment>;
}

export class Backend implements backendInterface {
    constructor(private actor: ActorSubclass<_SERVICE>, private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, private processError?: (error: unknown) => never){}

    private async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.processError) {
            try { return await fn(); } catch (e) { this.processError(e); throw new Error("unreachable"); }
        }
        return await fn();
    }

    async adminPasswordIsSet(): Promise<boolean> { return this.call(() => this.actor.adminPasswordIsSet()); }
    async adminSetPassword(email: string, passwordHash: string): Promise<boolean> { return this.call(() => this.actor.adminSetPassword(email, passwordHash)); }
    async adminLogin(email: string, passwordHash: string): Promise<boolean> { return this.call(() => this.actor.adminLogin(email, passwordHash)); }
    async adminGetDashboardStats(): Promise<AdminDashboardStats> { return this.call(() => this.actor.adminGetDashboardStats()); }
    async adminGetAllSalons(): Promise<Array<SalonWithId>> { return this.call(() => this.actor.adminGetAllSalons()); }
    async adminGetPendingSalons(): Promise<Array<SalonWithId>> { return this.call(() => this.actor.adminGetPendingSalons()); }
    async adminApproveSalon(salonId: bigint): Promise<void> { return this.call(() => this.actor.adminApproveSalon(salonId)); }
    async adminRejectSalon(salonId: bigint): Promise<void> { return this.call(() => this.actor.adminRejectSalon(salonId)); }
    async adminSetSalonActive(salonId: bigint, active: boolean): Promise<void> { return this.call(() => this.actor.adminSetSalonActive(salonId, active)); }
    async adminSetSalonSubscription(salonId: bigint, active: boolean): Promise<void> { return this.call(() => this.actor.adminSetSalonSubscription(salonId, active)); }
    async adminGetDefaultTrialDays(): Promise<bigint> { return this.call(() => this.actor.adminGetDefaultTrialDays()); }
    async adminSetDefaultTrialDays(days: bigint): Promise<void> { return this.call(() => this.actor.adminSetDefaultTrialDays(days)); }
    async adminSetSalonTrialDays(salonId: bigint, days: bigint): Promise<void> { return this.call(() => this.actor.adminSetSalonTrialDays(salonId, days)); }
    async adminProcessTrialExpirations(): Promise<bigint> { return this.call(() => this.actor.adminProcessTrialExpirations()); }
    async registerSalon(a: string, b: string, c: string, d: string): Promise<bigint> { return this.call(() => this.actor.registerSalon(a, b, c, d)); }
    async updateMySalon(a: string, b: string, c: string, d: string): Promise<void> { return this.call(() => this.actor.updateMySalon(a, b, c, d)); }
    async getMySalon(): Promise<SalonWithId | null> {
        const r = await this.call(() => this.actor.getMySalon());
        return r && r.length > 0 ? r[0] : null;
    }
    async addSalonService(salonId: bigint, name: string, price: number, durationMinutes: bigint): Promise<bigint> { return this.call(() => this.actor.addSalonService(salonId, name, price, durationMinutes)); }
    async deleteSalonService(salonId: bigint, serviceId: bigint): Promise<void> { return this.call(() => this.actor.deleteSalonService(salonId, serviceId)); }
    async getSalonServices(salonId: bigint): Promise<Array<ServiceWithId>> { return this.call(() => this.actor.getSalonServices(salonId)); }
    async getSalonAppointmentsForDate(salonId: bigint, date: string): Promise<Array<AppointmentWithId>> { return this.call(() => this.actor.getSalonAppointmentsForDate(salonId, date)); }
    async updateAppointmentStatus(appointmentId: bigint, newStatus: string): Promise<void> { return this.call(() => this.actor.updateAppointmentStatus(appointmentId, newStatus)); }
    async getAllActiveSalons(): Promise<Array<SalonWithId>> { return this.call(() => this.actor.getAllActiveSalons()); }
    async getSalonById(id: bigint): Promise<SalonWithId | null> {
        const r = await this.call(() => this.actor.getSalonById(id));
        return r && r.length > 0 ? r[0] : null;
    }
    async bookAppointment(salonId: bigint, customerName: string, customerPhone: string, serviceName: string, date: string): Promise<bigint> { return this.call(() => this.actor.bookAppointment(salonId, customerName, customerPhone, serviceName, date)); }
    async getMyAppointments(): Promise<Array<AppointmentWithId>> { return this.call(() => this.actor.getMyAppointments()); }
    async getQueueInfo(appointmentId: bigint): Promise<[bigint, bigint]> { return this.call(() => this.actor.getQueueInfo(appointmentId)); }
    async saveCustomerProfile(name: string, phone: string): Promise<void> { return this.call(() => this.actor.saveCustomerProfile(name, phone)); }
    async getMyCustomerProfile(): Promise<CustomerProfile | null> {
        const r = await this.call(() => this.actor.getMyCustomerProfile());
        return r && r.length > 0 ? r[0] : null;
    }
    async _initializeAccessControlWithSecret(arg0: string): Promise<void> {
        try { await this.actor._initializeAccessControlWithSecret(arg0); } catch {}
    }
    async isCallerAdmin(): Promise<boolean> {
        try { return await this.actor.isCallerAdmin(); } catch { return false; }
    }
    async getCallerUserProfile(): Promise<UserProfile | null> {
        try {
            const r = await this.actor.getCallerUserProfile();
            return r && r.length > 0 ? r[0] : null;
        } catch { return null; }
    }
    async saveCallerUserProfile(profile: UserProfile): Promise<void> {
        try { await this.actor.saveCallerUserProfile(profile); } catch {}
    }
    async getDashboardStats(): Promise<DashboardStats> {
        try { return await this.actor.getDashboardStats(); } catch { return { totalServices: 0n, totalStaff: 0n, totalRevenue: 0, totalAppointments: 0n, totalCustomers: 0n }; }
    }
    async getAllAppointments(): Promise<Array<Appointment>> {
        try { return await this.actor.getAllAppointments() as any; } catch { return []; }
    }
    async getAllCustomers(): Promise<Array<Customer>> {
        try { return await this.actor.getAllCustomers() as any; } catch { return []; }
    }
    async getAllServices(): Promise<Array<Service>> {
        try { return await this.actor.getAllServices() as any; } catch { return []; }
    }
    async getAllStaff(): Promise<Array<Staff>> {
        try { return await this.actor.getAllStaff(); } catch { return []; }
    }
    async createAppointment(a: Appointment): Promise<bigint> {
        try { return await this.actor.createAppointment(a as any); } catch { return 0n; }
    }
    async createCustomer(a: Customer): Promise<bigint> {
        try { return await this.actor.createCustomer(a as any); } catch { return 0n; }
    }
    async createService(a: Service): Promise<bigint> {
        try { return await this.actor.createService(a as any); } catch { return 0n; }
    }
    async createStaff(a: Staff): Promise<bigint> {
        try { return await this.actor.createStaff(a); } catch { return 0n; }
    }
    async deleteAppointment(id: bigint): Promise<void> {
        try { await this.actor.deleteAppointment(id); } catch {}
    }
    async deleteCustomer(id: bigint): Promise<void> {
        try { await this.actor.deleteCustomer(id); } catch {}
    }
    async deleteService(id: bigint): Promise<void> {
        try { await this.actor.deleteService(id); } catch {}
    }
    async deleteStaff(id: bigint): Promise<void> {
        try { await this.actor.deleteStaff(id); } catch {}
    }
    async searchAppointmentsByCustomerName(name: string): Promise<Array<Appointment>> {
        try { return await this.actor.searchAppointmentsByCustomerName(name) as any; } catch { return []; }
    }
    async searchCustomersByName(name: string): Promise<Array<Customer>> {
        try { return await this.actor.searchCustomersByName(name) as any; } catch { return []; }
    }
    async updateAppointment(id: bigint, a: Appointment): Promise<void> {
        try { await this.actor.updateAppointment(id, a as any); } catch {}
    }
    async updateCustomer(id: bigint, a: Customer): Promise<void> {
        try { await this.actor.updateCustomer(id, a as any); } catch {}
    }
    async updateService(id: bigint, a: Service): Promise<void> {
        try { await this.actor.updateService(id, a as any); } catch {}
    }
    async updateStaff(id: bigint, a: Staff): Promise<void> {
        try { await this.actor.updateStaff(id, a); } catch {}
    }
    async assignCallerUserRole(user: Principal, role: UserRole): Promise<void> {
        try { await this.actor.assignCallerUserRole(user, { [role]: null } as any); } catch {}
    }
    async getCallerUserRole(): Promise<UserRole> {
        try {
            const r = await this.actor.getCallerUserRole();
            return (Object.keys(r as any)[0] as UserRole) ?? UserRole.guest;
        } catch { return UserRole.guest; }
    }
    async getUserProfile(user: Principal): Promise<UserProfile | null> {
        try {
            const r = await this.actor.getUserProfile(user);
            return r && r.length > 0 ? r[0] : null;
        } catch { return null; }
    }
    async getCustomer(id: bigint): Promise<Customer> {
        return await this.actor.getCustomer(id) as any;
    }
    async getService(id: bigint): Promise<Service> {
        return await this.actor.getService(id) as any;
    }
    async getStaff(id: bigint): Promise<Staff> {
        return await this.actor.getStaff(id);
    }
    async getAppointment(id: bigint): Promise<Appointment> {
        return await this.actor.getAppointment(id) as any;
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}
export function createActor(canisterId: string, _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>, _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>, options: CreateActorOptions = {}): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    const actor = Actor.createActor<_SERVICE>(idlFactory, { agent, canisterId, ...options.actorOptions });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}

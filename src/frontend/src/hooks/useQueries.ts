import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Core data types (mirrors backend.d.ts) ─────────────────────────────────

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

export interface CustomerProfile {
  name: string;
  phone: string;
  createdAt?: bigint;
}

export interface DashboardStats {
  total: bigint;
  active: bigint;
  expired: bigint;
  pending: bigint;
}

export interface QueueScheduleEntry {
  customerName: string;
  serviceName: string;
  estimatedStartTime: bigint;
  queueNumber: bigint;
  appointmentId: bigint;
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
  latitude?: number | null;
  longitude?: number | null;
}

export interface ServiceSession {
  startTime: bigint;
  durationMinutes: bigint;
  appointmentId: bigint;
}

export interface ServiceWithId {
  id: bigint;
  name: string;
  durationMinutes: bigint;
  price: number;
  salonId: bigint;
}

const ADMIN_EMAIL = "amitkrji498@gmail.com";
function getAdminHash(): string {
  return typeof window !== "undefined"
    ? (localStorage.getItem("salon360_admin_hash") ?? "")
    : "";
}

// Local types for subscription system
export interface PlanPricingType {
  planName: string;
  planDays: bigint;
  originalPrice: number;
  discountPercent: number;
}

export interface SubRequestType {
  id: bigint;
  ownerPhone: string;
  salonName: string;
  planName: string;
  planDays: bigint;
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  savings: number;
  requestTime: bigint;
  screenshotBase64: string;
  status: string;
  approvedAt: bigint;
}

export interface SubscriptionHistoryType {
  id: bigint;
  salonId: bigint;
  ownerPhone: string;
  salonName: string;
  planName: string;
  planDays: bigint;
  originalPrice: number;
  discountPercent: number;
  finalPrice: number;
  savings: number;
  startDate: bigint;
  endDate: bigint;
  approvedAt: bigint;
  transactionId: string;
}

export interface SalonPhotoType {
  id: bigint;
  salonId: bigint;
  ownerPhone: string;
  url: string;
  uploadedAt: bigint;
}

import { useActor } from "./useActor";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "inprogress"
  | "completed"
  | "cancelled";

// ============================================================
// Admin hooks — ALL pass ADMIN_EMAIL + getAdminHash()
// ============================================================

export function useAdminGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      if (!actor) return { total: 0n, active: 0n, expired: 0n, pending: 0n };
      return (actor as any).adminGetDashboardStats(ADMIN_EMAIL, getAdminHash());
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useAdminGetSubscriptionPrice() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["adminSubscriptionPrice"],
    queryFn: async () => {
      if (!actor) return 149;
      return (actor as any).adminGetSubscriptionPrice(
        ADMIN_EMAIL,
        getAdminHash(),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSetSubscriptionPrice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (price: number) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminSetSubscriptionPrice(
        ADMIN_EMAIL,
        getAdminHash(),
        price,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminSubscriptionPrice"] }),
  });
}

export function useAdminGetAllSalons() {
  const { actor, isFetching } = useActor();
  return useQuery<SalonWithId[]>({
    queryKey: ["adminAllSalons"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetAllSalons(ADMIN_EMAIL, getAdminHash());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetPendingSalons() {
  const { actor, isFetching } = useActor();
  return useQuery<SalonWithId[]>({
    queryKey: ["adminPendingSalons"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).adminGetPendingSalons(ADMIN_EMAIL, getAdminHash());
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useAdminApproveSalon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminApproveSalon(
        ADMIN_EMAIL,
        getAdminHash(),
        salonId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingSalons"] });
      qc.invalidateQueries({ queryKey: ["adminAllSalons"] });
      qc.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });
}

export function useAdminRejectSalon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminRejectSalon(
        ADMIN_EMAIL,
        getAdminHash(),
        salonId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingSalons"] });
      qc.invalidateQueries({ queryKey: ["adminAllSalons"] });
      qc.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });
}

export function useAdminResetOwnerPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      ownerPhone,
      newPasswordHash,
    }: { ownerPhone: string; newPasswordHash: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminResetOwnerPassword(
        ADMIN_EMAIL,
        getAdminHash(),
        ownerPhone,
        newPasswordHash,
      );
    },
  });
}

export function useAdminSetSalonSubscription() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      active,
    }: { salonId: bigint; active: boolean }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminSetSalonSubscription(
        ADMIN_EMAIL,
        getAdminHash(),
        salonId,
        active,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAllSalons"] });
      qc.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });
}

export function useAdminSetSalonActive() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      active,
    }: { salonId: bigint; active: boolean }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminSetSalonActive(
        ADMIN_EMAIL,
        getAdminHash(),
        salonId,
        active,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAllSalons"] });
      qc.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });
}

export function useAdminGetDefaultTrialDays() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["adminDefaultTrialDays"],
    queryFn: async () => {
      if (!actor) return 7;
      const result = await (actor as any).adminGetDefaultTrialDays(
        ADMIN_EMAIL,
        getAdminHash(),
      );
      return Number(result);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSetDefaultTrialDays() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (days: number) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminSetDefaultTrialDays(
        ADMIN_EMAIL,
        getAdminHash(),
        BigInt(days),
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["adminDefaultTrialDays"] }),
  });
}

export function useAdminSetSalonTrialDays() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      days,
    }: { salonId: bigint; days: bigint }) => {
      if (!actor) throw new Error("No actor");
      const adminHash = getAdminHash();
      return (actor as any).adminSetSalonTrialDays(
        ADMIN_EMAIL,
        adminHash,
        salonId,
        days,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminAllSalons"] }),
  });
}

export function useAdminProcessTrialExpirations() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminProcessTrialExpirations(
        ADMIN_EMAIL,
        getAdminHash(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminAllSalons"] });
      qc.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
  });
}

export function useAdminGetRevenueStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminRevenueStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminGetRevenueStats(ADMIN_EMAIL, getAdminHash());
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

// ── BACKUP ──────────────────────────────────────────────────────────────────

export function useAdminBackup() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend not ready");
      const adminHash = getAdminHash();
      const [salons, services, appointments, customers, ownerMap, nextIds] =
        await Promise.all([
          (actor as any).adminGetAllSalonsForBackup(ADMIN_EMAIL, adminHash),
          (actor as any).adminGetAllServicesForBackup(ADMIN_EMAIL, adminHash),
          (actor as any).adminGetAllAppointmentsForBackup(
            ADMIN_EMAIL,
            adminHash,
          ),
          (actor as any).adminGetAllCustomersForBackup(ADMIN_EMAIL, adminHash),
          (actor as any).adminGetOwnerPhoneMapForBackup(ADMIN_EMAIL, adminHash),
          (actor as any).adminGetNextIdsForBackup(ADMIN_EMAIL, adminHash),
        ]);
      return { salons, services, appointments, customers, ownerMap, nextIds };
    },
  });
}

export function useAdminRestore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      salons: any[];
      services: any[];
      appointments: any[];
      customers: any[];
      ownerMap: [string, bigint][];
      nextIds: [bigint, bigint, bigint];
    }) => {
      if (!actor) throw new Error("Backend not ready");
      await (actor as any).adminRestoreAllData(
        ADMIN_EMAIL,
        getAdminHash(),
        data.salons,
        data.services,
        data.appointments,
        data.customers,
        data.ownerMap,
        data.nextIds[0],
        data.nextIds[1],
        data.nextIds[2],
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// ============================================================
// Salon owner hooks (phone-based)
// ============================================================

export function useGetMySalon(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SalonWithId | null>({
    queryKey: ["mySalon", phone],
    queryFn: async () => {
      if (!actor || !phone) return null;
      const result = await (actor as any).getOwnerSalonByPhone(phone);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!phone,
  });
}

export function useRegisterSalon(phone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      address,
      salonPhone,
      city,
    }: { name: string; address: string; salonPhone: string; city: string }) => {
      // Wait for actor to be ready (up to 45 seconds)
      let resolvedActor = actor;
      if (!resolvedActor) {
        const start = Date.now();
        while (Date.now() - start < 45000) {
          const queries = qc.getQueriesData<any>({ queryKey: ["actor"] });
          for (const [, data] of queries) {
            if (data) {
              resolvedActor = data;
              break;
            }
          }
          if (resolvedActor) break;
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      if (!resolvedActor)
        throw new Error("सर्वर से कनेक्ट नहीं हो पाया। पेज रीलोड करें।");
      const result = await (resolvedActor as any).registerSalonByPhone(
        phone,
        name,
        address,
        salonPhone,
        city,
      );
      if (result && typeof result === "object" && "err" in result) {
        throw new Error(String(result.err));
      }
      return result;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mySalon", phone] }),
  });
}

export function useUpdateMySalon(phone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      address,
      salonPhone,
      city,
    }: { name: string; address: string; salonPhone: string; city: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).updateOwnerSalonByPhone(
        phone,
        name,
        address,
        salonPhone,
        city,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mySalon", phone] }),
  });
}

export function useGetSalonServices(salonId: bigint | null | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<ServiceWithId[]>({
    queryKey: ["salonServices", salonId?.toString()],
    queryFn: async () => {
      if (!actor || !salonId) return [];
      return (actor as any).getSalonServices(salonId);
    },
    enabled: !!actor && !isFetching && !!salonId,
  });
}

export function useAddSalonService(phone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      name,
      price,
      durationMinutes,
    }: {
      salonId: bigint;
      name: string;
      price: number;
      durationMinutes: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).addSalonServiceByPhone(
        phone,
        salonId,
        name,
        price,
        durationMinutes,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["salonServices", vars.salonId.toString()],
      }),
  });
}

export function useDeleteSalonService(phone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      serviceId,
    }: { salonId: bigint; serviceId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteSalonServiceByPhone(
        phone,
        salonId,
        serviceId,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["salonServices", vars.salonId.toString()],
      }),
  });
}

export function useGetSalonAppointmentsForDate(
  phone: string,
  salonId: bigint | null | undefined,
  date: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<AppointmentWithId[]>({
    queryKey: ["salonAppts", phone, salonId?.toString(), date],
    queryFn: async () => {
      if (!actor || !salonId || !phone) return [];
      return (actor as any).getSalonAppointmentsForDateByPhone(
        phone,
        salonId,
        date,
      );
    },
    enabled: !!actor && !isFetching && !!salonId && !!phone,
    refetchInterval: 45000,
  });
}

export function useUpdateAppointmentStatus(phone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      appointmentId: bigint;
      newStatus: string;
      salonId: bigint;
      date: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).updateAppointmentStatusByPhone(
        phone,
        vars.appointmentId,
        vars.newStatus,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["salonAppts", phone, vars.salonId.toString(), vars.date],
      }),
  });
}

export function useGetOwnerRevenueSummary(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["ownerRevenueSummary", phone],
    queryFn: async () => {
      if (!actor || !phone) throw new Error("No actor or phone");
      return (actor as any).getOwnerRevenueSummaryByPhone(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
    refetchInterval: 60000,
  });
}

// ============================================================
// Timer / Notification System hooks
// ============================================================

export function useStartServiceSession(ownerPhone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appointmentId,
      durationMinutes,
    }: { appointmentId: bigint; durationMinutes: number }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).startServiceSession(
        ownerPhone,
        appointmentId,
        BigInt(durationMinutes),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceSession"] });
    },
  });
}

export function useGetCurrentServiceSession(
  salonId: bigint | null | undefined,
) {
  const { actor, isFetching } = useActor();
  return useQuery<ServiceSession | null>({
    queryKey: ["serviceSession", salonId?.toString()],
    queryFn: async () => {
      if (!actor || !salonId) return null;
      const result = await (actor as any).getCurrentServiceSession(salonId);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!salonId,
    refetchInterval: 30000,
  });
}

export function useGetQueueScheduleForSalon(
  salonId: bigint | null | undefined,
  date: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<QueueScheduleEntry[]>({
    queryKey: ["queueSchedule", salonId?.toString(), date],
    queryFn: async () => {
      if (!actor || !salonId) return [];
      return (actor as any).getQueueScheduleForSalon(salonId, date);
    },
    enabled: !!actor && !isFetching && !!salonId,
    refetchInterval: 30000,
  });
}

export function useGetPendingNotifications(
  salonId: bigint | null | undefined,
  date: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["pendingNotifications", salonId?.toString(), date],
    queryFn: async () => {
      if (!actor || !salonId) return [];
      return (actor as any).getPendingNotifications(salonId, date);
    },
    enabled: !!actor && !isFetching && !!salonId,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationSent(ownerPhone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).markNotificationSent(ownerPhone, appointmentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingNotifications"] });
    },
  });
}

export function useSavePushSubscription() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      phone,
      endpoint,
      p256dh,
      auth,
    }: { phone: string; endpoint: string; p256dh: string; auth: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).savePushSubscription(phone, endpoint, p256dh, auth);
    },
  });
}

export function useClearServiceSession(ownerPhone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return (actor as any).clearServiceSession(ownerPhone);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceSession"] });
    },
  });
}

// ============================================================
// Customer hooks (phone-based)
// ============================================================

export function useGetAllActiveSalons() {
  const { actor, isFetching } = useActor();
  return useQuery<SalonWithId[]>({
    queryKey: ["activeSalons"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllActiveSalons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookAppointment(phone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      customerName,
      serviceName,
      date,
    }: {
      salonId: bigint;
      customerName: string;
      serviceName: string;
      date: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).bookAppointmentByPhone(
        phone,
        salonId,
        customerName,
        serviceName,
        date,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["myAppointments", phone] }),
  });
}

export function useGetMyAppointments(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AppointmentWithId[]>({
    queryKey: ["myAppointments", phone],
    queryFn: async () => {
      if (!actor || !phone) return [];
      return (actor as any).getMyAppointmentsByPhone(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
    refetchInterval: 45000,
  });
}

export function useGetQueueInfo(appointmentId: bigint | null | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, bigint]>({
    queryKey: ["queueInfo", appointmentId?.toString()],
    queryFn: async () => {
      if (!actor || !appointmentId) return [0n, 0n] as [bigint, bigint];
      return (actor as any).getQueueInfo(appointmentId);
    },
    enabled: !!actor && !isFetching && !!appointmentId,
    refetchInterval: 45000,
  });
}

export function useSaveCustomerProfile(phone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).saveCustomerProfileByPhone(phone, name);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["myCustomerProfile", phone] }),
    onError: () => {
      toast.error("कनेक्ट नहीं हो पाया। दोबारा कोशिश करें।");
    },
  });
}

export function useGetMyCustomerProfile(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<CustomerProfile | null>({
    queryKey: ["myCustomerProfile", phone],
    queryFn: async () => {
      if (!actor || !phone) return null;
      const result = await (actor as any).getMyCustomerProfileByPhone(phone);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!phone,
  });
}

// ============================================================
// Salon Owner Auth hooks (V2 with password)
// ============================================================

export function useSalonOwnerLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      phone,
      passwordHash,
    }: { phone: string; passwordHash: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).salonOwnerLogin(phone, passwordHash) as Promise<
        [string, any]
      >;
    },
  });
}

export function useSalonOwnerRegisterV2() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      ownerPhone,
      salonName,
      services,
      passwordHash,
    }: {
      ownerPhone: string;
      salonName: string;
      services: string[];
      passwordHash: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).salonOwnerRegisterV2(
        ownerPhone,
        salonName,
        services,
        passwordHash,
      ) as Promise<string>;
    },
  });
}

export function useSalonOwnerSetPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      phone,
      passwordHash,
    }: { phone: string; passwordHash: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).salonOwnerSetPassword(
        phone,
        passwordHash,
      ) as Promise<boolean>;
    },
  });
}

// ============================================================
// Plan Pricing hooks — FIX: pass email + passwordHash for admin calls
// ============================================================
export function useGetPlanPricings() {
  const { actor, isFetching } = useActor();
  return useQuery<PlanPricingType[]>({
    queryKey: ["planPricings"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend se connection nahi");
      return (actor as any).getPlanPricings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminGetAllPlanPricings() {
  const { actor, isFetching } = useActor();
  return useQuery<PlanPricingType[]>({
    queryKey: ["adminPlanPricings"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend se connection nahi");
      const adminHash = getAdminHash();
      return (actor as any).adminGetAllPlanPricings(ADMIN_EMAIL, adminHash);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminSetPlanPricing() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planName,
      originalPrice,
      discountPercent,
    }: {
      planName: string;
      originalPrice: number;
      discountPercent: number;
    }) => {
      if (!actor) throw new Error("No actor");
      const adminHash = getAdminHash();
      return (actor as any).adminSetPlanPricing(
        ADMIN_EMAIL,
        adminHash,
        planName,
        originalPrice,
        discountPercent,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPlanPricings"] });
      qc.invalidateQueries({ queryKey: ["planPricings"] });
    },
  });
}

// ============================================================
// Subscription Request hooks — FIX: no localStorage fallback
// ============================================================
export function useSubmitSubscriptionRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      ownerPhone: string;
      salonName: string;
      planName: string;
      planDays: number;
      originalPrice: number;
      discountPercent: number;
      finalPrice: number;
      savings: number;
      screenshotBase64: string;
    }) => {
      if (!actor) throw new Error("Backend se connection nahi। पेज reload करें।");
      return (actor as any).submitSubscriptionRequest(
        params.ownerPhone,
        params.salonName,
        params.planName,
        BigInt(params.planDays),
        params.originalPrice,
        params.discountPercent,
        params.finalPrice,
        params.savings,
        params.screenshotBase64,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mySubRequests"] });
      qc.invalidateQueries({ queryKey: ["adminPendingSubRequests"] });
    },
  });
}

// FIX: 10s polling, auth args passed
export function useAdminGetPendingSubRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<SubRequestType[]>({
    queryKey: ["adminPendingSubRequests"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend se connection nahi");
      return (actor as any).adminGetPendingSubRequests(
        ADMIN_EMAIL,
        getAdminHash(),
      );
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

// FIX: 10s polling, auth args passed
export function useAdminGetAllSubRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<SubRequestType[]>({
    queryKey: ["adminAllSubRequests"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend se connection nahi");
      return (actor as any).adminGetAllSubRequests(ADMIN_EMAIL, getAdminHash());
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

// FIX: surface error instead of returning []
export function useGetMySubRequests(ownerPhone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SubRequestType[]>({
    queryKey: ["mySubRequests", ownerPhone],
    queryFn: async () => {
      if (!actor || !ownerPhone) throw new Error("Phone ya actor missing hai");
      return (actor as any).getMySubRequests(ownerPhone);
    },
    enabled: !!actor && !isFetching && !!ownerPhone,
  });
}

export function useAdminApproveSubRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminApproveSubRequest(
        ADMIN_EMAIL,
        getAdminHash(),
        requestId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingSubRequests"] });
      qc.invalidateQueries({ queryKey: ["adminAllSubRequests"] });
      qc.invalidateQueries({ queryKey: ["adminAllSalons"] });
      qc.invalidateQueries({ queryKey: ["adminSubEarnings"] });
      qc.invalidateQueries({ queryKey: ["adminSubHistory"] });
    },
  });
}

export function useAdminRejectSubRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminRejectSubRequest(
        ADMIN_EMAIL,
        getAdminHash(),
        requestId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingSubRequests"] });
      qc.invalidateQueries({ queryKey: ["adminAllSubRequests"] });
    },
  });
}

// FIX: auth args passed
export function useAdminGetSubRequestEarnings() {
  const { actor, isFetching } = useActor();
  return useQuery<[number, number, bigint]>({
    queryKey: ["adminSubEarnings"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend se connection nahi");
      return (actor as any).adminGetSubRequestEarnings(
        ADMIN_EMAIL,
        getAdminHash(),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminExpireOldSubRequests() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return (actor as any).adminExpireOldSubRequests(
        ADMIN_EMAIL,
        getAdminHash(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingSubRequests"] });
      qc.invalidateQueries({ queryKey: ["adminAllSubRequests"] });
    },
  });
}

// ============================================================
// Subscription History hooks
// ============================================================

export function useAdminGetSubHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<SubscriptionHistoryType[]>({
    queryKey: ["adminSubHistory"],
    queryFn: async () => {
      if (!actor) throw new Error("Backend se connection nahi");
      const adminHash = getAdminHash();
      return (actor as any).adminGetSubHistory(
        ADMIN_EMAIL,
        adminHash,
      ) as Promise<SubscriptionHistoryType[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMySubHistory(ownerPhone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SubscriptionHistoryType[]>({
    queryKey: ["mySubHistory", ownerPhone],
    queryFn: async () => {
      if (!actor || !ownerPhone) throw new Error("Phone ya actor missing hai");
      return (actor as any).getMySubHistory(ownerPhone) as Promise<
        SubscriptionHistoryType[]
      >;
    },
    enabled: !!actor && !isFetching && !!ownerPhone,
  });
}

// ============================================================
// Salon Photo Gallery hooks
// ============================================================

// Public: anyone can view salon photos
export function useGetSalonPhotos(salonId: bigint | null | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<SalonPhotoType[]>({
    queryKey: ["salonPhotos", salonId?.toString()],
    queryFn: async () => {
      if (!actor || !salonId) return [];
      const result = await (actor as any).getSalonPhotos(salonId);
      return result ?? [];
    },
    enabled: !!actor && !isFetching && !!salonId,
    staleTime: 2 * 60 * 1000,
  });
}

// Owner: upload a photo URL to the backend
export function useUploadSalonPhoto(ownerPhone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      passwordHash,
      url,
    }: { passwordHash: string; url: string }) => {
      if (!actor) throw new Error("Backend se connection nahi। पेज reload करें।");
      return (actor as any).uploadSalonPhoto(
        ownerPhone,
        passwordHash,
        url,
      ) as Promise<bigint>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salonPhotos"] }),
  });
}

// Owner: delete a photo
export function useDeleteSalonPhoto(ownerPhone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      passwordHash,
      photoId,
    }: { passwordHash: string; photoId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteSalonPhoto(
        ownerPhone,
        passwordHash,
        photoId,
      ) as Promise<boolean>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["salonPhotos"] }),
  });
}

// ============================================================
// Salon Location hook — for nearby filter
// ============================================================

export function useUpdateSalonLocation(ownerPhone: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      passwordHash,
      lat,
      lng,
    }: { passwordHash: string; lat: number; lng: number }) => {
      if (!actor) throw new Error("Backend se connection nahi। पेज reload करें।");
      return (actor as any).updateSalonLocation(
        ownerPhone,
        passwordHash,
        lat,
        lng,
      ) as Promise<boolean>;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["mySalon", ownerPhone] }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AppointmentWithId,
  CustomerProfile,
  DashboardStats,
  SalonWithId,
  ServiceWithId,
} from "../backend";
import { useActor } from "./useActor";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "inprogress"
  | "completed"
  | "cancelled";

export type {
  DashboardStats,
  SalonWithId,
  ServiceWithId,
  AppointmentWithId,
  CustomerProfile,
};

// ============================================================
// Admin hooks
// ============================================================

export function useAdminGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      if (!actor) return { total: 0n, active: 0n, expired: 0n, pending: 0n };
      return actor.adminGetDashboardStats();
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
      return actor.adminGetSubscriptionPrice();
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
      return actor.adminSetSubscriptionPrice(price);
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
      return actor.adminGetAllSalons();
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
      return actor.adminGetPendingSalons();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useAdminApproveSalon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (salonId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.adminApproveSalon(salonId);
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
      return actor.adminRejectSalon(salonId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminPendingSalons"] });
      qc.invalidateQueries({ queryKey: ["adminAllSalons"] });
      qc.invalidateQueries({ queryKey: ["adminDashboardStats"] });
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
      return actor.adminSetSalonSubscription(salonId, active);
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
      return actor.adminSetSalonActive(salonId, active);
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
      const result = await actor.adminGetDefaultTrialDays();
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
      return actor.adminSetDefaultTrialDays(BigInt(days));
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
    }: { salonId: bigint; days: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.adminSetSalonTrialDays(salonId, BigInt(days));
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
      return actor.adminProcessTrialExpirations();
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
      return actor.adminGetRevenueStats();
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
      const [salons, services, appointments, customers, ownerMap, nextIds] =
        await Promise.all([
          (actor as any).adminGetAllSalonsForBackup(),
          (actor as any).adminGetAllServicesForBackup(),
          (actor as any).adminGetAllAppointmentsForBackup(),
          (actor as any).adminGetAllCustomersForBackup(),
          (actor as any).adminGetOwnerPhoneMapForBackup(),
          (actor as any).adminGetNextIdsForBackup(),
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
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!actor && !isFetching && !!phone,
    // ICP cold-start fix: 5 retries keep isLoading=true so cartoon screen stays visible
    retry: 5,
    retryDelay: (attempt) => Math.min(5000 * (attempt + 1), 25000),
    staleTime: 2 * 60 * 1000,
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
      return (resolvedActor as any).registerSalonByPhone(
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
      return actor.getSalonServices(salonId);
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
      return actor.getOwnerRevenueSummaryByPhone(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
    refetchInterval: 60000,
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
      return actor.getAllActiveSalons();
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
      return actor.getQueueInfo(appointmentId);
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
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!actor && !isFetching && !!phone,
    staleTime: 5 * 60 * 1000,
    retry: 5,
    retryDelay: (attempt) => Math.min(5000 * (attempt + 1), 25000),
  });
}

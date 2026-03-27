import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  AppointmentWithId,
  CustomerProfile,
  DashboardStats,
  SalonWithId,
  ServiceWithId,
} from "../backend";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "inprogress"
  | "completed"
  | "cancelled";

// Legacy type stubs (backend no longer exports these)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Appointment = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Customer = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Service = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Staff = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UserProfile = any;

import { useActor } from "./useActor";

export type {
  DashboardStats,
  SalonWithId,
  ServiceWithId,
  AppointmentWithId,
  CustomerProfile,
};

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return (actor as any).getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllAppointments() {
  const { actor, isFetching } = useActor();
  return useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllAppointments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000,
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllCustomers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllStaff() {
  const { actor, isFetching } = useActor();
  return useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllStaff();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

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
    retry: 2,
    staleTime: 3 * 60 * 1000, // 3 min cache
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
      if (!actor) throw new Error("No actor");
      return (actor as any).registerSalonByPhone(
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
    staleTime: 5 * 60 * 1000, // 5 min cache — profile rarely changes
  });
}

// ============================================================
// Legacy hooks (needed by Appointments, Customers, Services, Staff pages)
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StaffType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SvcType = any;

export function useCreateAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appointment: AppType) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createAppointment(appointment);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useDeleteAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteAppointment(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      appointment,
    }: { id: bigint; appointment: AppType }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).updateAppointment(id, appointment);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customer: CustType) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createCustomer(customer);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteCustomer(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (service: SvcType) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createService(service);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteService(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useCreateStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (staffMember: StaffType) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createStaff(staffMember);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useDeleteStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteStaff(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useSearchAppointmentsByCustomer(customerName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AppType[]>({
    queryKey: ["appointmentsByCustomer", customerName],
    queryFn: async () => {
      if (!actor || !customerName) return [];
      return (actor as any).searchAppointmentsByCustomerName(customerName);
    },
    enabled: !!actor && !isFetching && !!customerName,
    refetchInterval: 60000,
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminDashboardStats,
  AppointmentWithId,
  CustomerProfile,
  SalonWithId,
  ServiceWithId,
} from "../backend";
import { AppointmentStatus } from "../backend";
import type {
  Appointment,
  Customer,
  DashboardStats,
  Service,
  Staff,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export type {
  Appointment,
  Customer,
  Service,
  Staff,
  DashboardStats,
  SalonWithId,
  ServiceWithId,
  AppointmentWithId,
  CustomerProfile,
  AdminDashboardStats,
};
export { AppointmentStatus };

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
      return actor.getCallerUserProfile();
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
      return actor.getDashboardStats();
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
      return actor.getAllAppointments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
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
      return actor.getAllServices();
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
      return actor.getAllStaff();
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
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

// ============================================================
// Admin hooks
// ============================================================

export function useAdminGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminDashboardStats>({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      if (!actor) return { total: 0n, active: 0n, expired: 0n, pending: 0n };
      return actor.adminGetDashboardStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
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
    refetchInterval: 30000,
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
// Salon owner hooks
// ============================================================

export function useGetMySalon() {
  const { actor, isFetching } = useActor();
  return useQuery<SalonWithId | null>({
    queryKey: ["mySalon"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMySalon();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterSalon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      address,
      phone,
      city,
    }: { name: string; address: string; phone: string; city: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.registerSalon(name, address, phone, city);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mySalon"] }),
  });
}

export function useUpdateMySalon() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      address,
      phone,
      city,
    }: { name: string; address: string; phone: string; city: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateMySalon(name, address, phone, city);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mySalon"] }),
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

export function useAddSalonService() {
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
      return actor.addSalonService(salonId, name, price, durationMinutes);
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["salonServices", vars.salonId.toString()],
      }),
  });
}

export function useDeleteSalonService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      serviceId,
    }: { salonId: bigint; serviceId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSalonService(salonId, serviceId);
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["salonServices", vars.salonId.toString()],
      }),
  });
}

export function useGetSalonAppointmentsForDate(
  salonId: bigint | null | undefined,
  date: string,
) {
  const { actor, isFetching } = useActor();
  return useQuery<AppointmentWithId[]>({
    queryKey: ["salonAppts", salonId?.toString(), date],
    queryFn: async () => {
      if (!actor || !salonId) return [];
      return actor.getSalonAppointmentsForDate(salonId, date);
    },
    enabled: !!actor && !isFetching && !!salonId,
    refetchInterval: 20000,
  });
}

export function useUpdateAppointmentStatus() {
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
      return actor.updateAppointmentStatus(vars.appointmentId, vars.newStatus);
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({
        queryKey: ["salonAppts", vars.salonId.toString(), vars.date],
      }),
  });
}

// ============================================================
// Customer hooks
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

export function useBookAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      salonId,
      customerName,
      customerPhone,
      serviceName,
      date,
    }: {
      salonId: bigint;
      customerName: string;
      customerPhone: string;
      serviceName: string;
      date: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.bookAppointment(
        salonId,
        customerName,
        customerPhone,
        serviceName,
        date,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myAppointments"] }),
  });
}

export function useGetMyAppointments() {
  const { actor, isFetching } = useActor();
  return useQuery<AppointmentWithId[]>({
    queryKey: ["myAppointments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAppointments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
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
    refetchInterval: 15000,
  });
}

export function useSaveCustomerProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCustomerProfile(name, phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myCustomerProfile"] }),
  });
}

export function useGetMyCustomerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<CustomerProfile | null>({
    queryKey: ["myCustomerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyCustomerProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ============================================================
// Legacy hooks (needed by Appointments, Customers, Services, Staff pages)
// ============================================================
import type {
  Appointment as AppType,
  Customer as CustType,
  Staff as StaffType,
  Service as SvcType,
} from "../backend.d";

export function useCreateAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appointment: AppType) => {
      if (!actor) throw new Error("No actor");
      return actor.createAppointment(appointment);
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
      return actor.deleteAppointment(id);
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
      return actor.updateAppointment(id, appointment);
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
      return actor.createCustomer(customer);
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
      return actor.deleteCustomer(id);
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
      return actor.createService(service);
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
      return actor.deleteService(id);
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
      return actor.createStaff(staffMember);
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
      return actor.deleteStaff(id);
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
      return actor.searchAppointmentsByCustomerName(customerName);
    },
    enabled: !!actor && !isFetching && !!customerName,
    refetchInterval: 30000,
  });
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  IndianRupee,
  Sparkles,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import {
  type AppointmentStatus,
  useGetAllAppointments,
  useGetDashboardStats,
} from "../hooks/useQueries";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.FC<{ className?: string }> }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Circle,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

const statCards = [
  {
    key: "totalAppointments" as const,
    label: "कुल अपॉइंटमेंट",
    icon: Calendar,
    iconBg: "oklch(0.34 0.075 192)",
    iconColor: "white",
  },
  {
    key: "totalCustomers" as const,
    label: "कुल ग्राहक",
    icon: Users,
    iconBg: "oklch(0.93 0.035 75)",
    iconColor: "oklch(0.34 0.075 192)",
  },
  {
    key: "totalServices" as const,
    label: "कुल सेवाएं",
    icon: Sparkles,
    iconBg: "oklch(0.93 0.03 182)",
    iconColor: "oklch(0.34 0.075 192)",
  },
  {
    key: "totalStaff" as const,
    label: "कुल स्टाफ",
    icon: UserCheck,
    iconBg: "oklch(0.28 0.025 162)",
    iconColor: "white",
  },
];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: appointments, isLoading: apptLoading } =
    useGetAllAppointments();
  const recentAppointments = appointments?.slice(-5).reverse() ?? [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground">
          डैशबोर्ड
        </h1>
        <p className="text-muted-foreground mt-1">आपके सैलून का आज का सारांश</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {statCards.map((stat) => (
          <Card
            key={stat.key}
            className="shadow-card border-0"
            data-ocid={`dashboard.${stat.key}.card`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {stats
                        ? Number(stats[stat.key]).toLocaleString("en-IN")
                        : "0"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: stat.iconBg }}
                >
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.iconColor }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card
          className="col-span-2 lg:col-span-1 shadow-card border-0"
          data-ocid="dashboard.totalRevenue.card"
          style={{ background: "oklch(0.34 0.075 192)" }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20 mb-1 bg-white/20" />
                ) : (
                  <p className="text-2xl font-bold text-white">₹{"0"}</p>
                )}
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "oklch(0.8 0.03 182)" }}
                >
                  कुल राजस्व
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.73 0.11 75)" }}
              >
                <IndianRupee
                  className="w-5 h-5"
                  style={{ color: "oklch(0.28 0.025 162)" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Clock
                className="w-5 h-5"
                style={{ color: "oklch(0.34 0.075 192)" }}
              />
              हाल के अपॉइंटमेंट
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apptLoading ? (
              <div
                className="space-y-3"
                data-ocid="dashboard.appointments.loading_state"
              >
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : recentAppointments.length === 0 ? (
              <div
                className="text-center py-12 rounded-xl"
                style={{ background: "oklch(0.97 0.003 182)" }}
                data-ocid="dashboard.appointments.empty_state"
              >
                <Calendar
                  className="w-10 h-10 mx-auto mb-3"
                  style={{ color: "oklch(0.73 0.11 75)" }}
                />
                <p className="text-muted-foreground text-sm">
                  अभी कोई अपॉइंटमेंट नहीं है।
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAppointments.map((appt, idx) => {
                  const cfg = statusConfig[appt.status] ?? statusConfig.pending;
                  return (
                    <div
                      key={`${appt.customerName}-${appt.date}-${appt.time}`}
                      data-ocid={`dashboard.appointments.item.${idx + 1}`}
                      className="flex items-center justify-between p-4 rounded-xl transition-colors"
                      style={{ background: "oklch(0.97 0.003 182)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm"
                          style={{
                            background: "oklch(0.93 0.035 75)",
                            color: "oklch(0.34 0.075 192)",
                          }}
                        >
                          {appt.customerName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {appt.customerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appt.serviceName} · {appt.date} {appt.time}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-xs border ${cfg.color}`}>
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

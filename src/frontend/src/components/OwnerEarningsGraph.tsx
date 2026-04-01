import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AppointmentWithId } from "../hooks/useQueries";
import { getStaff } from "./StaffManager";

const DAYS_HI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];

function getDailyEarningsKey(salonId: bigint, date: string) {
  return `salon_daily_earn_${salonId}_${date}`;
}

export function storeTodayEarnings(
  salonId: bigint,
  todayAppts: AppointmentWithId[],
  services: { name: string; price: number }[],
) {
  const today = new Date().toISOString().split("T")[0];
  const priceMap: Record<string, number> = {};
  for (const svc of services) priceMap[svc.name] = svc.price;
  const earned = todayAppts
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (priceMap[a.serviceName] ?? 0), 0);
  localStorage.setItem(getDailyEarningsKey(salonId, today), String(earned));
}

function getWeeklyData(salonId: bigint) {
  const data: { day: string; earned: number; date: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = DAYS_HI[d.getDay()];
    const earned =
      Number(localStorage.getItem(getDailyEarningsKey(salonId, dateStr))) || 0;
    data.push({ day: dayLabel, earned, date: dateStr });
  }
  return data;
}

interface Props {
  salonId: bigint;
  totalEarnings: number;
  monthlyEarnings: number;
  totalAppointments: number;
  completedAppointments: number;
  todayAppts: AppointmentWithId[];
}

export default function OwnerEarningsGraph({
  salonId,
  totalEarnings,
  monthlyEarnings,
  totalAppointments,
  completedAppointments,
  todayAppts,
}: Props) {
  const weeklyData = useMemo(() => getWeeklyData(salonId), [salonId]);

  // Most sold service from today's appointments
  const serviceCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of todayAppts) {
      map[a.serviceName] = (map[a.serviceName] ?? 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [todayAppts]);

  const topService = serviceCounts[0];

  // Staff count from localStorage
  const allStaff = useMemo(() => getStaff(salonId), [salonId]);
  const activeStaff = allStaff.filter((s) => s.isActive);

  const cardStyle = {
    background: "oklch(0.18 0.05 155)",
    border: "1px solid oklch(0.25 0.05 155)",
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={cardStyle}>
          <p className="text-xs mb-1" style={{ color: "oklch(0.6 0.05 145)" }}>
            कुल आमदनी
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(0.52 0.18 145)" }}
          >
            ₹{totalEarnings.toFixed(0)}
          </p>
        </div>
        <div className="rounded-xl p-3" style={cardStyle}>
          <p className="text-xs mb-1" style={{ color: "oklch(0.6 0.05 145)" }}>
            इस माह
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(0.7 0.15 145)" }}
          >
            ₹{monthlyEarnings.toFixed(0)}
          </p>
        </div>
        <div className="rounded-xl p-3" style={cardStyle}>
          <p className="text-xs mb-1" style={{ color: "oklch(0.6 0.05 145)" }}>
            कुल अपॉइंटमेंट
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(0.95 0.02 145)" }}
          >
            {totalAppointments}
          </p>
        </div>
        <div className="rounded-xl p-3" style={cardStyle}>
          <p className="text-xs mb-1" style={{ color: "oklch(0.6 0.05 145)" }}>
            पूरे हुए
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: "oklch(0.95 0.02 145)" }}
          >
            {completedAppointments}
          </p>
        </div>
      </div>

      {/* Weekly earnings bar chart */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "oklch(0.95 0.02 145)" }}
        >
          साप्ताहिक आमदनी (आज तक)
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={weeklyData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.28 0.05 155)"
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "oklch(0.6 0.05 145)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.6 0.05 145)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
              }
            />
            <Tooltip
              formatter={(v: number) => [`₹${v}`, "आमदनी"]}
              contentStyle={{
                background: "oklch(0.22 0.05 155)",
                border: "1px solid oklch(0.32 0.05 155)",
                borderRadius: "8px",
                color: "oklch(0.95 0.02 145)",
              }}
            />
            <Bar
              dataKey="earned"
              fill="oklch(0.52 0.18 145)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most sold service */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <p
          className="text-sm font-semibold mb-2"
          style={{ color: "oklch(0.95 0.02 145)" }}
        >
          आज सबसे ज़्यादा बिकी सेवा
        </p>
        {serviceCounts.length === 0 ? (
          <p className="text-sm" style={{ color: "oklch(0.55 0.05 145)" }}>
            आज कोई अपॉइंटमेंट नहीं
          </p>
        ) : (
          <div className="space-y-2">
            {serviceCounts.slice(0, 5).map(([name, count], i) => (
              <div key={name} className="flex items-center gap-2">
                <span
                  className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      i === 0 ? "oklch(0.52 0.18 145)" : "oklch(0.28 0.05 155)",
                    color: "white",
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.9 0.02 145)" }}
                    >
                      {name}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.6 0.05 145)" }}
                    >
                      {count} बार
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ background: "oklch(0.25 0.05 155)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(count / (topService?.[1] ?? 1)) * 100}%`,
                        background:
                          i === 0
                            ? "oklch(0.52 0.18 145)"
                            : "oklch(0.42 0.10 145)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff performance */}
      <div className="rounded-xl p-4" style={cardStyle}>
        <p
          className="text-sm font-semibold mb-2"
          style={{ color: "oklch(0.95 0.02 145)" }}
        >
          स्टाफ परफोर्मेंस
        </p>
        {allStaff.length === 0 ? (
          <p className="text-sm" style={{ color: "oklch(0.55 0.05 145)" }}>
            स्टाफ टैब में जाकर स्टाफ जोड़ें
          </p>
        ) : (
          <div className="space-y-2">
            <div
              className="flex justify-between text-xs mb-1"
              style={{ color: "oklch(0.55 0.05 145)" }}
            >
              <span>कुल स्टाफ: {allStaff.length}</span>
              <span>सक्रिय: {activeStaff.length}</span>
            </div>
            {allStaff.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: s.isActive
                      ? "oklch(0.52 0.18 145 / 0.2)"
                      : "oklch(0.28 0.05 155)",
                    color: s.isActive
                      ? "oklch(0.52 0.18 145)"
                      : "oklch(0.5 0.05 145)",
                  }}
                >
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.9 0.02 145)" }}
                  >
                    {s.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.6 0.05 145)" }}
                  >
                    {s.role} •{" "}
                    {s.isActive ? (
                      <span style={{ color: "oklch(0.7 0.15 145)" }}>
                        सक्रिय
                      </span>
                    ) : (
                      <span className="text-red-400">निष्क्रिय</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  type SalonWithId,
  useAdminApproveSalon,
  useAdminBackup,
  useAdminGetAllSalons,
  useAdminGetDashboardStats,
  useAdminGetDefaultTrialDays,
  useAdminGetPendingSalons,
  useAdminGetRevenueStats,
  useAdminGetSubscriptionPrice,
  useAdminProcessTrialExpirations,
  useAdminRejectSalon,
  useAdminResetOwnerPassword,
  useAdminRestore,
  useAdminSetDefaultTrialDays,
  useAdminSetSalonActive,
  useAdminSetSalonSubscription,
  useAdminSetSubscriptionPrice,
} from "../hooks/useQueries";
import {
  type RatingEntry,
  deleteRating,
  getRatings,
} from "./CustomerDashboard";

type Tab =
  | "dashboard"
  | "pending"
  | "salons"
  | "settings"
  | "revenue"
  | "reviews"
  | "backup";

function getTrialStatus(salon: SalonWithId) {
  if (salon.pendingApproval)
    return { label: "अनुमोदन हेतु", variant: "secondary" as const };
  if (!salon.isActive)
    return { label: "निष्क्रिय", variant: "destructive" as const };
  if (salon.subscriptionActive)
    return { label: "सदस्यता सक्रिय", variant: "default" as const };
  const trialEndMs =
    Number(salon.trialStartDate) / 1_000_000 +
    Number(salon.trialDays) * 86400 * 1000;
  const now = Date.now();
  if (now > trialEndMs)
    return { label: "ट्रायल समाप्त", variant: "destructive" as const };
  const daysLeft = Math.ceil((trialEndMs - now) / (86400 * 1000));
  return { label: `ट्रायल (${daysLeft} दिन बाकी)`, variant: "outline" as const };
}

function StarDisplay({ stars }: { stars: number }) {
  return (
    <span style={{ color: "oklch(0.72 0.18 85)", letterSpacing: "1px" }}>
      {Array.from({ length: 5 }, (_, i) => (i < stars ? "★" : "☆")).join("")}
    </span>
  );
}

function ReviewsTab() {
  const [ratings, setRatings] = useState<RatingEntry[]>(() => getRatings());

  const handleDelete = (appointmentId: string) => {
    deleteRating(appointmentId);
    setRatings(getRatings());
  };

  if (ratings.length === 0) {
    return (
      <div className="text-center py-16" data-ocid="reviews.empty_state">
        <p className="text-4xl mb-3">⭐</p>
        <p className="text-gray-500 font-medium">कोई समीक्षा नहीं</p>
        <p className="text-sm text-gray-400 mt-1">
          ग्राहकों की समीक्षाएं यहाँ दिखेंगी
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">कुल {ratings.length} समीक्षाएं</p>
      {ratings.map((entry, idx) => (
        <Card key={entry.appointmentId} data-ocid={`reviews.item.${idx + 1}`}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-800">
                    {entry.salonName}
                  </span>
                  <StarDisplay stars={entry.stars} />
                </div>
                {entry.review && (
                  <p className="text-sm text-gray-700 mt-1">{entry.review}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>📱 {entry.customerPhone}</span>
                  <span>•</span>
                  <span>
                    {new Date(entry.date).toLocaleDateString("hi-IN")}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(entry.appointmentId)}
                data-ocid={`reviews.delete_button.${idx + 1}`}
                className="flex-shrink-0 text-xs h-7"
              >
                हटाएं
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BackupTab() {
  const backupMutation = useAdminBackup();
  const restoreMutation = useAdminRestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    try {
      const data = await backupMutation.mutateAsync();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `salon360-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("बैकअप सफलतापूर्वक डाउनलोड हो गया!");
    } catch {
      toast.error("बैकअप में समस्या आई। दोबारा कोशिश करें।");
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const convertIds = (arr: any[]) =>
        arr.map((item) => {
          const out: any = {};
          for (const [k, v] of Object.entries(item)) {
            out[k] = typeof v === "string" && /^\d+$/.test(v) ? BigInt(v) : v;
          }
          return out;
        });
      const ownerMap = (data.ownerMap as [string, string][]).map(
        ([phone, id]) => [phone, BigInt(id)] as [string, bigint],
      );
      const nextIds: [bigint, bigint, bigint] = [
        BigInt(data.nextIds[0]),
        BigInt(data.nextIds[1]),
        BigInt(data.nextIds[2]),
      ];
      await restoreMutation.mutateAsync({
        salons: convertIds(data.salons),
        services: convertIds(data.services),
        appointments: convertIds(data.appointments),
        customers: data.customers,
        ownerMap,
        nextIds,
      });
      toast.success("डेटा सफलतापूर्वक रिस्टोर हो गया!");
    } catch {
      toast.error("रिस्टोर में समस्या आई। सही JSON फ़ाइल चुनें।");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">डेटा बैकअप</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            सभी सैलून, सेवाएं, अपॉइंटमेंट और ग्राहकों का पूरा डेटा JSON फ़ाइल में डाउनलोड
            होगा।
          </p>
          <Button
            onClick={handleBackup}
            disabled={backupMutation.isPending}
            className="w-full"
            data-ocid="backup.primary_button"
          >
            {backupMutation.isPending
              ? "बैकअप हो रहा है..."
              : "⬇️ Backup Data डाउनलोड करें"}
          </Button>
          {backupMutation.isPending && (
            <p
              className="text-xs text-gray-500 text-center"
              data-ocid="backup.loading_state"
            >
              पूरा डेटा लोड हो रहा है, इंतज़ार करें...
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">डेटा रिस्टोर</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-red-600 font-medium">
            ⚠️ सावधान: रिस्टोर करने पर मौजूदा सारा डेटा हट जाएगा और बैकअप फ़ाइल का डेटा
            आ जाएगा।
          </p>
          <p className="text-sm text-gray-600">
            पहले से डाउनलोड की गई JSON बैकअप फ़ाइल चुनें।
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleRestoreFile}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={restoreMutation.isPending}
            className="w-full border-red-300 text-red-700 hover:bg-red-50"
            data-ocid="backup.upload_button"
          >
            {restoreMutation.isPending
              ? "रिस्टोर हो रहा है..."
              : "⬆️ Restore Data (JSON अपलोड करें)"}
          </Button>
          {restoreMutation.isPending && (
            <p
              className="text-xs text-gray-500 text-center"
              data-ocid="backup.loading_state"
            >
              डेटा रिस्टोर हो रहा है...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPanel({ onLogout }: { onLogout?: () => void }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [trialDaysInput, setTrialDaysInput] = useState("");
  const [priceInput, setPriceInput] = useState("");

  const { data: stats, isLoading: statsLoading } = useAdminGetDashboardStats();
  const { data: pendingSalons = [], isLoading: pendingLoading } =
    useAdminGetPendingSalons();
  const { data: allSalons = [], isLoading: salonsLoading } =
    useAdminGetAllSalons();
  const { data: defaultTrialDays } = useAdminGetDefaultTrialDays();
  const { data: subscriptionPrice } = useAdminGetSubscriptionPrice();

  const approveMutation = useAdminApproveSalon();
  const rejectMutation = useAdminRejectSalon();
  const setActiveMutation = useAdminSetSalonActive();
  const setSubMutation = useAdminSetSalonSubscription();
  const setTrialDaysMutation = useAdminSetDefaultTrialDays();
  const setPriceMutation = useAdminSetSubscriptionPrice();
  const processExpMutation = useAdminProcessTrialExpirations();
  const { data: revenueStats, isLoading: revenueLoading } =
    useAdminGetRevenueStats();

  const statCards = [
    {
      label: "कुल दुकानें",
      value: stats ? Number(stats.total) : "—",
      color: "text-blue-600",
    },
    {
      label: "सक्रिय दुकानें",
      value: stats ? Number(stats.active) : "—",
      color: "text-green-600",
    },
    {
      label: "समाप्त/निष्क्रिय",
      value: stats ? Number(stats.expired) : "—",
      color: "text-red-600",
    },
    {
      label: "लंबित अनुमोदन",
      value: stats ? Number(stats.pending) : "—",
      color: "text-yellow-600",
    },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "डैशबोर्ड" },
    { id: "pending", label: `अनुमोदन (${pendingSalons.length})` },
    { id: "salons", label: "सभी दुकानें" },
    { id: "settings", label: "सेटिंग" },
    { id: "revenue", label: "रेवेन्यू" },
    { id: "reviews", label: "समीक्षाएं" },
    { id: "backup", label: "बैकअप" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Salon360 Admin</h1>
          <p className="text-xs text-gray-500">सुपर एडमिन पैनल</p>
        </div>
        {onLogout && (
          <Button variant="outline" size="sm" onClick={onLogout}>
            लॉगआउट
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4 flex gap-0 overflow-x-auto">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-4 pb-3">
                    <div className={`text-3xl font-bold ${s.color}`}>
                      {statsLoading ? "..." : s.value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Subscription price summary on dashboard */}
            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm text-blue-800">
                  सदस्यता मूल्य:{" "}
                  <span className="font-bold text-blue-900">
                    ₹{subscriptionPrice ?? 149}/माह
                  </span>
                  <button
                    type="button"
                    onClick={() => setTab("settings")}
                    className="ml-2 text-xs text-blue-600 underline"
                  >
                    बदलें
                  </button>
                </p>
              </CardContent>
            </Card>

            {/* Process Expirations */}
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-sm text-gray-700 mb-3">
                  एक्सपायर हुए ट्रायल/सदस्यता को निष्क्रिय करें
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    processExpMutation.mutate(undefined, {
                      onSuccess: () => alert("एक्सपायर दुकानें निष्क्रिय हो गईं"),
                    })
                  }
                  disabled={processExpMutation.isPending}
                >
                  {processExpMutation.isPending
                    ? "चल रहा है..."
                    : "ट्रायल एक्सपायर चेक करें"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Pending Tab */}
        {tab === "pending" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">
              अनुमोदन हेतु दुकानें
            </h2>
            {pendingLoading ? (
              <p className="text-gray-500 text-sm">लोड हो रहा है...</p>
            ) : pendingSalons.length === 0 ? (
              <div
                className="text-center py-12 text-gray-400"
                data-ocid="pending.empty_state"
              >
                कोई लंबित अनुमोदन नहीं
              </div>
            ) : (
              pendingSalons.map((salon, idx) => (
                <Card
                  key={salon.id.toString()}
                  data-ocid={`pending.item.${idx + 1}`}
                >
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {salon.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {salon.city} • {salon.phone}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          मालिक: {salon.ownerPhone}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          data-ocid={`pending.delete_button.${idx + 1}`}
                          onClick={() =>
                            rejectMutation.mutate(salon.id, {
                              onSuccess: () => alert("दुकान अस्वीकृत"),
                            })
                          }
                          disabled={rejectMutation.isPending}
                        >
                          अस्वीकार
                        </Button>
                        <Button
                          size="sm"
                          data-ocid={`pending.confirm_button.${idx + 1}`}
                          onClick={() =>
                            approveMutation.mutate(salon.id, {
                              onSuccess: () => alert("दुकान स्वीकृत हो गई!"),
                            })
                          }
                          disabled={approveMutation.isPending}
                        >
                          स्वीकृत करें
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {/* All Salons Tab */}
        {tab === "salons" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">
              सभी दुकानें ({allSalons.length})
            </h2>
            {salonsLoading ? (
              <p className="text-gray-500 text-sm">लोड हो रहा है...</p>
            ) : allSalons.length === 0 ? (
              <div
                className="text-center py-12 text-gray-400"
                data-ocid="salons.empty_state"
              >
                कोई दुकान नहीं
              </div>
            ) : (
              allSalons.map((salon, idx) => (
                <SalonManageCard
                  key={salon.id.toString()}
                  salon={salon}
                  idx={idx}
                  setActiveMutation={setActiveMutation}
                  setSubMutation={setSubMutation}
                />
              ))
            )}
          </>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">सेटिंग</h2>

            {/* Subscription Price */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">सदस्यता मूल्य (₹/माह)</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-gray-500 mb-2">
                  वर्तमान: ₹{subscriptionPrice ?? 149}/माह
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="नई कीमत (जैसे 199)"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    data-ocid="settings.input"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    data-ocid="settings.save_button"
                    onClick={() => {
                      const p = Number(priceInput);
                      if (!p || p < 1) {
                        alert("सही कीमत डालें");
                        return;
                      }
                      setPriceMutation.mutate(p, {
                        onSuccess: () => {
                          alert(`कीमत ₹${p}/माह हो गई`);
                          setPriceInput("");
                        },
                      });
                    }}
                    disabled={setPriceMutation.isPending}
                  >
                    {setPriceMutation.isPending ? "सेव..." : "सेव करें"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Default Trial Days */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">डिफ़ॉल्ट ट्रायल अवधि</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-xs text-gray-500 mb-2">
                  वर्तमान: {defaultTrialDays ?? 7} दिन
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="ट्रायल दिन (जैसे 14)"
                    value={trialDaysInput}
                    onChange={(e) => setTrialDaysInput(e.target.value)}
                    data-ocid="settings.input"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    data-ocid="settings.save_button"
                    onClick={() => {
                      const d = Number(trialDaysInput);
                      if (!d || d < 1) {
                        alert("सही दिन डालें");
                        return;
                      }
                      setTrialDaysMutation.mutate(d, {
                        onSuccess: () => {
                          alert(`डिफ़ॉल्ट ट्रायल ${d} दिन हो गया`);
                          setTrialDaysInput("");
                        },
                      });
                    }}
                    disabled={setTrialDaysMutation.isPending}
                  >
                    {setTrialDaysMutation.isPending ? "सेव..." : "सेव करें"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Revenue Tab */}
        {tab === "revenue" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">रेवेन्यू</h2>
            {revenueLoading ? (
              <p className="text-gray-500 text-sm">लोड हो रहा है...</p>
            ) : !revenueStats ? (
              <p className="text-gray-400 text-sm">डेटा उपलब्ध नहीं</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{revenueStats.totalRevenue.toLocaleString("hi-IN")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">कुल रेवेन्यू</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3">
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{revenueStats.monthlyRevenue.toLocaleString("hi-IN")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">इस माह</div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">दुकानवार रेवेन्यू</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    {revenueStats.perSalon.length === 0 ? (
                      <p className="text-sm text-gray-400 px-4 py-3">
                        अभी कोई रेवेन्यू नहीं
                      </p>
                    ) : (
                      <div className="divide-y">
                        {revenueStats.perSalon.map(
                          ([salonId, salonName, revenue]) => (
                            <div
                              key={String(salonId)}
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <span className="text-sm text-gray-800 font-medium">
                                {salonName}
                              </span>
                              <span className="text-sm font-semibold text-green-700">
                                ₹{revenue.toLocaleString("hi-IN")}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* Reviews Tab */}
        {tab === "reviews" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">
              ग्राहक समीक्षाएं
            </h2>
            <ReviewsTab />
          </>
        )}

        {/* Backup Tab */}
        {tab === "backup" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">
              डेटा बैकअप और रिस्टोर
            </h2>
            <BackupTab />
          </>
        )}
      </div>
    </div>
  );
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}salon360_salt`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function SalonManageCard({
  salon,
  idx,
  setActiveMutation,
  setSubMutation,
}: {
  salon: SalonWithId;
  idx: number;
  setActiveMutation: ReturnType<typeof useAdminSetSalonActive>;
  setSubMutation: ReturnType<typeof useAdminSetSalonSubscription>;
}) {
  const trialStatus = getTrialStatus(salon);
  const [subStart, setSubStart] = useState("");
  const [subEnd, setSubEnd] = useState("");
  const [trialDays, setTrialDays] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const resetPasswordMutation = useAdminResetOwnerPassword();

  return (
    <Card data-ocid={`salons.item.${idx + 1}`}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900">{salon.name}</p>
              <Badge variant={trialStatus.variant} className="text-xs">
                {trialStatus.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              {salon.city} • {salon.phone}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant={salon.isActive ? "destructive" : "default"}
              data-ocid={`salons.toggle.${idx + 1}`}
              onClick={() =>
                setActiveMutation.mutate(
                  { salonId: salon.id, active: !salon.isActive },
                  {
                    onSuccess: () =>
                      alert(
                        salon.isActive
                          ? "दुकान निष्क्रिय हो गई"
                          : "दुकान सक्रिय हो गई",
                      ),
                  },
                )
              }
              disabled={setActiveMutation.isPending}
            >
              {salon.isActive ? "निष्क्रिय करें" : "सक्रिय करें"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-ocid={`salons.edit_button.${idx + 1}`}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "बंद करें" : "सेटिंग"}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 pt-3 border-t">
            {/* Subscription dates */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                सदस्यता तारीखें
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400">
                    शुरू
                    <input
                      type="date"
                      value={subStart}
                      onChange={(e) => setSubStart(e.target.value)}
                      data-ocid={`salons.input.${idx + 1}`}
                      className="w-full text-xs border rounded px-2 py-1 mt-0.5 block"
                    />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-gray-400">
                    समाप्ति
                    <input
                      type="date"
                      value={subEnd}
                      onChange={(e) => setSubEnd(e.target.value)}
                      data-ocid={`salons.input.${idx + 1}`}
                      className="w-full text-xs border rounded px-2 py-1 mt-0.5 block"
                    />
                  </label>
                </div>
              </div>
              <Button
                size="sm"
                className="mt-2 w-full"
                data-ocid={`salons.save_button.${idx + 1}`}
                onClick={() => {
                  if (!subStart || !subEnd) {
                    alert("दोनों तारीखें भरें");
                    return;
                  }
                  setSubMutation.mutate(
                    { salonId: salon.id, active: true },
                    { onSuccess: () => alert("सदस्यता सक्रिय हो गई") },
                  );
                }}
                disabled={setSubMutation.isPending}
              >
                सदस्यता सेव करें
              </Button>
            </div>

            {/* Trial days */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                ट्रायल दिन बदलें
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="दिन"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  data-ocid={`salons.input.${idx + 1}`}
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  size="sm"
                  data-ocid={`salons.save_button.${idx + 1}`}
                  onClick={() => {
                    const d = Number(trialDays);
                    if (!d || d < 1) {
                      alert("सही दिन डालें");
                      return;
                    }
                    alert(
                      `${salon.name} के लिए ट्रायल ${d} दिन सेट करें (backend hook जोड़ें)`,
                    );
                  }}
                >
                  सेव
                </Button>
              </div>
              {salon.trialStartDate > 0n && (
                <p className="text-xs text-gray-400 mt-1">
                  ट्रायल शुरू:{" "}
                  {new Date(
                    Number(salon.trialStartDate) / 1_000_000,
                  ).toLocaleDateString("hi-IN")}
                  {" • "}
                  अवधि: {Number(salon.trialDays)} दिन
                </p>
              )}
            </div>

            {/* Password Reset */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                पासवर्ड Reset करें
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="नया पासवर्ड (कम से कम 6 अक्षर)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  disabled={
                    resetPasswordMutation.isPending || newPassword.length < 6
                  }
                  onClick={async () => {
                    if (newPassword.length < 6) {
                      toast.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
                      return;
                    }
                    try {
                      const hash = await hashPassword(newPassword);
                      const ok = await resetPasswordMutation.mutateAsync({
                        ownerPhone: salon.ownerPhone,
                        newPasswordHash: hash,
                      });
                      if (ok) {
                        toast.success(`${salon.name} का पासवर्ड reset हो गया!`);
                        setNewPassword("");
                      } else {
                        toast.error("Owner नहीं मिला — पासवर्ड reset नहीं हुआ");
                      }
                    } catch {
                      toast.error("पासवर्ड reset नहीं हो पाया");
                    }
                  }}
                >
                  {resetPasswordMutation.isPending ? "..." : "Reset"}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Owner: {salon.ownerPhone}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

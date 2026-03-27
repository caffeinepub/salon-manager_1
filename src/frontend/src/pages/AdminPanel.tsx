import { useState } from "react";
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
  useAdminGetAllSalons,
  useAdminGetDashboardStats,
  useAdminGetDefaultTrialDays,
  useAdminGetPendingSalons,
  useAdminGetSubscriptionPrice,
  useAdminProcessTrialExpirations,
  useAdminRejectSalon,
  useAdminSetDefaultTrialDays,
  useAdminSetSalonActive,
  useAdminSetSalonSubscription,
  useAdminSetSubscriptionPrice,
} from "../hooks/useQueries";

type Tab = "dashboard" | "pending" | "salons" | "settings";

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
                    className="ml-2 text-xs underline text-blue-600"
                    onClick={() => setTab("settings")}
                  >
                    बदलें
                  </button>
                </p>
              </CardContent>
            </Card>

            {pendingSalons.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-yellow-800">
                    ⚠️ {pendingSalons.length} दुकान
                    {pendingSalons.length > 1 ? "ें" : ""} अनुमोदन की प्रतीक्षा में
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    variant="outline"
                    onClick={() => setTab("pending")}
                  >
                    अभी देखें
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Pending Tab */}
        {tab === "pending" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">
              लंबित अनुमोदन
            </h2>
            {pendingLoading && (
              <p className="text-sm text-gray-500">लोड हो रहा है...</p>
            )}
            {!pendingLoading && pendingSalons.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500 text-sm">
                  कोई लंबित अनुमोदन नहीं
                </CardContent>
              </Card>
            )}
            {pendingSalons.map((salon) => (
              <Card key={salon.id.toString()} className="border-yellow-100">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {salon.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {salon.city} — {salon.phone}
                      </p>
                      <p className="text-xs text-gray-400">{salon.address}</p>
                    </div>
                    <Badge variant="secondary">लंबित</Badge>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(salon.id)}
                    >
                      {approveMutation.isPending ? "..." : "✓ मंजूर करें"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(salon.id)}
                    >
                      {rejectMutation.isPending ? "..." : "✗ अस्वीकार करें"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* All Salons Tab */}
        {tab === "salons" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">
                सभी दुकानें ({allSalons.length}/100)
              </h2>
              <Button
                size="sm"
                variant="outline"
                disabled={processExpMutation.isPending}
                onClick={() => processExpMutation.mutate()}
              >
                {processExpMutation.isPending ? "..." : "ट्रायल जांचें"}
              </Button>
            </div>
            {salonsLoading && (
              <p className="text-sm text-gray-500">लोड हो रहा है...</p>
            )}
            {!salonsLoading && allSalons.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500 text-sm">
                  कोई दुकान नहीं मिली
                </CardContent>
              </Card>
            )}
            {allSalons.map((salon) => {
              const status = getTrialStatus(salon);
              return (
                <Card key={salon.id.toString()}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {salon.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {salon.city} — {salon.phone}
                        </p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={salon.isActive ? "outline" : "default"}
                        disabled={setActiveMutation.isPending}
                        onClick={() =>
                          setActiveMutation.mutate({
                            salonId: salon.id,
                            active: !salon.isActive,
                          })
                        }
                      >
                        {salon.isActive ? "निष्क्रिय करें" : "सक्रिय करें"}
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          salon.subscriptionActive ? "outline" : "default"
                        }
                        disabled={setSubMutation.isPending}
                        onClick={() =>
                          setSubMutation.mutate({
                            salonId: salon.id,
                            active: !salon.subscriptionActive,
                          })
                        }
                      >
                        {salon.subscriptionActive
                          ? "सदस्यता रद्द करें"
                          : "सदस्यता दें"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <>
            <h2 className="text-base font-semibold text-gray-800">सेटिंग</h2>

            {/* Subscription Price Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">सदस्यता मूल्य (₹/माह)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  वर्तमान मूल्य:{" "}
                  <span className="font-semibold text-green-700">
                    ₹{subscriptionPrice ?? 149}/माह
                  </span>
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="नया मूल्य"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    disabled={!priceInput || setPriceMutation.isPending}
                    onClick={() => {
                      const price = Number.parseFloat(priceInput);
                      if (price > 0) {
                        setPriceMutation.mutate(price, {
                          onSuccess: () => setPriceInput(""),
                        });
                      }
                    }}
                  >
                    {setPriceMutation.isPending ? "..." : "सेव करें"}
                  </Button>
                </div>
                {setPriceMutation.isSuccess && (
                  <p className="text-xs text-green-600">
                    ✓ मूल्य अपडेट हो गया — अब हर जगह नया मूल्य दिखेगा
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  मूल्य बदलने के बाद नई सदस्यताओं पर तुरंत लागू होगा।
                </p>
              </CardContent>
            </Card>

            {/* Trial Days Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">डिफ़ॉल्ट ट्रायल अवधि</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  वर्तमान डिफ़ॉल्ट:{" "}
                  <span className="font-semibold">
                    {defaultTrialDays ?? 7} दिन
                  </span>
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    placeholder="दिन"
                    value={trialDaysInput}
                    onChange={(e) => setTrialDaysInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    disabled={!trialDaysInput || setTrialDaysMutation.isPending}
                    onClick={() => {
                      const days = Number.parseInt(trialDaysInput);
                      if (days > 0) {
                        setTrialDaysMutation.mutate(days, {
                          onSuccess: () => setTrialDaysInput(""),
                        });
                      }
                    }}
                  >
                    {setTrialDaysMutation.isPending ? "..." : "सेव करें"}
                  </Button>
                </div>
                {setTrialDaysMutation.isSuccess && (
                  <p className="text-xs text-green-600">
                    ✓ ट्रायल अवधि अपडेट हो गई
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Trial Expiry Process */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ट्रायल समाप्ति प्रक्रिया</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">
                  जिन दुकानों का ट्रायल समाप्त हो गया है और सदस्यता नहीं है, उन्हें स्वचालित
                  रूप से निष्क्रिय करें।
                </p>
                <Button
                  variant="outline"
                  disabled={processExpMutation.isPending}
                  onClick={() => processExpMutation.mutate()}
                >
                  {processExpMutation.isPending
                    ? "प्रक्रिया हो रही है..."
                    : "ट्रायल समाप्त करें"}
                </Button>
                {processExpMutation.isSuccess && (
                  <p className="text-xs text-green-600">
                    ✓ {Number(processExpMutation.data ?? 0)} दुकानें निष्क्रिय की गईं
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <p className="text-xs text-gray-500">
                  अधिकतम दुकानें: <span className="font-semibold">100</span>
                  <br />
                  ट्रायल अवधि:{" "}
                  <span className="font-semibold">
                    {defaultTrialDays ?? 7} दिन
                  </span>
                  <br />
                  सदस्यता मूल्य:{" "}
                  <span className="font-semibold">
                    ₹{subscriptionPrice ?? 149}/माह
                  </span>
                  <br />
                  Admin ईमेल:{" "}
                  <span className="font-semibold">amitkrji498@gmail.com</span>
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Crown,
  IndianRupee,
  Loader2,
  LogOut,
  RefreshCw,
  Scissors,
  Settings,
  Shield,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type SalonWithId,
  useAdminGetAllSalons,
  useAdminSetSalonActive,
  useAdminSetSalonSubscription,
  useGetPlatformSubscriptionPrice,
  useSetPlatformSubscriptionPrice,
} from "../hooks/useQueries";

function getTrialDaysRemaining(trialStartDate: bigint) {
  const started = Number(trialStartDate) / 1_000_000;
  const elapsed = Math.floor((Date.now() - started) / (1000 * 60 * 60 * 24));
  return Math.max(0, 7 - elapsed);
}

export default function AdminPanel() {
  const { clear } = useInternetIdentity();

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.12 0.04 155)" }}
    >
      {/* Admin Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3"
        style={{
          background: "oklch(0.16 0.05 155)",
          borderBottom: "1px solid oklch(0.25 0.05 155)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "oklch(0.75 0.12 70)" }}
            >
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p
                className="font-bold text-sm"
                style={{ color: "oklch(0.95 0.02 145)" }}
              >
                Salon360 Admin
              </p>
              <p className="text-xs" style={{ color: "oklch(0.75 0.12 70)" }}>
                सुपर एडमिन पैनल
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clear()}
            data-ocid="admin.close_button"
            style={{ color: "oklch(0.6 0.05 145)" }}
          >
            <LogOut className="w-4 h-4 mr-1" />
            बाहर
          </Button>
        </div>
      </header>

      {/* Admin Banner */}
      <div className="px-4 pt-4">
        <div
          className="max-w-2xl mx-auto rounded-xl p-3 flex items-center gap-3"
          style={{
            background: "oklch(0.75 0.12 70 / 0.15)",
            border: "1px solid oklch(0.75 0.12 70 / 0.4)",
          }}
        >
          <Shield
            className="w-5 h-5 flex-shrink-0"
            style={{ color: "oklch(0.75 0.12 70)" }}
          />
          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              आप सुपर एडमिन हैं
            </p>
            <p className="text-xs" style={{ color: "oklch(0.75 0.12 70)" }}>
              सभी सैलून और सेटिंग्स का पूरा नियंत्रण
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        <Tabs defaultValue="salons">
          <TabsList
            className="w-full mb-4"
            style={{ background: "oklch(0.18 0.05 155)" }}
          >
            <TabsTrigger
              value="salons"
              className="flex-1"
              data-ocid="admin.tab"
            >
              सभी सैलून
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1"
              data-ocid="admin.tab"
            >
              सेटिंग्स
            </TabsTrigger>
          </TabsList>

          <TabsContent value="salons">
            <SalonsTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>

      <footer
        className="text-center py-4 text-xs"
        style={{ color: "oklch(0.45 0.04 155)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function SalonsTab() {
  const { data: salons = [], isLoading, refetch } = useAdminGetAllSalons();
  const { mutate: setSubscription, isPending: subPending } =
    useAdminSetSalonSubscription();
  const { mutate: setActive, isPending: activePending } =
    useAdminSetSalonActive();

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        data-ocid="admin.loading_state"
      >
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(0.52 0.18 145)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.95 0.02 145)" }}>
          सभी सैलून ({salons.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          data-ocid="admin.secondary_button"
          style={{ color: "oklch(0.52 0.18 145)" }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {salons.length === 0 ? (
        <div className="text-center py-12" data-ocid="admin.empty_state">
          <Scissors
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.05 155)" }}
          />
          <p style={{ color: "oklch(0.6 0.05 145)" }}>अभी कोई सैलून रजिस्टर नहीं</p>
        </div>
      ) : (
        salons.map((salon, idx) => (
          <SalonAdminCard
            key={salon.id.toString()}
            salon={salon}
            idx={idx}
            onToggleSubscription={(active) =>
              setSubscription(
                { salonId: salon.id, active },
                {
                  onSuccess: () =>
                    toast.success(`सब्सक्रिप्शन ${active ? "चालू" : "बंद"} कर दिया`),
                  onError: () => toast.error("कुछ गलत हुआ"),
                },
              )
            }
            onToggleActive={(active) =>
              setActive(
                { salonId: salon.id, active },
                {
                  onSuccess: () =>
                    toast.success(`सैलून ${active ? "चालू" : "बंद"} कर दिया`),
                  onError: () => toast.error("कुछ गलत हुआ"),
                },
              )
            }
            isPending={subPending || activePending}
          />
        ))
      )}
    </div>
  );
}

function SalonAdminCard({
  salon,
  idx,
  onToggleSubscription,
  onToggleActive,
  isPending,
}: {
  salon: SalonWithId;
  idx: number;
  onToggleSubscription: (active: boolean) => void;
  onToggleActive: (active: boolean) => void;
  isPending: boolean;
}) {
  const trialDays = getTrialDaysRemaining(salon.trialStartDate);

  return (
    <div
      className="rounded-xl p-4"
      data-ocid={`admin.item.${idx + 1}`}
      style={{
        background: "oklch(0.18 0.05 155)",
        border: "1px solid oklch(0.28 0.05 155)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p
              className="font-semibold text-sm"
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              {salon.name}
            </p>
            {!salon.isActive && (
              <Badge
                className="text-xs"
                style={{
                  background: "oklch(0.577 0.245 27.325 / 0.2)",
                  color: "oklch(0.577 0.245 27.325)",
                  border: "none",
                }}
              >
                बंद
              </Badge>
            )}
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: "oklch(0.6 0.05 145)" }}
          >
            {salon.city}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {trialDays > 0 ? (
            <Badge
              className="text-xs"
              style={{
                background: "oklch(0.52 0.18 145 / 0.2)",
                color: "oklch(0.52 0.18 145)",
                border: "none",
              }}
            >
              ट्रायल: {trialDays} दिन
            </Badge>
          ) : salon.subscriptionActive ? (
            <Badge
              className="text-xs"
              style={{
                background: "oklch(0.52 0.18 145 / 0.2)",
                color: "oklch(0.52 0.18 145)",
                border: "none",
              }}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              सब्सक्रिप्शन
            </Badge>
          ) : (
            <Badge
              className="text-xs"
              style={{
                background: "oklch(0.577 0.245 27.325 / 0.2)",
                color: "oklch(0.577 0.245 27.325)",
                border: "none",
              }}
            >
              <XCircle className="w-3 h-3 mr-1" />
              एक्सपायर
            </Badge>
          )}
        </div>
      </div>

      <Separator
        style={{ borderColor: "oklch(0.28 0.05 155)" }}
        className="my-2"
      />

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 text-xs"
          disabled={isPending}
          data-ocid="admin.toggle"
          onClick={() => onToggleSubscription(!salon.subscriptionActive)}
          style={{
            background: salon.subscriptionActive
              ? "oklch(0.577 0.245 27.325 / 0.2)"
              : "oklch(0.52 0.18 145 / 0.2)",
            color: salon.subscriptionActive
              ? "oklch(0.577 0.245 27.325)"
              : "oklch(0.52 0.18 145)",
            border: `1px solid ${salon.subscriptionActive ? "oklch(0.577 0.245 27.325 / 0.4)" : "oklch(0.52 0.18 145 / 0.4)"}`,
          }}
        >
          {salon.subscriptionActive ? "सब्स. बंद करें" : "सब्स. चालू करें"}
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs"
          disabled={isPending}
          data-ocid="admin.toggle"
          onClick={() => onToggleActive(!salon.isActive)}
          style={{
            background: salon.isActive
              ? "oklch(0.577 0.245 27.325 / 0.2)"
              : "oklch(0.52 0.18 145 / 0.2)",
            color: salon.isActive
              ? "oklch(0.577 0.245 27.325)"
              : "oklch(0.52 0.18 145)",
            border: `1px solid ${salon.isActive ? "oklch(0.577 0.245 27.325 / 0.4)" : "oklch(0.52 0.18 145 / 0.4)"}`,
          }}
        >
          {salon.isActive ? "सैलून बंद करें" : "सैलून चालू करें"}
        </Button>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { data: price, isLoading } = useGetPlatformSubscriptionPrice();
  const { mutate: setPrice, isPending } = useSetPlatformSubscriptionPrice();
  const [editing, setEditing] = useState(false);
  const [newPrice, setNewPrice] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newPrice);
    if (!val || val < 0) {
      toast.error("सही दाम डालें");
      return;
    }
    setPrice(val, {
      onSuccess: () => {
        toast.success("दाम बदल गया!");
        setEditing(false);
        setNewPrice("");
      },
      onError: () => toast.error("कुछ गलत हुआ"),
    });
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.18 0.05 155)",
          border: "1px solid oklch(0.28 0.05 155)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee
            className="w-5 h-5"
            style={{ color: "oklch(0.75 0.12 70)" }}
          />
          <h3
            className="font-semibold"
            style={{ color: "oklch(0.95 0.02 145)" }}
          >
            सब्सक्रिप्शन का दाम
          </h3>
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-4"
            data-ocid="settings.loading_state"
          >
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: "oklch(0.52 0.18 145)" }}
            />
          </div>
        ) : !editing ? (
          <>
            <p
              className="text-2xl font-bold mb-1"
              style={{ color: "oklch(0.75 0.12 70)" }}
            >
              ₹{price}/माह
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: "oklch(0.6 0.05 145)" }}
            >
              वर्तमान सब्सक्रिप्शन मूल्य
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditing(true);
                setNewPrice(String(price));
              }}
              data-ocid="settings.edit_button"
              style={{
                background: "oklch(0.75 0.12 70 / 0.2)",
                color: "oklch(0.75 0.12 70)",
                border: "1px solid oklch(0.75 0.12 70 / 0.4)",
              }}
            >
              दाम बदलें
            </Button>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <Label
                className="text-sm"
                style={{ color: "oklch(0.75 0.05 145)" }}
              >
                नया दाम (₹/माह)
              </Label>
              <Input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                type="number"
                placeholder="499"
                data-ocid="settings.input"
                style={{
                  background: "oklch(0.22 0.05 155)",
                  border: "1px solid oklch(0.32 0.05 155)",
                  color: "oklch(0.95 0.02 145)",
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                data-ocid="settings.save_button"
                style={{ background: "oklch(0.75 0.12 70)", color: "white" }}
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : null}
                सेव करें
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
                data-ocid="settings.cancel_button"
                style={{ color: "oklch(0.6 0.05 145)" }}
              >
                रद्द
              </Button>
            </div>
          </form>
        )}
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: "oklch(0.18 0.05 155)",
          border: "1px solid oklch(0.28 0.05 155)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Settings
            className="w-5 h-5"
            style={{ color: "oklch(0.52 0.18 145)" }}
          />
          <h3
            className="font-semibold"
            style={{ color: "oklch(0.95 0.02 145)" }}
          >
            सिस्टम की जानकारी
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "oklch(0.6 0.05 145)" }}>प्लेटफॉर्म</span>
            <span style={{ color: "oklch(0.9 0.02 145)" }}>Salon360</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "oklch(0.6 0.05 145)" }}>फ्री ट्रायल</span>
            <span style={{ color: "oklch(0.9 0.02 145)" }}>7 दिन</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "oklch(0.6 0.05 145)" }}>अधिकतम सैलून</span>
            <span style={{ color: "oklch(0.9 0.02 145)" }}>50+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

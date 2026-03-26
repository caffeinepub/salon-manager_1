import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

interface Props {
  open: boolean;
}

export default function ProfileSetup({ open }: Props) {
  const [name, setName] = useState("");
  const saveProfile = useSaveProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("प्रोफ़ाइल सेव हो गई!");
    } catch {
      toast.error("कुछ गलत हो गया। दोबारा कोशिश करें।");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="profile_setup.dialog"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "oklch(0.93 0.035 75)" }}
          >
            <User
              className="w-7 h-7"
              style={{ color: "oklch(0.34 0.075 192)" }}
            />
          </div>
          <DialogTitle className="font-display text-2xl text-center">
            आपका नाम बताएं
          </DialogTitle>
          <DialogDescription className="text-center">
            पहली बार लॉगिन पर अपना नाम दर्ज करें।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">पूरा नाम</Label>
            <Input
              id="profile-name"
              data-ocid="profile_setup.input"
              placeholder="जैसे: Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            data-ocid="profile_setup.submit_button"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full h-11 rounded-full"
            style={{ background: "oklch(0.34 0.075 192)", color: "white" }}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> सेव हो रहा है...
              </>
            ) : (
              "जारी रखें"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

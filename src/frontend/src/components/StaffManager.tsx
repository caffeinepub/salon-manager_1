import { Edit, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface StaffMember {
  id: string;
  name: string;
  mobile: string;
  role: string;
  isActive: boolean;
}

function getStaffKey(salonId: bigint) {
  return `salon_staff_${salonId}`;
}

export function getStaff(salonId: bigint): StaffMember[] {
  try {
    const raw = localStorage.getItem(getStaffKey(salonId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStaff(salonId: bigint, staff: StaffMember[]) {
  localStorage.setItem(getStaffKey(salonId), JSON.stringify(staff));
}

interface Props {
  salonId: bigint;
}

export default function StaffManager({ salonId }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>(() => getStaff(salonId));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", role: "हेयरकट" });

  useEffect(() => {
    saveStaff(salonId, staff);
  }, [staff, salonId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", mobile: "", role: "हेयरकट" });
    setShowForm(true);
  };

  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setForm({ name: s.name, mobile: s.mobile, role: s.role });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("नाम जरूरी है");
      return;
    }
    if (editing) {
      setStaff((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...form } : s)),
      );
      toast.success("स्टाफ अपडेट हो गया");
    } else {
      const newMember: StaffMember = {
        id: `staff_${Date.now()}`,
        ...form,
        isActive: true,
      };
      setStaff((prev) => [...prev, newMember]);
      toast.success("स्टाफ जोड़ दिया");
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    toast.success("स्टाफ हटा दिया");
  };

  const toggleActive = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  };

  const cardStyle = {
    background: "oklch(0.17 0.012 60)",
    border: "1px solid oklch(0.28 0.04 75 / 0.6)",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold" style={{ color: "oklch(0.97 0.015 80)" }}>
          स्टाफ ({staff.length})
        </h2>
        <Button
          size="sm"
          onClick={openAdd}
          data-ocid="staff.add_button"
          style={{ background: "oklch(0.78 0.12 80)", color: "white" }}
        >
          <Plus className="w-4 h-4 mr-1" />
          नया स्टाफ
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-4 space-y-3"
          style={cardStyle}
        >
          <h3
            className="text-sm font-semibold"
            style={{ color: "oklch(0.97 0.015 80)" }}
          >
            {editing ? "स्टाफ अपडेट करें" : "नया स्टाफ जोड़ें"}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                नाम
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="जैसे: राहुल शर्मा"
                style={{
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                मोबाइल (वैकल्पिक)
              </Label>
              <Input
                value={form.mobile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, mobile: e.target.value }))
                }
                placeholder="10 अंकों का नंबर"
                style={{
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                }}
              />
            </div>
            <div>
              <Label
                className="text-xs"
                style={{ color: "oklch(0.65 0.07 80)" }}
              >
                काम
              </Label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                className="w-full rounded-md px-3 py-2 text-sm"
                style={{
                  background: "oklch(0.17 0.012 60)",
                  border: "1px solid oklch(0.32 0.06 78 / 0.5)",
                  color: "oklch(0.97 0.015 80)",
                }}
              >
                <option value="हेयरकट">हेयरकट</option>
                <option value="शेव">शेव</option>
                <option value="कलर">कलर</option>
                <option value="मसाज">मसाज</option>
                <option value="सहायक">सहायक</option>
                <option value="अन्य">अन्य</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              style={{ background: "oklch(0.78 0.12 80)", color: "white" }}
            >
              {editing ? "अपडेट करें" : "जोड़ें"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowForm(false)}
              style={{ color: "oklch(0.55 0.04 80)" }}
            >
              रद्द
            </Button>
          </div>
        </form>
      )}

      {staff.length === 0 ? (
        <div className="text-center py-10" data-ocid="staff.empty_state">
          <User
            className="w-10 h-10 mx-auto mb-3"
            style={{ color: "oklch(0.4 0.05 155)" }}
          />
          <p style={{ color: "oklch(0.55 0.04 80)" }}>कोई स्टाफ नहीं जोड़ा गया</p>
          <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 155)" }}>
            ओपर “नया स्टाफ” पर टैप करें
          </p>
        </div>
      ) : (
        staff.map((s, idx) => (
          <div
            key={s.id}
            className="rounded-xl p-3 flex items-center justify-between"
            data-ocid={`staff.item.${idx + 1}`}
            style={{ ...cardStyle, opacity: s.isActive ? 1 : 0.6 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background: "oklch(0.52 0.18 145 / 0.2)",
                  color: "oklch(0.78 0.12 80)",
                }}
              >
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p
                  className="font-medium text-sm"
                  style={{ color: "oklch(0.97 0.015 80)" }}
                >
                  {s.name}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.55 0.04 80)" }}>
                  {s.role}
                  {s.mobile ? ` • ${s.mobile}` : ""}
                  {!s.isActive && (
                    <span className="ml-1 text-red-400">(निष्क्रिय)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleActive(s.id)}
                data-ocid={`staff.toggle.${idx + 1}`}
                className="text-xs px-2"
                style={{
                  color: s.isActive
                    ? "oklch(0.78 0.12 80)"
                    : "oklch(0.55 0.04 80)",
                }}
              >
                {s.isActive ? "सक्रिय" : "निष्क्रिय"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit(s)}
                data-ocid={`staff.edit_button.${idx + 1}`}
                style={{ color: "oklch(0.78 0.12 80)" }}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(s.id)}
                data-ocid={`staff.delete_button.${idx + 1}`}
                style={{ color: "oklch(0.577 0.245 27.325)" }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck, ShieldAlert, Save, Pencil, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import { profileService } from "../../../services/profileService";
import type { UserProfile, UpdateProfilePayload } from "../../../services/types/profile.types";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: "13px",
  fontFamily: "var(--font-body)",
  color: "#333333",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "10px 12px",
  outline: "none",
  transition: "border-color 0.15s ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666666",
  fontFamily: "var(--font-body)",
  marginBottom: "6px",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ReadOnlyRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          width: "34px", height: "34px", borderRadius: "8px",
          backgroundColor: "#f5f5f5", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0, color: "#888888",
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: "11px", color: "#b0b0b0", fontFamily: "var(--font-body)" }}>{label}</p>
        <p
          style={{
            fontSize: "13px", fontWeight: 600, color: "#222222",
            fontFamily: "var(--font-body)", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ProfileView() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState<UpdateProfilePayload>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await profileService.getProfile();
        if (!cancelled) {
          setProfile(data);
          setForm({
            fullName: data.fullName,
            state: data.state,
            schoolName: data.schoolName,
            schoolLocation: data.schoolLocation,
            schoolType: data.schoolType,
          });
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startEditing = () => {
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName,
      state: profile.state,
      schoolName: profile.schoolName,
      schoolLocation: profile.schoolLocation,
      schoolType: profile.schoolType,
    });
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Couldn't save your changes. Please try again.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa", minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #e8e8e8", borderTopColor: "#006400", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "14px", color: "#888888" }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa", minHeight: 0 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "#d32f2f", marginBottom: "8px" }}>
            Failed to load your profile
          </p>
          <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .filter((n) => n.length > 0)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <div
      style={{
        flex: 1, overflowY: "auto", overflowX: "hidden", minHeight: 0,
        backgroundColor: "#fafafa", scrollBehavior: "smooth",
        animation: "pageFadeIn 0.4s ease both",
      }}
    >
      <style>{`
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Hero */}
      <div
        style={{
          position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #101b37 0%, #0d3d1a 55%, #006400 100%)",
          padding: "56px 20px",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "18px", maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              width: "64px", height: "64px", minWidth: "64px", borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)",
              color: "#ffffff", fontSize: "20px", fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {initials || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                fontSize: "clamp(21px, 4vw, 26px)", fontWeight: 800, color: "#ffffff",
                fontFamily: "var(--font-headline)", letterSpacing: "-0.02em", marginBottom: "4px",
              }}
            >
              {profile.fullName}
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)", textTransform: "capitalize" }}>
              {profile.role}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "40px 24px 0", maxWidth: "900px", margin: "0 auto" }}>
        {/* Account info (read-only) */}
        <div
          style={{
            backgroundColor: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "12px",
            padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: "24px",
            animation: "fadeInUp 0.5s ease 0.05s both",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#101b37", fontFamily: "var(--font-headline)", marginBottom: "18px" }}>
            Account
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}>
            <ReadOnlyRow icon={<Mail size={16} />} label="Email" value={profile.email} />
            <ReadOnlyRow icon={<Phone size={16} />} label="Phone" value={profile.phone || "Not set"} />
            <ReadOnlyRow
              icon={profile.isEmailVerified ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              label="Email verification"
              value={profile.isEmailVerified ? "Verified" : "Not verified"}
            />
            <ReadOnlyRow
              icon={<User size={16} />}
              label="Member since"
              value={new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            />
          </div>
        </div>

        {/* Editable profile + school info */}
        <div
          style={{
            backgroundColor: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "12px",
            padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: "24px",
            animation: "fadeInUp 0.5s ease 0.1s both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#101b37", fontFamily: "var(--font-headline)" }}>
              Personal &amp; School Details
            </h2>
            {!isEditing ? (
              <Button variant="secondary" size="sm" onClick={startEditing}>
                <Pencil size={14} /> Edit
              </Button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                  <X size={14} /> Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                  <Save size={14} /> {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          {saveError && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontFamily: "var(--font-body)" }}>
              {saveError}
            </div>
          )}
          {saveSuccess && !isEditing && (
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontFamily: "var(--font-body)" }}>
              Profile updated successfully.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
            <Field label="Full name">
              <input
                type="text"
                value={form.fullName ?? ""}
                disabled={!isEditing}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                style={{ ...inputStyle, backgroundColor: isEditing ? "#ffffff" : "#f5f5f5", cursor: isEditing ? "text" : "default" }}
              />
            </Field>

            <Field label="State">
              <select
                value={form.state ?? ""}
                disabled={!isEditing}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                style={{ ...inputStyle, backgroundColor: isEditing ? "#ffffff" : "#f5f5f5", cursor: isEditing ? "pointer" : "default" }}
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="School name">
              <input
                type="text"
                value={form.schoolName ?? ""}
                disabled={!isEditing}
                onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
                style={{ ...inputStyle, backgroundColor: isEditing ? "#ffffff" : "#f5f5f5", cursor: isEditing ? "text" : "default" }}
              />
            </Field>

            <Field label="School location">
              <select
                value={form.schoolLocation ?? ""}
                disabled={!isEditing}
                onChange={(e) => setForm((f) => ({ ...f, schoolLocation: e.target.value }))}
                style={{ ...inputStyle, backgroundColor: isEditing ? "#ffffff" : "#f5f5f5", cursor: isEditing ? "pointer" : "default" }}
              >
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </Field>

            <Field label="School type">
              <select
                value={form.schoolType ?? ""}
                disabled={!isEditing}
                onChange={(e) => setForm((f) => ({ ...f, schoolType: e.target.value }))}
                style={{ ...inputStyle, backgroundColor: isEditing ? "#ffffff" : "#f5f5f5", cursor: isEditing ? "pointer" : "default" }}
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </Field>
          </div>
        </div>

        <div style={{ height: "48px" }} />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import Button from "../../../components/ui/Button";
import { profileService } from "../../../services/profileService";

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: "13px",
  fontFamily: "var(--font-body)",
  color: "#333333",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "10px 40px 10px 12px",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666666",
  fontFamily: "var(--font-body)",
  marginBottom: "6px",
};

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.border = "1px solid #006400"; }}
          onBlur={(e) => { e.currentTarget.style.border = "1px solid #e0e0e0"; }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", color: "#b0b0b0",
            display: "flex", alignItems: "center",
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function SettingsView() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setSaving(true);
    try {
      await profileService.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      resetForm();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Couldn't update your password. Please check your current password and try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

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
        <div style={{ position: "relative", zIndex: 1, maxWidth: "700px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "clamp(21px, 4vw, 26px)", fontWeight: 800, color: "#ffffff",
              fontFamily: "var(--font-headline)", letterSpacing: "-0.02em", marginBottom: "6px",
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)" }}>
            Manage your account security.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "40px 24px 0", maxWidth: "700px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "#ffffff", border: "1px solid #e8e8e8", borderRadius: "12px",
            padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            animation: "fadeInUp 0.5s ease 0.05s both",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#006400" }}>
              <KeyRound size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#101b37", fontFamily: "var(--font-headline)" }}>
                Change Password
              </h2>
              <p style={{ fontSize: "12px", color: "#888888", fontFamily: "var(--font-body)" }}>
                Choose a strong password you don't use elsewhere.
              </p>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontFamily: "var(--font-body)" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontFamily: "var(--font-body)" }}>
              Password changed successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((s) => !s)}
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggleShow={() => setShowNew((s) => !s)}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((s) => !s)}
              autoComplete="new-password"
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
              <Button type="submit" variant="primary" size="md" disabled={saving}>
                <Lock size={14} /> {saving ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>

          <p style={{ fontSize: "11px", color: "#b0b0b0", fontFamily: "var(--font-body)", marginTop: "14px" }}>
            Note: if you signed up with Google, you may not have a password set on this account yet.
          </p>
        </div>

        <div style={{ height: "48px" }} />
      </div>
    </div>
  );
}


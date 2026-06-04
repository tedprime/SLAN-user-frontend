import React, { useState } from "react";
import RegistrationToggle from "../ui/RegistrationToggle";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

export default function SignUpForm() {
  const [channel, setChannel] = useState("email"); // 'email' | 'phone'
  const [fullName, setFullName] = useState("");
  const [contactVal, setContactVal] = useState("");
  const [trcnId, setTrcnId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Account initialization completed via ${channel}. OTP dispatches active.`);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <RegistrationToggle
        options={[
          { id: "email", label: "Email Route", icon: "mail" },
          { id: "phone", label: "SMS Mobile Route", icon: "call" },
        ]}
        selectedId={channel}
        onChange={(id) => {
          setChannel(id);
          setContactVal("");
        }}
      />

      <div className="space-y-4">
        <InputField
          label="Full Legal Name"
          id="signup-name"
          type="text"
          placeholder="Principal Dr. Kunle Adebayo"
          iconName="person"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <InputField
          label={channel === "email" ? "Professional Email Address" : "Nigerian Mobile Number"}
          id="signup-contact"
          type={channel === "email" ? "email" : "tel"}
          placeholder={channel === "email" ? "kunle@school.ng" : "080 3456 7890"}
          iconName={channel === "email" ? "alternate_email" : "smartphone"}
          value={contactVal}
          onChange={(e) => setContactVal(e.target.value)}
          required
        />

        <InputField
          label="TRCN Registration Number (Optional)"
          id="signup-trcn"
          type="text"
          placeholder="PR/T/XXXXX"
          iconName="badge"
          value={trcnId}
          onChange={(e) => setTrcnId(e.target.value)}
        />
      </div>

      <div className="mt-4 flex items-start gap-2.5 bg-neutral-50 p-3 rounded-xl border border-neutral-200/50">
        <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">verified_user</span>
        <p className="text-[11px] text-neutral-500 font-body leading-relaxed">
          By continuing, you agree to our structural leadership academic terms. An operational verification prompt will immediately trigger for security synchronization.
        </p>
      </div>

      <Button type="submit" variant="primary" className="w-full justify-center mt-6 py-3 rounded-xl" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            Provisioning Profile...
          </>
        ) : (
          "Initialize Academy Account"
        )}
      </Button>
    </form>
  );
}
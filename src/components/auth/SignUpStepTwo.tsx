import React, { useState } from "react";
import AuthInput from "../ui/AuthInput";
import { authService } from "../../services/authService";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

interface StepTwoProps {
  email: string;
  fullName: string;
  setFullName: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  currentRole: string;
  setCurrentRole: (val: string) => void;
  stateRegion: string;
  setStateRegion: (val: string) => void;
  schoolLocation: string;
  setSchoolLocation: (val: string) => void;
  schoolType: string;
  setSchoolType: (val: string) => void;
  schoolName: string;
  setSchoolName: (val: string) => void;
  isGoogleRoute?: boolean;
  onSuccess: () => void;
}

export default function SignUpStepTwo({
  email,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  currentRole,
  setCurrentRole,
  stateRegion,
  setStateRegion,
  schoolLocation,
  setSchoolLocation,
  schoolType,
  setSchoolType,
  schoolName,
  setSchoolName,
  isGoogleRoute = false,
  onSuccess,
}: StepTwoProps) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isGoogleRoute && password !== confirmPassword) {
      setError("The passwords you entered do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        email,
        fullName,
        phone: phoneNumber,
        password,
        confirmPassword,
        role: currentRole,
        state: stateRegion,
        schoolName,
      });
      onSuccess();
    } catch (err) {
      const e = err as { statusCode?: number; status?: number; message?: string };
      if (e?.statusCode === 409 || e?.status === 409) {
        setError("This email is already registered.");
      } else {
        setError(e?.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <AuthInput
          label="Full Name"
          id="reg-fullname"
          type="text"
          placeholder="Enter your full name"
          iconName="person"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <AuthInput
          label="Phone Number"
          id="reg-phone"
          type="tel"
          placeholder="e.g. 08012345678"
          iconName="smartphone"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

        {!isGoogleRoute && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="reg-pass" className="text-sm font-700 text-neutral-700 block font-body">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-neutral-500 text-[20px] pointer-events-none select-none">
                    lock
                  </span>
                  <input
                    id="reg-pass"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm pl-11 pr-10 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 flex items-center text-neutral-500 hover:text-neutral-700 select-none focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-confirm-pass" className="text-sm font-700 text-neutral-700 block font-body">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-neutral-500 text-[20px] pointer-events-none select-none">
                    enhanced_encryption
                  </span>
                  <input
                    id="reg-confirm-pass"
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm pl-11 pr-10 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 flex items-center text-neutral-500 hover:text-neutral-700 select-none focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="text-xs font-600 text-red-500 font-body">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-700 text-neutral-700 block font-body">Current Role</label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
            >

<option value="principal">Principal / Head Teacher</option>
<option value="vice_principal">Vice / Assistant School Head</option>
<option value="school_head">School Head Cadre</option>
<option value="proprietor">School Proprietor</option>
<option value="education_officer">Education Officer</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-700 text-neutral-700 block font-body">State</label>
            <select
              value={stateRegion}
              onChange={(e) => setStateRegion(e.target.value)}
              className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-700 text-neutral-700 block font-body">School Location</label>
            <select
              value={schoolLocation}
              onChange={(e) => setSchoolLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
            >
              <option value="Urban">Urban</option>
              <option value="Semi-Urban">Semi-Urban</option>
              <option value="Rural">Rural</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-700 text-neutral-700 block font-body">School Type</label>
            <select
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
              className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
            >
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
          </div>
        </div>

        <AuthInput
          label="School Name"
          id="reg-school"
          type="text"
          placeholder="Enter your school/institution name"
          iconName="school"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full justify-center mt-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-600 text-sm inline-flex items-center gap-2 transition-colors rounded-sm"
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[16px]">
              progress_activity
            </span>
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
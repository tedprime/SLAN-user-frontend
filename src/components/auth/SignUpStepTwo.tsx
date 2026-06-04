import React from "react";
import AuthInput from "../ui/AuthInput";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

interface StepTwoProps {
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
  schoolName: string;
  setSchoolName: (val: string) => void;
  isGoogleRoute: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SignUpStepTwo({
  fullName, setFullName,
  phoneNumber, setPhoneNumber,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  currentRole, setCurrentRole,
  stateRegion, setStateRegion,
  schoolName, setSchoolName,
  isGoogleRoute,
  onSubmit
}: StepTwoProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
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

        {/* Password Management Node Group — Bypassed on Google OAuth paths */}
        {!isGoogleRoute && (
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm pl-11 pr-4 py-3"
                />
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
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-neutral-100 border border-neutral-300 text-neutral-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm font-500 font-body transition-all outline-none rounded-sm pl-11 pr-4 py-3"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-700 text-neutral-700 block font-body">
              Current Role
            </label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full px-4 py-3 rounded-sm border border-neutral-300 bg-neutral-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-800 text-sm font-500 font-body outline-none transition-all"
            >
              <option>Teacher</option>
              <option>Principal</option>
              <option>Vice Principal</option>
              <option>Headteacher</option>
              <option>Proprietor</option>
              <option>Aspiring Head</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-700 text-neutral-700 block font-body">
              State
            </label>
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
        className="w-full justify-center mt-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-600 text-sm inline-flex items-center gap-2 transition-colors rounded-sm"
      >
        Create Learner Account
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </button>
    </form>
  );
}
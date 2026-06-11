import React, { useState } from "react";
import AuthNavbar from "../components/layout/AuthNavbar";
import SignUpStepOne from "../components/auth/SignUpStepOne";
import SignUpStepTwo from "../components/auth/SignUpStepTwo";

export default function SignUpPage() {
  const currentYear = new Date().getFullYear();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State Values
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentRole, setCurrentRole] = useState("Principal");
  const [stateRegion, setStateRegion] = useState("Lagos");
  const [schoolName, setSchoolName] = useState("");
  const [schoolLocation, setSchoolLocation] = useState("");
  const [schoolType, setSchoolType] = useState("");

  const navigateTo = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  const handleRegistrationSuccess = () => {
    window.history.pushState(
      {},
      "",
      `/verify-otp?flow=signup&email=${encodeURIComponent(email)}`,
    );
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-surface">
      <AuthNavbar />

      <div className="flex-1 w-full flex items-center justify-center px-4 sm:px-6 py-24">
        <div className="max-w-xl w-full bg-surface-card border border-neutral-200 rounded-sm p-8 sm:p-10 shadow-sm transition-all">
          {/* Header Layout Container */}
          <div className="mb-8">
            {step === 1 ? (
              <div className="text-center w-full">
                <h2 className="text-[32px] font-800 font-headline text-tertiary-500 tracking-tight leading-none">
                  Join the Academy
                </h2>
                <p className="text-sm font-body text-neutral-600 mt-3 max-w-md mx-auto leading-relaxed">
                  Empowering Nigeria's educational leaders through professional
                  excellence.
                </p>
              </div>
            ) : (
              /* Step 2 displays only the standalone back button navigation action */
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-8 h-8 shrink-0 rounded-full border border-neutral-300 bg-neutral-50 text-neutral-600 hover:text-primary-500 hover:border-primary-500 flex items-center justify-center transition-colors focus:outline-none"
                  aria-label="Go back to step one"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                  </span>
                </button>
              </div>
            )}
          </div>

          {step === 1 ? (
            <SignUpStepOne
              email={email}
              setEmail={setEmail}
              onContinue={() => {
                setStep(2);
              }}
            />
          ) : (
            <SignUpStepTwo
              email={email} // ← add this
              fullName={fullName}
              setFullName={setFullName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              currentRole={currentRole}
              setCurrentRole={setCurrentRole}
              stateRegion={stateRegion}
              setStateRegion={setStateRegion}
              schoolLocation={schoolLocation}
              setSchoolLocation={setSchoolLocation}
              schoolType={schoolType}
              setSchoolType={setSchoolType}
              schoolName={schoolName}
              setSchoolName={setSchoolName}
              onSuccess={handleRegistrationSuccess} // ← renamed from onSubmit
            />
          )}

          <div className="mt-8 pt-4 border-t border-neutral-200 text-center">
            <p className="text-sm font-body text-neutral-700">
              Already have an account?{" "}
              <a
                href="/login"
                onClick={(e) => navigateTo("/login", e)}
                className="text-primary-500 font-700 hover:underline ms-1"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-8 py-4 bg-surface-card border-y border-neutral-200 text-[11px] font-600 font-body text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">
            verified
          </span>{" "}
          TRCN Acknowledged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px]">lock</span>{" "}
          Secure Data
        </span>
      </div>

      <footer className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs font-body text-neutral-600 bg-surface">
        <div className="space-y-2">
          <h4 className="font-headline font-800 text-base text-tertiary-500">
            SLAN Online
          </h4>
          <p className="text-neutral-500 leading-relaxed">
            © {currentYear} School Leadership Academy Nigeria (SLAN). Accredited
            by TRCN & ANCOPPS. Elevating education through leadership mastery.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-center">
          <div className="text-left space-y-2">
            <h5 className="font-700 text-tertiary-500 uppercase tracking-wider text-[11px]">
              Resources
            </h5>
            <a
              href="#privacy"
              className="block hover:text-primary-500 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="block hover:text-primary-500 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="text-left space-y-2 w-full max-w-40">
            <h5 className="font-700 text-tertiary-500 uppercase tracking-wider text-[11px]">
              Help & Support
            </h5>
            <a
              href="#accreditation"
              className="block hover:text-primary-500 transition-colors"
            >
              Acknowledgement
            </a>
            <a
              href="#support"
              className="block hover:text-primary-500 transition-colors"
            >
              Support Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

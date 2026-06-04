import AuthNavbar from "../components/layout/AuthNavbar";
import AuthLeftPanel from "../components/layout/AuthLeftPanel";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full flex flex-col bg-surface relative">
      <AuthNavbar />

      <div className="flex-1 w-full flex pt-17">
        <AuthLeftPanel />

        {/* Content Panel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-16 xl:px-24 py-12 bg-surface-card">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-[32px] font-800 font-headline text-tertiary-500 tracking-tight leading-none">
                Welcome Back, Learner
              </h2>
              <p className="text-sm font-body text-neutral-600 mt-3 leading-relaxed">
                Sign in to your SLAN Academy portal to continue your journey.
              </p>
            </div>

            <LoginForm />

            {/* Accreditation Badge Small Footer Assets */}
            <div className="flex items-center justify-center gap-4 mt-8 opacity-40 grayscale hover:grayscale-0 transition-all">
              <div
                className="w-8 h-8 bg-neutral-300 rounded-full"
                title="TRCN Seal"
              />
              <div
                className="w-8 h-8 bg-neutral-300 rounded-full"
                title="ANCOPPS Seal"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shared Horizontal Footer */}
      <footer className="w-full px-6 sm:px-12 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-body text-neutral-500 bg-surface">
        <div>
          © {currentYear} School Leadership Academy Nigeria (SLAN). Accredited by TRCN & ANCOPPS.
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#privacy"
            className="hover:text-primary-500 transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="#terms" 
            className="hover:text-primary-500 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#support"
            className="hover:text-primary-500 transition-colors"
          >
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
import React from "react";

export default function AuthNavbar() {
  const navigateTo = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-white border-b border-neutral-100">
      {/* Container matches the precise max-width, horizontal alignment, and h-16 framework of Navbar.tsx */}
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo matching structural heights */}
        <a
          href="/"
          onClick={(e) => navigateTo("/", e)}
          className="font-headline font-800 text-xl tracking-tight text-primary-500"
        >
          SLAN <span className="text-tertiary-500">Online</span>
        </a>

        {/* Actions section */}
        <div className="flex items-center gap-3">
          <a
            href="#help"
            className="text-sm font-500 font-body text-tertiary-500 
                       hover:text-primary-500 transition-colors duration-150 px-3 py-2"
          >
            Help Center
          </a>
          <a
            href="/signup"
            onClick={(e) => navigateTo("/signup", e)}
            className="text-sm font-600 font-body bg-primary-500 text-white 
                       px-5 py-2.5 rounded-md hover:bg-primary-dark transition-all 
                       duration-200 shadow-sm hover:shadow-cta"
          >
            Sign Up
          </a>
        </div>
      </nav>
    </header>
  );
}

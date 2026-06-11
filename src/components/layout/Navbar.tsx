import { useState } from "react";

const navItems: string[] = ["Programmes", "About", "Partners", "Community"];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Helper function to handle internal routing updates for your App.tsx listener
  const navigateTo = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, "", path);
    // Dispatch a popstate event so App.tsx immediately picks up the route change
    window.dispatchEvent(new Event("popstate"));
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => navigateTo("/", e)}
          className="font-headline font-800 text-xl tracking-tight text-primary-500"
        >
          SLAN <span className="text-tertiary-500">Online</span>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className="font-body text-sm font-500 text-neutral-700 hover:text-primary-500 
                           transition-colors duration-150 pb-1 border-b-2 border-transparent 
                           hover:border-primary-500"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            onClick={(e) => navigateTo("/login", e)}
            className="text-sm font-500 font-body text-tertiary-500 
                       hover:text-primary-500 transition-colors duration-150 px-3 py-2"
          >
            Login
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

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-tertiary-500 hover:bg-neutral-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-current mb-1 transition-transform duration-200 ${
              menuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current mb-1 transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-transform duration-200 ${
              menuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-500 font-body text-tertiary-500 hover:text-primary-500"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
            <a
              href="/login"
              onClick={(e) => navigateTo("/login", e)}
              className="text-sm font-500 text-center border border-neutral-300 rounded-md py-2.5 text-neutral-700"
            >
              Login
            </a>
            <a
              href="/signup"
              onClick={(e) => navigateTo("/signup", e)}
              className="text-sm font-600 text-center bg-primary-500 text-white rounded-md py-2.5"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

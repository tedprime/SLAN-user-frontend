import { useState } from "react";
import { Menu, X } from "lucide-react";
import { getAccessToken } from "../../services/tokenService";

const navItems: string[] = ["Programmes", "About", "Partners", "Community"];

function hrefFor(item: string): string {
  return item === "Community" ? "/community" : `#${item.toLowerCase()}`;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!getAccessToken();

  const navigateTo = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <a
          href="/"
          onClick={(e) => navigateTo("/", e)}
          className="font-headline font-800 text-xl tracking-tight text-primary-500"
        >
          SLAN <span className="text-tertiary-500">Online</span>
        </a>


        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={hrefFor(item)}
                onClick={item === "Community" ? (e) => navigateTo("/community", e) : undefined}
                className="font-body text-sm font-500 text-neutral-700 hover:text-primary-500 transition-colors duration-150 pb-1 border-b-2 border-transparent hover:border-primary-500"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            
              <a href="/dashboard"
              onClick={(e) => navigateTo("/dashboard", e)}
              className="text-sm font-600 font-body bg-primary-500 text-white px-5 py-2.5 rounded-md hover:bg-primary-dark transition-all duration-200 shadow-sm"
            >
              Go to Dashboard
            </a>
          ) : (
            <>
              <a
                href="/login"
                onClick={(e) => navigateTo("/login", e)}
                className="text-sm font-500 font-body text-tertiary-500 hover:text-primary-500 transition-colors duration-150 px-3 py-2"
              >
                Login
              </a>
              <a
                href="/signup"
                onClick={(e) => navigateTo("/signup", e)}
                className="text-sm font-600 font-body bg-primary-500 text-white px-5 py-2.5 rounded-md hover:bg-primary-dark transition-all duration-200 shadow-sm"
              >
                Sign Up
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-tertiary-500 hover:bg-neutral-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <a
              key={item}
              href={hrefFor(item)}
              className="text-sm font-500 font-body text-tertiary-500 hover:text-primary-500"
              onClick={item === "Community" ? (e) => navigateTo("/community", e) : () => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                onClick={(e) => navigateTo("/dashboard", e)}
                className="text-sm font-600 text-center bg-primary-500 text-white rounded-md py-2.5"
              >
                Go to Dashboard
              </a>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

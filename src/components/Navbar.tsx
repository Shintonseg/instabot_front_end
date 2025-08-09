import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Media" },
  { to: "/unreplied", label: "Unreplied" },
  { to: "/auto-reply", label: "Auto reply" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkBase =
    "px-3 py-2 rounded-full text-sm transition";
  const linkActive =
    "text-white bg-[#0095F6]";
  const linkInactive =
    "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1100px] px-4 h-14 flex items-center gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400" />
          <span className="text-[18px] font-semibold">Insta Tools</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-2 ml-6">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [linkBase, isActive ? linkActive : linkInactive].join(" ")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Placeholder for profile/avatar */}
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
          {/* Mobile menu button */}
          <button
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full border border-gray-200"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="mx-auto max-w-[1100px] px-4 py-2 flex flex-col gap-2">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  [
                    "px-4 py-2 rounded-xl text-sm",
                    isActive ? "bg-[#0095F6] text-white" : "bg-gray-100 text-gray-800",
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

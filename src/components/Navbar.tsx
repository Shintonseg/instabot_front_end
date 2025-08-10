import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Media" },
  { to: "/unreplied", label: "Unreplied" },
  { to: "/auto-reply", label: "Auto reply" },
];

export default function Navbar() {
  const linkBase = "px-3 py-2 rounded-full text-sm transition";
  const linkActive = "text-white bg-[#0095F6]";
  const linkInactive = "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1100px] px-4 h-14 flex items-center gap-3">
        {/* Brand */}
        <Link to="/" className="flex-none flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400" />
          <span className="text-[18px] font-semibold">Insta Tools</span>
        </Link>

        {/* Tabs — always visible; scrollable on small screens */}
        <nav className="flex-1 min-w-0">
          <div className="flex gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar [-webkit-overflow-scrolling:touch] ml-2 snap-x snap-mandatory">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  [
                    "snap-start flex-none",
                    linkBase,
                    isActive ? linkActive : linkInactive,
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex-none h-8 w-8 rounded-full bg-neutral-200" />
      </div>
    </header>
  );
}

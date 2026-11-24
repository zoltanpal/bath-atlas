import { CircleHelp, Database, Mail } from "lucide-react"
import { NavLink } from "react-router-dom"

const links = [
  { to: "/about", label: "About", icon: CircleHelp },
  { to: "/data-sources", label: "Data sources", icon: Database },
  { to: "/contact", label: "Contact", icon: Mail },
]

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t border-white/8 px-4 py-4 sm:px-6 xl:px-8">
      <nav
        aria-label="Footer navigation"
        className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-slate-400 sm:text-sm"
      >
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-md transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none ${
                isActive ? "text-cyan-300" : ""
              }`
            }
            to={to}
          >
            <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />
            {label}
          </NavLink>
        ))}

        <span className="text-slate-600 sm:ml-auto">v1.0.0</span>
      </nav>
    </footer>
  )
}

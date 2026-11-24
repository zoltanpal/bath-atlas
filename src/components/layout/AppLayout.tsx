import { ArrowLeft } from "lucide-react"
import { Link, Outlet } from "react-router-dom"

import { BathAtlasBrand } from "@/components/layout/BathAtlasBrand"
import { DashboardFooter } from "@/components/layout/DashboardFooter"

export default function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#05080c] text-slate-100">
      <header className="border-b border-white/10 bg-[#070b10]">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <BathAtlasBrand compact />
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-400 transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to explorer
          </Link>
        </div>
      </header>

      <main className="w-full flex-1">
        <Outlet />
      </main>

      <DashboardFooter />
    </div>
  )
}

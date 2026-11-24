import { Waves } from "lucide-react"
import { Link } from "react-router-dom"

type BathAtlasBrandProps = {
  compact?: boolean
}

export function BathAtlasBrand({ compact = false }: BathAtlasBrandProps) {
  return (
    <Link
      className="group inline-flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
      to="/"
      aria-label="BathAtlas home"
    >
      <span className="flex size-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/8 text-cyan-300 transition-colors group-hover:border-cyan-300/35 group-hover:text-cyan-200">
        <Waves className="size-7" strokeWidth={1.8} aria-hidden="true" />
      </span>

      <span className="min-w-0">
        <span className="block text-xl font-semibold tracking-tight text-white">
          BathAtlas
        </span>
        {!compact && (
          <span className="block text-xs text-slate-400">
            Explore the world below
          </span>
        )}
      </span>
    </Link>
  )
}

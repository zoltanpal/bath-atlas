import {
  ExternalLink,
  Map,
  MapPin,
  Maximize2,
  Triangle,
  Waves,
} from "lucide-react"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { formatDistance } from "@/lib/geography"
import type { BathymetryData } from "@/types/bathymetry"

type ViewerControlsProps = {
  data: BathymetryData | null
  showContours: boolean
  setShowContours: (checked: boolean) => void
  showWireframe: boolean
  setShowWireframe: (checked: boolean) => void
  showMap: boolean
  setShowMap: (checked: boolean) => void
  mapOpacity: number
  setMapOpacity: (opacity: number) => void
  mapLoading: boolean
  mapError: string | null
  googleMapsUrl: string | null
}

type DetailRowProps = {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-1 border-b border-white/6 py-1.5 last:border-0">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-200">{value}</dd>
    </div>
  )
}

function formatArea(squareMetres: number) {
  const squareKilometres = squareMetres / 1_000_000

  return `${new Intl.NumberFormat("en", {
    maximumFractionDigits: squareKilometres < 100 ? 1 : 0,
  }).format(squareKilometres)} km²`
}

function formatCoordinate(
  value: number,
  positiveDirection: string,
  negativeDirection: string
) {
  const direction = value >= 0 ? positiveDirection : negativeDirection
  return `${Math.abs(value).toFixed(2)}° ${direction}`
}

export function ViewerControls({
  data,
  showContours,
  setShowContours,
  showWireframe,
  setShowWireframe,
  showMap,
  setShowMap,
  mapOpacity,
  setMapOpacity,
  mapLoading,
  mapError,
  googleMapsUrl,
}: ViewerControlsProps) {
  const handleMapOpacityChange = (values: number | readonly number[]) => {
    const nextValue = typeof values === "number" ? values : values[0]

    if (typeof nextValue === "number") {
      setMapOpacity(nextValue / 100)
    }
  }

  const centreLatitude = data
    ? (data.bounds.north + data.bounds.south) / 2
    : null
  const centreLongitude = data
    ? (data.bounds.east + data.bounds.west) / 2
    : null
  const averageResolution = data
    ? (data.widthMetres / Math.max(1, data.width - 1) +
        data.heightMetres / Math.max(1, data.height - 1)) /
      2
    : null

  return (
    <div className="space-y-5 px-5 py-5 sm:px-5">
      <section className="space-y-4">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white mb-2">
          <Waves className="size-5 text-cyan-300" strokeWidth={1.7} />
          Layers
        </h2>

        <label className="flex items-center justify-between text-sm text-slate-200 mb-2">
          <span className="flex items-center gap-3">
            <Waves className="size-4 text-slate-400" strokeWidth={1.7} />
            <span>
              Elevation contours
              <span className="block text-xs text-slate-500 mb-0 mt-0">
                50 m lines · 100 m labels
              </span>
            </span>
          </span>
          <Switch checked={showContours} onCheckedChange={setShowContours} />
        </label>

        <label className="flex items-center justify-between text-sm text-slate-200 mb-3">
          <span className="flex items-center gap-3">
            <Triangle className="size-4 text-slate-400" strokeWidth={1.7} />
            <span>Triangle wireframe</span>
          </span>
          <Switch checked={showWireframe} onCheckedChange={setShowWireframe} />
        </label>

        <label className="flex items-center justify-between text-sm text-slate-200">
          <span className="flex items-center gap-3">
            <Map className="size-4 text-slate-400" strokeWidth={1.7} />
            <span>OpenStreetMap</span>
          </span>
          <Switch checked={showMap} onCheckedChange={setShowMap} />
        </label>

        {showMap && (
          <div className="space-y-2 rounded-xl border border-white/7 bg-white/[0.025] p-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Map opacity</span>
              <span>{Math.round(mapOpacity * 100)}%</span>
            </div>
            <Slider
              aria-label="Map opacity"
              min={0}
              max={100}
              step={1}
              value={[Math.round(mapOpacity * 100)]}
              onValueChange={handleMapOpacityChange}
            />
            {mapLoading && (
              <p className="text-xs text-cyan-300">Loading map…</p>
            )}
            {mapError && <p className="text-xs text-amber-300">{mapError}</p>}
            <p className="text-[11px] text-slate-500">
              © OpenStreetMap contributors
            </p>
          </div>
        )}
      </section>

      {data ? (
        <>
          <section className="border-t border-white/10 pt-2 text-sm">
            <h2 className="mb-2 flex items-center gap-2.5 text-lg font-semibold text-white mb-2">
              <Maximize2 className="size-5 text-cyan-300" strokeWidth={1.7} />
              Area
            </h2>
            <dl className="space-y-0">
              <DetailRow
                label="Extent (W × H)"
                value={`${formatDistance(data.widthMetres)} × ${formatDistance(data.heightMetres)}`}
              />
              <DetailRow
                label="Area"
                value={formatArea(data.widthMetres * data.heightMetres)}
              />
              <DetailRow
                label="Resolution"
                value={formatDistance(averageResolution ?? 0)}
              />
            </dl>
          </section>

          <section className="border-t border-white/10 pt-2 text-sm">
            <h2 className="mb-2 flex items-center gap-2.5 text-lg font-semibold text-white">
              <MapPin className="size-5 text-cyan-300" strokeWidth={1.7} />
              Coordinates
            </h2>
            <dl>
              <DetailRow
                label="Center"
                value={`${formatCoordinate(centreLatitude ?? 0, "N", "S")}, ${formatCoordinate(centreLongitude ?? 0, "E", "W")}`}
              />
              <DetailRow
                label="Latitude range"
                value={`${formatCoordinate(data.bounds.south, "N", "S")} – ${formatCoordinate(data.bounds.north, "N", "S")}`}
              />
              <DetailRow
                label="Longitude range"
                value={`${formatCoordinate(data.bounds.west, "E", "W")} – ${formatCoordinate(data.bounds.east, "E", "W")}`}
              />
            </dl>

            {googleMapsUrl && (
              <a
                className="mt-3 inline-flex items-center gap-1.5 rounded-md font-medium text-cyan-300 transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open centre in Google Maps
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </section>
        </>
      ) : (
        <div className="border-t border-white/10 pt-2 text-sm text-slate-500">
          Area and coordinate details appear when the dataset is ready.
        </div>
      )}
    </div>
  )
}

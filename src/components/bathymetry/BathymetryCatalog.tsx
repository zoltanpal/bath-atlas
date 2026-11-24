import { useEffect, useMemo, useState } from "react"

import { BathymetryViewer } from "@/components/bathymetry/BathymetryViewer"
import { useDatasets } from "@/hooks/useDatasets"

type BathymetryCatalogProps = {
  endpoint?: string
}

export function BathymetryCatalog({
  endpoint = "/datasets",
}: BathymetryCatalogProps) {
  const { datasets, loading, error, reload } = useDatasets(endpoint)
  const [selectedSlug, setSelectedSlug] = useState("")

  useEffect(() => {
    if (!selectedSlug && datasets.length > 0) {
      setSelectedSlug(datasets[0].slug)
    }
  }, [datasets, selectedSlug])

  const selectedDataset = useMemo(
    () =>
      datasets.find((dataset) => dataset.slug === selectedSlug) ??
      datasets[0] ??
      null,
    [datasets, selectedSlug]
  )

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080c] p-6 text-slate-100">
        <div className="w-full max-w-lg rounded-2xl border border-red-900/70 bg-[#0a0e14] p-7 text-center shadow-2xl shadow-black/30">
          <p className="font-medium text-red-300">{error}</p>
          <button
            className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-slate-800 hover:text-cyan-200"
            type="button"
            onClick={reload}
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (loading || !selectedDataset) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05080c] text-slate-100">
        <div
          className="flex flex-col items-center gap-4"
          role="status"
          aria-live="polite"
        >
          <div className="size-11 animate-spin rounded-full border-4 border-slate-800 border-t-cyan-400" />
          <p className="text-sm text-slate-400">
            {loading
              ? "Loading datasets…"
              : "No published datasets are available yet."}
          </p>
        </div>
      </main>
    )
  }

  return (
    <BathymetryViewer
      src={selectedDataset.raster_path}
      title={selectedDataset.name}
      description={selectedDataset.description}
      datasets={datasets}
      selectedSlug={selectedDataset.slug}
      onDatasetChange={setSelectedSlug}
    />
  )
}

export default BathymetryCatalog

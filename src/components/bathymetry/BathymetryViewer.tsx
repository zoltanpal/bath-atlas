import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { SlidersHorizontal } from "lucide-react"

import { BathymetryScene } from "@/components/bathymetry/BathymetryScene"
import { CanvasErrorBoundary } from "@/components/bathymetry/CanvasErrorBoundary"
import { DatasetSelect } from "@/components/bathymetry/DatasetSelect"
import { ViewerControls } from "@/components/bathymetry/ViewerControls"
import { BathAtlasBrand } from "@/components/layout/BathAtlasBrand"
import { DashboardFooter } from "@/components/layout/DashboardFooter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useBathymetry } from "@/hooks/useBathymetry"
import { useOsmTexture } from "@/hooks/useOsmTexture"
import { useViewerSettings } from "@/hooks/useViewerSettings"
import { createGoogleMapsUrl } from "@/lib/geography"
import { createTerrainLayout } from "@/lib/terrain"
import type { BathymetryDataset } from "@/types/bathymetry"

type BathymetryViewerProps = {
  src: string
  title: string
  description: string | null
  datasets: BathymetryDataset[]
  selectedSlug: string
  onDatasetChange: (slug: string) => void
}

function BathymetryLoading() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4 text-slate-300"
      role="status"
      aria-live="polite"
    >
      <div
        className="size-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400"
        aria-hidden="true"
      />
      <div className="text-center">
        <p className="font-medium">Loading bathymetry…</p>
        <p className="mt-1 text-xs text-slate-500">
          Large datasets may take a moment
        </p>
      </div>
    </div>
  )
}

export function BathymetryViewer({
  src,
  title,
  description,
  datasets,
  selectedSlug,
  onDatasetChange,
}: BathymetryViewerProps) {
  const { data, loading, error } = useBathymetry(src)
  const settings = useViewerSettings()

  const layout = useMemo(
    () => (data ? createTerrainLayout(data) : null),
    [data]
  )

  const osm = useOsmTexture(data?.bounds ?? null, settings.showMap)
  const googleMapsUrl = data ? createGoogleMapsUrl(data.bounds) : null

  const viewerControls = (
    <ViewerControls
      data={data}
      showContours={settings.showContours}
      setShowContours={settings.setShowContours}
      showWireframe={settings.showWireframe}
      setShowWireframe={settings.setShowWireframe}
      showMap={settings.showMap}
      setShowMap={settings.setShowMap}
      mapOpacity={settings.mapOpacity}
      setMapOpacity={settings.setMapOpacity}
      mapLoading={osm.loading}
      mapError={osm.error}
      googleMapsUrl={googleMapsUrl}
    />
  )

  return (
    <div className="min-h-screen bg-[#05080c] text-slate-100 lg:grid lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-white/10 bg-[#070b10] lg:flex">
        <div className="px-6 py-6">
          <BathAtlasBrand />
        </div>
        <Separator className="bg-white/10" />
        <div className="min-h-0 flex-1 overflow-y-auto">{viewerControls}</div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="px-4 pt-4 sm:px-6 sm:pt-6 xl:px-8">
          <div className="mb-7 flex items-center justify-between gap-4 lg:hidden">
            <BathAtlasBrand compact />

            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    className="border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
                    variant="outline"
                    size="lg"
                  />
                }
              >
                <SlidersHorizontal aria-hidden="true" />
                Controls
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[min(92vw,360px)] gap-0 border-slate-800 bg-[#070b10] p-0 text-slate-100"
              >
                <SheetHeader className="border-b border-white/10 px-6 py-5 pr-14">
                  <SheetTitle className="text-slate-100">
                    Viewer controls
                  </SheetTitle>
                  <SheetDescription className="text-slate-400">
                    Layers and dataset details
                  </SheetDescription>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {viewerControls}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.22em] text-cyan-300 uppercase sm:text-sm">
                Interactive bathymetry
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-5xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                {description ??
                  "Explore high-resolution bathymetry and terrain data in an interactive 3D view."}
              </p>
              <p className="mt-1.5 text-xs text-slate-600">
                Left drag rotates · right drag pans · wheel zooms to the cursor
              </p>
            </div>

            <DatasetSelect
              datasets={datasets}
              value={selectedSlug}
              onChange={onDatasetChange}
            />
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
          <Card className="gap-0 overflow-hidden rounded-2xl bg-[#07101a] py-0 shadow-2xl ring-1 shadow-black/20 ring-white/15">
            <CardContent className="h-[62dvh] min-h-[440px] p-0 lg:h-[calc(100dvh-17.75rem)] lg:min-h-[520px]">
              {error ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-red-300">
                  {error}
                </div>
              ) : loading || !data || !layout ? (
                <BathymetryLoading />
              ) : (
                <CanvasErrorBoundary resetKey={src}>
                  <Canvas
                    camera={{
                      position: [8, 6.5, 11],
                      fov: 42,
                      near: 0.01,
                      far: 100,
                    }}
                    gl={{ antialias: true }}
                  >
                    <Suspense fallback={null}>
                      <BathymetryScene
                        data={data}
                        layout={layout}
                        showContours={settings.showContours}
                        showWireframe={settings.showWireframe}
                        mapTexture={settings.showMap ? osm.texture : null}
                        mapOpacity={settings.mapOpacity}
                      />
                    </Suspense>
                  </Canvas>
                </CanvasErrorBoundary>
              )}
            </CardContent>
          </Card>
        </main>

        <DashboardFooter />
      </div>
    </div>
  )
}

export default BathymetryViewer

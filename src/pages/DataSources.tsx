import { ExternalLink } from "lucide-react"

export default function DataSources() {
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-8 sm:py-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Data and attribution
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Data sources
        </h1>
        <p className="text-lg leading-8 text-slate-400">
          BathAtlas visualizes publicly available bathymetric and elevation data.
        </p>
      </header>

      <div className="space-y-8 text-sm leading-7 text-slate-300 sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Bathymetry datasets</h2>
          <p>
            The datasets currently used by this project come from the National
            Oceanic and Atmospheric Administration (NOAA), including resources
            provided by its National Centers for Environmental Information (NCEI).
          </p>
          <a
            href="https://www.ncei.noaa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-cyan-300 hover:text-cyan-200"
          >
            NOAA National Centers for Environmental Information
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Visualization notes</h2>
          <p>
            Source elevation grids are prepared for browser rendering and
            displayed as 3D terrain. The viewer applies automatic vertical
            exaggeration, so slopes and depth differences may appear more
            pronounced than they are in reality. BathAtlas is for exploration,
            not for navigation or safety-critical decisions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Map overlay</h2>
          <p>
            The optional map overlay uses OpenStreetMap data. Map content is
            separate from the elevation models.
          </p>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-cyan-300 hover:text-cyan-200"
          >
            © OpenStreetMap contributors
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </section>
      </div>
    </article>
  )
}

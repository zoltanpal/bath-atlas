import { Link } from "react-router-dom"

export default function About() {
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-8 sm:py-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          The project
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          About BathAtlas
        </h1>
        <p className="text-lg leading-8 text-slate-400">
          Explore the world below the water’s surface through interactive
          three-dimensional terrain.
        </p>
      </header>

      <div className="space-y-8 text-sm leading-7 text-slate-300 sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">What is BathAtlas?</h2>
          <p>
            BathAtlas is a web-based bathymetry viewer. It turns elevation and
            depth measurements into interactive 3D terrain so you can explore
            underwater landscapes, from bays to deep-ocean trenches.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Explore the terrain</h2>
          <p>
            Rotate, pan, and zoom the terrain directly in your browser. Optional
            contour lines, a triangle wireframe, and an OpenStreetMap overlay
            help you understand the shape and geographic context of each area.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">How it works</h2>
          <p>
            The viewer renders gridded elevation data as a terrain mesh.
            Vertical exaggeration is applied automatically to make underwater
            features easier to see. This makes the visualization useful for
            exploration, but the apparent steepness should not be interpreted
            as a true-to-scale depiction of the seabed.
          </p>
        </section>
      </div>

      <Link
        to="/"
        className="inline-flex rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-400/15 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
      >
        Open the explorer
      </Link>
    </article>
  )
}

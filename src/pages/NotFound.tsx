import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-5 px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-sm font-semibold tracking-[0.22em] text-cyan-300">
        404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Page not found
      </h1>
      <p className="text-slate-400">
        The page you requested doesn’t exist or may have moved.
      </p>
      <Link
        to="/"
        className="inline-flex rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-400/15 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
      >
        Back to explorer
      </Link>
    </section>
  )
}

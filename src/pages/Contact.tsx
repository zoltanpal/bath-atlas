
import { Mail, ExternalLink } from "lucide-react"
import { IconBrandLinkedin } from "@tabler/icons-react"

const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL ?? "").trim()
const linkedInUrl = (import.meta.env.VITE_CONTACT_LINKEDIN_URL ?? "").trim()

export default function Contact() {
  return (
    <article className="mx-auto max-w-3xl space-y-5 px-5 py-6 sm:px-8 sm:py-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Get in touch
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Contact
        </h1>
        <p className="text-lg leading-8 text-slate-400">
          Questions, feedback, and suggestions about BathAtlas are welcome.
        </p>
      </header>

      <div className="space-y-4">
        {linkedInUrl && (
          <section className="rounded-2xl border border-white/10 bg-[#07101a] p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <IconBrandLinkedin className="size-5 text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">
                LinkedIn
              </h2>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Have a question, suggestion, or feedback about BathAtlas?
              Feel free to connect with me on LinkedIn.
            </p>

            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              Connect on LinkedIn
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </section>
        )}

        {contactEmail && (
          <section className="rounded-2xl border border-white/10 bg-[#07101a] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-cyan-300" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-white">
                Email
              </h2>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              Prefer email? You can also contact me directly.
            </p>

            <a
              href={`mailto:${contactEmail}`}
              className="mt-5 inline-flex rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              {contactEmail}
            </a>
          </section>
        )}
      </div>
    </article>
  )
}

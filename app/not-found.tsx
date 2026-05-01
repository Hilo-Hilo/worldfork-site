import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — branch not found",
  description:
    "This timeline does not exist. Return to the multiverse root or open the WorldFork repository.",
  robots: { index: false, follow: false },
};

const GITHUB_URL = "https://github.com/Hilo-Hilo/WorldFork";
const DOCS_URL = "https://worldfork.readthedocs.io/en/latest/";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-ink-900 text-bone-100 grid place-items-center px-6 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bp-grid-fine opacity-50"
      />
      <div className="relative max-w-xl text-center">
        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-cool">
          status · 404
        </div>
        <h1 className="mt-4 text-5xl md:text-6xl font-medium tracking-[-0.035em] text-bone-100 text-balance">
          Branch not found.
        </h1>
        <p className="mt-5 text-bone-300 text-[15px] leading-relaxed text-pretty">
          This timeline was pruned, never forked, or simply does not exist
          in this multiverse. Pick a known root.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center font-mono text-[12px]">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cool text-ink-950 hover:bg-cool-soft transition-colors"
          >
            ← back to root
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border hairline-strong text-bone-200 hover:bg-white/[0.03] transition-colors"
          >
            open GitHub ↗
          </a>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border hairline text-bone-300 hover:text-bone-100 transition-colors"
          >
            read the docs ↗
          </a>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";

const GITHUB_URL = "https://github.com/Hilo-Hilo/WorldFork";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof console !== "undefined") {
      console.error("[worldfork-site] runtime error:", error);
    }
  }, [error]);

  return (
    <main
      id="main"
      className="min-h-[100dvh] bg-ink-900 text-bone-100 grid place-items-center px-6 relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bp-grid-fine opacity-50"
      />
      <div className="relative max-w-xl text-center">
        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-cool">
          status · runtime error
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-medium tracking-[-0.03em] text-bone-100 text-balance">
          A timeline collapsed.
        </h1>
        <p className="mt-5 text-bone-300 text-[15px] leading-relaxed text-pretty">
          Something went wrong rendering this page. Try reloading the timeline,
          or open an issue if it keeps happening.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-bone-500">
            digest · {error.digest}
          </p>
        )}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center font-mono text-[12px]">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cool text-ink-950 hover:bg-cool-soft transition-colors"
          >
            ↻ retry
          </button>
          <a
            href={`${GITHUB_URL}/issues/new`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border hairline-strong text-bone-200 hover:bg-white/[0.03] transition-colors"
          >
            report on GitHub ↗
          </a>
        </div>
      </div>
    </main>
  );
}

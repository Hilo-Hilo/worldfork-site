"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const GITHUB_URL = "https://github.com/Hilo-Hilo/WorldFork";
const DOCS_URL = "https://worldfork.readthedocs.io/en/latest/";
const DEEPWIKI_URL = "https://deepwiki.com/Hilo-Hilo/WorldFork";
const SETUP_DOCS_URL =
  "https://worldfork.readthedocs.io/en/latest/setup.html";
const CLI_DOCS_URL = "https://worldfork.readthedocs.io/en/latest/cli.html";
const ARCH_DOCS_URL =
  "https://worldfork.readthedocs.io/en/latest/architecture.html";
const AGENT_INSTALL_PROMPT = `Run this command to install the WorldFork setup skill, then use it to set up WorldFork:

npx skills add Hilo-Hilo/WorldFork/skills/worldfork-setup --all`;

type TreeNode = {
  id: string;
  x: number;
  y: number;
  depth: number;
  parent: TreeNode | null;
  branchProb: number;
};

type TreeEdge = { from: TreeNode; to: TreeNode };

type Tree = { nodes: TreeNode[]; edges: TreeEdge[] };

/* ─────────── small atoms ─────────── */

function Section({
  id,
  label,
  title,
  children,
  className = "",
}: {
  id?: string;
  label?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative border-t hairline ${className}`}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pb-16 md:pb-24">
        {(label || title) && (
          <div className="pt-10 md:pt-16 pb-6 md:pb-10 grid md:grid-cols-12 gap-6">
            {label && (
              <div className="md:col-span-3">
                <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-400">
                  {label}
                </div>
              </div>
            )}
            {title && (
              <h2 className="md:col-span-9 text-3xl md:text-[44px] leading-[1.05] font-medium tracking-[-0.025em] text-bone-100 max-w-3xl text-balance">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Mono({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.14em] uppercase text-bone-400 ${className}`}
    >
      {children}
    </span>
  );
}

function Btn({
  children,
  primary,
  href = "#",
  onClick,
  className = "",
  small,
  external,
}: {
  children: ReactNode;
  primary?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  small?: boolean;
  external?: boolean;
}) {
  const base = small ? "px-3 py-1.5 text-[12px]" : "px-4 py-2.5 text-[13px]";
  const externalProps = external
    ? { target: "_blank", rel: "noreferrer noopener" }
    : {};
  if (primary) {
    return (
      <a
        href={href}
        onClick={onClick}
        {...externalProps}
        className={`${base} ${className} inline-flex items-center gap-2 font-mono tracking-wide bg-cool text-ink-950 hover:bg-cool-soft active:scale-[0.98] transition-all duration-150 border border-cool`}
      >
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      onClick={onClick}
      {...externalProps}
      className={`${base} ${className} inline-flex items-center gap-2 font-mono tracking-wide text-bone-100 border border-bone-100/15 hover:border-bone-100/40 hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-150`}
    >
      {children}
    </a>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`w-3 h-3 ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 0v12 M0 6h12" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function CornerMarks() {
  return (
    <>
      <Cross className="absolute -top-1.5 -left-1.5 text-bone-400/60" />
      <Cross className="absolute -top-1.5 -right-1.5 text-bone-400/60" />
      <Cross className="absolute -bottom-1.5 -left-1.5 text-bone-400/60" />
      <Cross className="absolute -bottom-1.5 -right-1.5 text-bone-400/60" />
    </>
  );
}

function Wordmark() {
  return (
    <div className="flex items-baseline gap-1.5">
      <svg
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px] text-bone-100"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 22 V14 M12 14 L6 8 M12 14 L18 8 M6 8 V3 M18 8 V3 M12 14 H12"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="square"
        />
        <circle cx="6" cy="3" r="1.4" fill="#4A9EFF" />
        <circle cx="18" cy="3" r="1.4" fill="currentColor" opacity="0.4" />
      </svg>
      <span className="font-mono text-[15px] font-medium tracking-tight text-bone-100">
        worldfork
      </span>
      <span className="font-mono text-[11px] text-bone-400">/oss</span>
    </div>
  );
}

/* ─────────── shared: theme toggle (auto / dark / light) ─────────── */

type ThemePref = "auto" | "dark" | "light";

function resolveTheme(p: ThemePref): "dark" | "light" {
  if (p === "auto") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return p;
}

function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>("auto");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setPref(stored);
      } else {
        setPref("auto");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", resolveTheme(pref));
    try {
      if (pref === "auto") localStorage.removeItem("theme");
      else localStorage.setItem("theme", pref);
    } catch {
      // ignore
    }
    if (pref === "auto") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () =>
        document.documentElement.setAttribute(
          "data-theme",
          resolveTheme("auto")
        );
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, [pref, mounted]);

  const select = (next: ThemePref, e: React.MouseEvent<HTMLButtonElement>) => {
    if (next === pref) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    const willMatchCurrent = resolveTheme(next) === resolveTheme(pref);

    if (!doc.startViewTransition || reduced || willMatchCurrent) {
      setPref(next);
      return;
    }

    // anchor the circular reveal at the clicked button's center
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      // synchronously update the DOM so the view-transition snapshot
      // captures the new theme immediately, then let React catch up
      document.documentElement.setAttribute(
        "data-theme",
        resolveTheme(next)
      );
      setPref(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const opts: { v: ThemePref; label: string }[] = [
    { v: "auto", label: "auto" },
    { v: "dark", label: "dark" },
    { v: "light", label: "light" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="hidden md:inline-flex items-center border hairline-strong rounded-none divide-x divide-[var(--hairline-color)] font-mono text-[10px] tracking-[0.14em] uppercase"
    >
      {opts.map((o) => {
        const active = pref === o.v;
        return (
          <button
            key={o.v}
            role="radio"
            aria-checked={active}
            onClick={(e) => select(o.v, e)}
            className={`px-2.5 py-1 transition-colors ${
              active
                ? "text-bone-100 bg-cool/10"
                : "text-bone-400 hover:text-bone-100"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────── shared: agent-prompt copy card ─────────── */

function SetupPromptCard({
  prompt,
  variant = "hero",
}: {
  prompt: string;
  variant?: "hero" | "section";
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div
      className={`relative border bg-ink-950 ${
        variant === "hero"
          ? "border-cool/60 shadow-cool"
          : "border-cool/40"
      }`}
    >
      <div className="absolute -top-2 left-4 px-2 bg-ink-900">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-cool">
          ▸ paste into your agent
        </span>
      </div>
      <CornerMarks />
      <div className="p-5 md:p-6">
        <pre className="font-mono text-[12.5px] md:text-[13.5px] leading-[1.7] text-bone-100 whitespace-pre-wrap break-words">
          <span className="text-bone-400">{`# `}</span>
          <span>{prompt.split("\n\n")[0]}</span>
          {"\n\n"}
          <span className="text-cool">{prompt.split("\n\n")[1]}</span>
        </pre>
      </div>
      <button
        onClick={copy}
        className={`w-full px-5 py-3.5 border-t border-cool/40 font-mono text-[12px] uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2.5 transition-colors ${
          copied
            ? "bg-cool text-ink-950"
            : "bg-cool/10 text-cool hover:bg-cool hover:text-ink-950"
        }`}
        aria-label="Copy setup prompt to clipboard"
        aria-live="polite"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 12 12" className="w-3 h-3">
              <path
                d="M2 6l3 3 5-6"
                stroke="currentColor"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>copied — paste into your agent</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 12 12" className="w-3 h-3">
              <rect
                x="2"
                y="3"
                width="6"
                height="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
              <rect
                x="4"
                y="1.5"
                width="6"
                height="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
            <span>copy setup prompt</span>
            <span className="text-cool/60">↗</span>
          </>
        )}
      </button>
    </div>
  );
}

/* ─────────── 1. NAV ─────────── */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        scrolled
          ? "bg-ink-900/85 backdrop-blur border-b hairline"
          : "border-b border-transparent"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 group">
          <Wordmark />
        </a>
        <nav className="hidden md:flex items-center gap-7 font-mono text-[12px] text-bone-300">
          <a href="#concept" className="hover:text-bone-100 transition-colors">
            Fork
          </a>
          <a href="#runtime" className="hover:text-bone-100 transition-colors">
            Runtime
          </a>
          <a href="#cli" className="hover:text-bone-100 transition-colors">
            CLI
          </a>
          <a href="#showcase" className="hover:text-bone-100 transition-colors">
            Example
          </a>
          <a href="#faq" className="hover:text-bone-100 transition-colors">
            FAQ
          </a>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-bone-100 transition-colors"
          >
            Docs
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:text-bone-100 transition-colors inline-flex items-center gap-1.5"
          >
            GitHub
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" aria-hidden="true" focusable="false">
              <path
                d="M2 8l6-6M3 2h5v5"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="https://devpost.com/software/worldfork-tech"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 border hairline-strong hover:border-cool/60 hover:bg-cool/[0.06] transition-colors"
          >
            <span className="w-1.5 h-1.5 bg-cool"></span>
            <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone-200">
              HackTech &apos;26 · 1st
            </span>
            <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-bone-400" aria-hidden="true" focusable="false">
              <path
                d="M2 8l6-6M3 2h5v5"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </a>
          <ThemeToggle />
          <Btn primary small href={GITHUB_URL} external>
            Open GitHub →
          </Btn>
        </div>
      </div>
    </header>
  );
}

/* ─────────── 2. HERO TREE ─────────── */

function buildTree(seed = 7): Tree {
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s & 0xfffffff) / 0xfffffff;
  };

  const root: TreeNode = {
    id: "r",
    x: 60,
    y: 260,
    depth: 0,
    parent: null,
    branchProb: 0.85,
  };
  const nodes: TreeNode[] = [root];
  const edges: TreeEdge[] = [];
  const COLS = [60, 200, 360, 520, 660, 790];

  const grow = (parent: TreeNode) => {
    if (parent.depth >= 5) return;
    const branches =
      parent.depth === 0 ? 2 : rnd() < (parent.branchProb || 0.55) ? 2 : 1;
    const baseY = parent.y;
    const spread = [180, 110, 70, 44, 28][parent.depth] || 20;
    for (let i = 0; i < branches; i++) {
      const sign =
        branches === 1 ? (rnd() < 0.5 ? -1 : 1) : i === 0 ? -1 : 1;
      const wobble = (rnd() - 0.5) * 14;
      const child: TreeNode = {
        id: parent.id + "." + i,
        x: COLS[parent.depth + 1] + (rnd() - 0.5) * 30,
        y: Math.max(
          30,
          Math.min(
            490,
            baseY + sign * spread * (0.55 + rnd() * 0.5) + wobble
          )
        ),
        depth: parent.depth + 1,
        parent,
        branchProb: (parent.branchProb || 0.55) * 0.78,
      };
      nodes.push(child);
      edges.push({ from: parent, to: child });
      grow(child);
    }
  };
  grow(root);
  return { nodes, edges };
}

function HeroTree() {
  const { nodes, edges } = useMemo(() => buildTree(11), []);

  const auditedIds = useMemo(
    () =>
      new Set(
        nodes
          .filter((n) => n.depth === 4)
          .slice(2, 5)
          .map((n) => n.id)
      ),
    [nodes]
  );
  const prunedIds = useMemo(
    () =>
      new Set(
        nodes
          .filter((n) => n.depth >= 3 && Math.abs(n.y - 260) > 170)
          .slice(0, 3)
          .map((n) => n.id)
      ),
    [nodes]
  );

  const pathFor = (e: TreeEdge) => {
    const dx = e.to.x - e.from.x;
    const c1x = e.from.x + dx * 0.5;
    const c2x = e.to.x - dx * 0.4;
    return `M ${e.from.x} ${e.from.y} C ${c1x} ${e.from.y}, ${c2x} ${e.to.y}, ${e.to.x} ${e.to.y}`;
  };

  const tickColumns = [60, 200, 360, 520, 660, 790];
  const tickLabels = ["t=0", "t=1", "t=2", "t=3", "t=4", "t=5"];

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {tickColumns.map((cx, i) => (
          <div
            key={i}
            className="absolute -top-1"
            style={{ left: `${(cx / 880) * 100}%` }}
          >
            <div className="-translate-x-1/2 text-center">
              <div className="font-mono text-[10px] text-bone-400 tracking-[0.14em]">
                {tickLabels[i]}
              </div>
            </div>
          </div>
        ))}
      </div>

      <svg
        viewBox="0 0 880 520"
        className="w-full h-full overflow-visible"
        role="img"
        aria-labelledby="hero-tree-title hero-tree-desc"
      >
        <title id="hero-tree-title">WorldFork multiverse tree</title>
        <desc id="hero-tree-desc">
          Diagram of a Big Bang scenario branching into multiple timelines
          across six ticks. Active timelines are blue, audited timelines are
          marked with a square outline, and pruned timelines are dashed and
          muted.
        </desc>
        <defs>
          <pattern
            id="bp"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M32 0H0V32"
              fill="none"
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4A9EFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#4A9EFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="880" height="520" fill="url(#bp)" />

        {tickColumns.map((cx, i) => (
          <line
            key={i}
            x1={cx}
            y1="20"
            x2={cx}
            y2="500"
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="2 4"
          />
        ))}

        {edges.map((e, i) => {
          const isPruned = prunedIds.has(e.to.id);
          const len = 600;
          const delay = e.from.depth * 0.18 + (i % 6) * 0.04;
          return (
            <path
              key={i}
              d={pathFor(e)}
              fill="none"
              stroke={
                isPruned
                  ? "rgba(232,233,236,0.18)"
                  : e.to.depth <= 1
                  ? "#4A9EFF"
                  : "rgba(124,184,255,0.55)"
              }
              strokeWidth={Math.max(0.6, 2.2 - e.from.depth * 0.35)}
              strokeLinecap="round"
              strokeDasharray={isPruned ? "3 4" : undefined}
              className="path-draw"
              style={
                {
                  "--len": len,
                  animationDelay: `${delay}s`,
                } as React.CSSProperties
              }
            />
          );
        })}

        <circle cx={nodes[0].x} cy={nodes[0].y} r="36" fill="url(#rootGlow)" />

        {nodes.map((n) => {
          const isRoot = n.depth === 0;
          const isLeaf = !edges.some((e) => e.from === n);
          const isAudited = auditedIds.has(n.id);
          const isPruned = prunedIds.has(n.id);
          const r = isRoot ? 6 : isLeaf ? 3 : 2.4;
          const fill = isRoot
            ? "#4A9EFF"
            : isPruned
            ? "#363C46"
            : isAudited
            ? "#E8E9EC"
            : n.depth <= 1
            ? "#4A9EFF"
            : "#7CB8FF";
          return (
            <g
              key={n.id}
              className="node-pop"
              style={{ animationDelay: `${0.2 + n.depth * 0.18}s` }}
            >
              {isRoot && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="4"
                  fill="none"
                  stroke="#4A9EFF"
                  strokeWidth="1.2"
                  className="pulse-ring"
                />
              )}
              {isAudited && (
                <rect
                  x={n.x - 6}
                  y={n.y - 6}
                  width="12"
                  height="12"
                  fill="none"
                  stroke="#E8E9EC"
                  strokeWidth="0.6"
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={fill}
                stroke={isRoot ? "#0A0B0D" : "none"}
                strokeWidth="1"
              />
            </g>
          );
        })}

        <g className="svg-mobile-hide">
          <line
            x1="60"
            y1="305"
            x2="60"
            y2="335"
            stroke="#4A9EFF"
            strokeWidth="0.8"
          />
          <text
            x="60"
            y="350"
            fontSize="10"
            fill="#4A9EFF"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
            letterSpacing="1.5"
          >
            BIG&nbsp;BANG
          </text>
        </g>

        <g
          className="svg-mobile-hide"
          fontFamily="JetBrains Mono, monospace"
          fontSize="10"
          fill="#6B7079"
        >
          <text x="14" y="510">
            nodes {nodes.length} · branches {edges.length} · audited{" "}
            {auditedIds.size} · pruned {prunedIds.size}
          </text>
        </g>
      </svg>
    </div>
  );
}

/* ─────────── 3. HERO BLOCK ─────────── */

function Hero() {
  return (
    <section id="top" className="relative">
      <div className="absolute inset-0 bp-grid opacity-60 pointer-events-none" />
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-16 md:pb-24 relative">
        <div className="flex items-center justify-between border-b hairline pb-3 mb-10 md:mb-14 font-mono text-[11px] text-bone-400">
          <div className="flex items-center gap-4">
            <span>§01 / hero</span>
            <span className="hidden sm:inline">scenario.yaml</span>
            <span className="hidden md:inline text-bone-500">// example</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">runtime: ready</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cool"></span>online
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-5 lg:col-span-5">
            <Mono>§01 — agent-operated branching social simulation</Mono>
            <h1 className="mt-6 text-[56px] md:text-[80px] lg:text-[96px] leading-[0.92] font-medium tracking-[-0.035em] text-bone-100 text-balance">
              Fork the
              <br />
              <span className="relative inline-block">
                world.
                <span className="absolute -right-3 top-1 w-2 h-[78%] bg-cool blink"></span>
              </span>
            </h1>
            <p className="mt-5 text-[18px] md:text-[20px] leading-snug text-bone-100 max-w-md font-medium tracking-[-0.015em] text-balance">
              One scenario. Many timelines. Audited.
            </p>
            <p className="mt-4 text-[14.5px] md:text-[15px] leading-relaxed text-bone-300 max-w-md text-pretty">
              Backend infrastructure for branching social simulations — agents
              tick it forward, fork on consequential decisions, audit each
              timeline, read the structured report.
            </p>

            {/* social proof strip */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10.5px] tracking-[0.12em] uppercase text-bone-400">
              <a
                href="https://devpost.com/software/worldfork-tech"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 hover:text-bone-100"
              >
                <span className="w-1.5 h-1.5 bg-cool"></span>
                HackTech &apos;26 · 1st place
              </a>
              <span className="text-bone-500">·</span>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-bone-100"
              >
                Open source on GitHub
              </a>
              <span className="text-bone-500">·</span>
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-bone-100"
              >
                Read the docs
              </a>
            </div>

            {/* primary action — agent-paste setup prompt */}
            <div className="mt-6 max-w-xl">
              <SetupPromptCard prompt={AGENT_INSTALL_PROMPT} />
              <div className="mt-3 font-mono text-[11px] text-bone-500">
                or{" "}
                <a
                  href={DEEPWIKI_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-bone-300 hover:text-bone-100 underline-offset-4 hover:underline"
                >
                  explore on DeepWiki
                </a>
              </div>
            </div>

          </div>

          <div className="md:col-span-7 lg:col-span-7">
            <div className="relative border hairline bg-ink-950 diagram-breathe">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-8 -z-10 aurora-breathe"
                style={{
                  background:
                    "radial-gradient(60% 60% at 30% 50%, rgba(74,158,255,0.22), transparent 70%), radial-gradient(40% 50% at 80% 60%, rgba(124,184,255,0.12), transparent 75%)",
                  filter: "blur(40px)",
                }}
              />
              <CornerMarks />
              <div className="flex items-center justify-between px-4 py-2.5 border-b hairline font-mono text-[10.5px] text-bone-400">
                <div className="flex items-center gap-4">
                  <span>fig.01</span>
                  <span>multiverse / example</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline">seed=11 · depth=5</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-cool"></span>live
                  </span>
                </div>
              </div>
              <div className="aspect-[880/520] p-4 md:p-6 relative bp-grid-fine">
                <HeroTree />
              </div>
              <div className="border-t hairline px-4 py-2.5 flex items-center justify-between font-mono text-[10.5px] text-bone-400">
                <div className="flex items-center gap-5">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cool"></span>active
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 border border-bone-100"></span>
                    audited
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-bone-500"></span>pruned
                  </span>
                </div>
                <span>seed=11 / depth=5</span>
              </div>
            </div>

            {/* stat boxes — moved here to balance hero weight */}
            <div className="mt-5 grid grid-cols-3 gap-4">
              {[
                ["1st", "HackTech '26"],
                ["audited", "every tick · every fork"],
                ["Apache 2.0", "open source · self-host"],
              ].map(([n, l]) => (
                <div key={l} className="border-l hairline-strong pl-3">
                  <div className="num text-[22px] md:text-[24px] text-bone-100 leading-none">
                    {n}
                  </div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone-400 mt-2 leading-tight">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── 4. CONCEPT ─────────── */

function MiniTree({ tree }: { tree: Tree }) {
  const path = (e: { from: { x: number; y: number }; to: { x: number; y: number } }) => {
    const dx = e.to.x - e.from.x;
    return `M ${e.from.x} ${e.from.y} C ${e.from.x + dx * 0.5} ${e.from.y}, ${
      e.to.x - dx * 0.4
    } ${e.to.y}, ${e.to.x} ${e.to.y}`;
  };
  return (
    <svg
      viewBox="0 0 500 300"
      className="w-full h-full"
      role="img"
      aria-labelledby="mini-tree-title"
    >
      <title id="mini-tree-title">
        Multiverse tree — branching timelines across nine ticks
      </title>
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={i}
          x1={20 + i * 55}
          y1="20"
          x2={20 + i * 55}
          y2="280"
          stroke="rgba(255,255,255,0.04)"
          strokeDasharray="2 4"
        />
      ))}
      {tree.edges.map((e, i) => {
        const scaled = (n: { x: number; y: number }) => ({
          x: 20 + (n.x / 880) * 460,
          y: 20 + (n.y / 520) * 260,
        });
        const from = scaled(e.from);
        const to = scaled(e.to);
        return (
          <path
            key={i}
            d={path({ from, to })}
            fill="none"
            stroke={
              e.to.depth <= 1 ? "#4A9EFF" : "rgba(124,184,255,0.6)"
            }
            strokeWidth={Math.max(0.5, 1.6 - e.from.depth * 0.25)}
          />
        );
      })}
      {tree.nodes.map((n) => {
        const sx = 20 + (n.x / 880) * 460;
        const sy = 20 + (n.y / 520) * 260;
        const isRoot = n.depth === 0;
        return (
          <circle
            key={n.id}
            cx={sx}
            cy={sy}
            r={isRoot ? 4 : 1.8}
            fill={isRoot ? "#4A9EFF" : "#7CB8FF"}
          />
        );
      })}
      <text
        x="20"
        y="296"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        fill="#6B7079"
      >
        t=0
      </text>
      <text
        x="478"
        y="296"
        fontSize="9"
        fontFamily="JetBrains Mono, monospace"
        fill="#6B7079"
        textAnchor="end"
      >
        t=8
      </text>
    </svg>
  );
}

function ConceptLineVsTree() {
  const tree = useMemo(() => buildTree(3), []);

  return (
    <Section
      id="concept"
      label="§02 — concept"
      title="One timeline tells you what happened. A tree tells you what could have."
    >
      <div className="grid md:grid-cols-2 gap-px bg-bone-100/10 mt-4">
        <div className="bg-ink-900 p-6 md:p-10">
          <div className="flex items-center justify-between mb-4">
            <Mono>conventional / monoverse</Mono>
            <span className="font-mono text-[10.5px] text-bone-400">
              n_timelines = 1
            </span>
          </div>
          <div className="aspect-[5/3] relative border hairline bp-grid-fine">
            <svg
              viewBox="0 0 500 300"
              className="absolute inset-0 w-full h-full"
              role="img"
              aria-labelledby="mono-title"
            >
              <title id="mono-title">
                Conventional simulation — one trajectory across nine ticks,
                no branching
              </title>
              <line
                x1="40"
                y1="150"
                x2="460"
                y2="150"
                stroke="#363C46"
                strokeWidth="1.5"
              />
              {Array.from({ length: 9 }).map((_, i) => (
                <g key={i}>
                  <line
                    x1={40 + i * 52.5}
                    y1="146"
                    x2={40 + i * 52.5}
                    y2="154"
                    stroke="#363C46"
                  />
                  <text
                    x={40 + i * 52.5}
                    y="174"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fill="#6B7079"
                    textAnchor="middle"
                  >
                    t={i}
                  </text>
                </g>
              ))}
              <circle
                cx="40"
                cy="150"
                r="3"
                fill="#E8E9EC"
                className="conv-dot"
              />
              <text
                x="40"
                y="60"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fill="#9AA0AB"
              >
                → one trajectory
              </text>
              <text
                x="40"
                y="78"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fill="#9AA0AB"
              >
                → no counterfactuals
              </text>
              <text
                x="40"
                y="96"
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                fill="#9AA0AB"
              >
                → collapse on every decision
              </text>
            </svg>
          </div>
          <div className="mt-5 font-mono text-[12px] text-bone-300 leading-relaxed">
            <span className="text-bone-400">// </span>
            you sample a path. you don&apos;t see the distribution. the
            <br />
            <span className="text-bone-400">// </span>
            interesting question —{" "}
            <span className="text-bone-100">
              &quot;what would have happened if&quot;
            </span>{" "}
            — is unanswerable.
          </div>
        </div>

        <div className="bg-ink-900 p-6 md:p-10 relative">
          <div className="flex items-center justify-between mb-4">
            <Mono className="!text-cool">worldfork / multiverse</Mono>
            <span className="font-mono text-[10.5px] text-cool-soft">
              n_timelines = 128
            </span>
          </div>
          <div className="aspect-[5/3] relative border border-cool/30 bp-grid-fine diagram-breathe overflow-visible">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 aurora-breathe"
              style={{
                background:
                  "radial-gradient(50% 60% at 40% 50%, rgba(74,158,255,0.20), transparent 75%)",
                filter: "blur(32px)",
              }}
            />
            <div className="absolute inset-0">
              <MiniTree tree={tree} />
            </div>
          </div>
          <div className="mt-5 font-mono text-[12px] text-bone-200 leading-relaxed">
            <span className="text-cool">// </span>
            keep every fork. tick all branches in parallel.
            <br />
            <span className="text-cool">// </span>
            the tree <span className="text-bone-100">is</span> the answer —
            distributions, counterfactuals, audited paths.
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────── 5. HOW IT WORKS ─────────── */

const STAGES = [
  {
    key: "bigbang",
    label: "Big Bang",
    sub: "§04.a · scenario",
    body: "Define initial conditions: actors, world rules, decision schemas, branching constraints. WorldFork compiles this into the runnable scenario graph.",
    detail: [
      "actors[]",
      "world.rules",
      "decision_points[]",
      "audit.constraints[]",
    ],
  },
  {
    key: "multiverse",
    label: "Multiverse",
    sub: "§04.b · branching",
    body: "At every decision point, the runtime forks. New timelines inherit state, then diverge. Branching is bounded by the configured policy (top-k, sampled, exhaustive).",
    detail: ["policy = top_k", "k = 3", "depth_limit = 12", "parallelism = 64"],
  },
  {
    key: "tick",
    label: "Tick runtime",
    sub: "§04.c · execution",
    body: "Live timelines tick in parallel. Every state mutation is checkpointed so any run can be paused, resumed, inspected, or replayed safely.",
    detail: [
      "ticks.parallel",
      "state.checkpointed",
      "resume.safe",
      "audit.streamed",
    ],
  },
  {
    key: "audit",
    label: "God-agent audit",
    sub: "§04.d · oversight",
    body: "A privileged auditor agent reviews each branch against the constraint set. Violators are pruned and logged. Survivors continue ticking.",
    detail: [
      "constraint.satisfy",
      "prune.if(violation)",
      "append → audit.log",
      "verdict ∈ {pass, prune, flag}",
    ],
  },
  {
    key: "report",
    label: "Reports",
    sub: "§04.e · output",
    body: "Each run emits a structured report — branch tree, per-timeline transcripts, audit log, and statistical rollups. Render as Markdown or PDF.",
    detail: [
      "branch.tree",
      "transcripts",
      "audit.log",
      "render → md | pdf",
    ],
  },
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <Section
      id="runtime"
      label="§03 — runtime"
      title="Big Bang → Multiverse → Tick → Audit → Report."
    >
      <div className="grid md:grid-cols-12 gap-6 md:gap-10">
        <div className="md:col-span-7">
          <div className="relative border hairline bg-ink-950 p-6 md:p-8 diagram-breathe">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 aurora-breathe"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 50%, rgba(74,158,255,0.18), transparent 75%)",
                filter: "blur(36px)",
              }}
            />
            <CornerMarks />
            <Mono>fig.04 / pipeline</Mono>

            <div className="mt-6 grid grid-cols-5 gap-0">
              {STAGES.map((s, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={s.key}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    className={`group relative text-left px-2 py-3 border-r last:border-r-0 hairline ${
                      isActive
                        ? "bg-cool/[0.06]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      className={`font-mono text-[10px] tracking-[0.16em] uppercase ${
                        isActive ? "text-cool" : "text-bone-400"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div
                      className={`mt-2 text-[14px] md:text-[15px] font-medium leading-tight ${
                        isActive
                          ? "text-bone-100"
                          : "text-bone-200 group-hover:text-bone-100"
                      }`}
                    >
                      {s.label}
                    </div>
                    <div
                      className={`absolute top-0 left-0 right-0 h-[2px] ${
                        isActive ? "bg-cool" : "bg-transparent"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 overflow-hidden">
              <svg
                viewBox="0 0 700 200"
                className="w-full h-auto"
                role="img"
                aria-labelledby="pipeline-title"
              >
                <title id="pipeline-title">
                  WorldFork runtime pipeline: Big Bang, multiverse, tick,
                  audit, report — with prune-and-resume feedback
                </title>
                <line
                  x1="40"
                  y1="100"
                  x2="660"
                  y2="100"
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="2 4"
                />
                {STAGES.map((s, i) => {
                  const cx = 70 + i * 140;
                  const isActive = i === active;
                  return (
                    <g key={s.key}>
                      {i > 0 && (
                        <path
                          d={`M ${cx - 140 + 18} 100 L ${cx - 18} 100`}
                          stroke={
                            i <= active ? "#4A9EFF" : "rgba(255,255,255,0.18)"
                          }
                          strokeWidth="1.2"
                        />
                      )}
                      <g
                        onMouseEnter={() => setActive(i)}
                        onClick={() => setActive(i)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={cx - 22}
                          y={78}
                          width="44"
                          height="44"
                          fill="#0A0B0D"
                          stroke={
                            isActive ? "#4A9EFF" : "rgba(232,233,236,0.35)"
                          }
                          strokeWidth={isActive ? 1.5 : 1}
                        />
                        <text
                          x={cx}
                          y="103"
                          textAnchor="middle"
                          fontSize="13"
                          fontFamily="JetBrains Mono, monospace"
                          fill={isActive ? "#4A9EFF" : "#9AA0AB"}
                        >
                          {["Σ", "⌥", "▶", "✓", "≡"][i]}
                        </text>
                        <text
                          x={cx}
                          y="143"
                          textAnchor="middle"
                          fontSize="9.5"
                          fontFamily="JetBrains Mono, monospace"
                          fill={isActive ? "#E8E9EC" : "#6B7079"}
                          letterSpacing="0.5"
                        >
                          {s.label.toUpperCase()}
                        </text>
                      </g>
                    </g>
                  );
                })}
                <path
                  d="M 490 78 C 490 50, 350 50, 350 78"
                  fill="none"
                  stroke="rgba(74,158,255,0.4)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x="420"
                  y="46"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  fill="#7CB8FF"
                  textAnchor="middle"
                >
                  prune → resume
                </text>
              </svg>
            </div>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="border hairline bg-ink-850 p-6 md:p-8 h-full relative">
            <CornerMarks />
            <div className="flex items-center justify-between">
              <Mono>{STAGES[active].sub}</Mono>
              <span className="font-mono text-[10.5px] text-bone-400">
                {String(active + 1).padStart(2, "0")} / 05
              </span>
            </div>
            <h3 className="mt-3 text-2xl md:text-3xl font-medium tracking-[-0.02em] text-bone-100 text-balance">
              {STAGES[active].label}
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-bone-300 max-w-md">
              {STAGES[active].body}
            </p>
            <div className="mt-6 border-t hairline pt-4">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone-400 mb-3">
                surface
              </div>
              <ul className="space-y-1.5 font-mono text-[12.5px] text-bone-200">
                {STAGES[active].detail.map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <span className="text-cool">›</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────── 6. CLI ─────────── */

const CLI_TABS = [
  {
    key: "init",
    label: "init",
    cmd: "$ worldfork init --name \"Atlas onboarding\" --scenario-file examples/test-big-bang.md --max-ticks 4",
    out: [
      ["ok", "loaded scenario examples/test-big-bang.md"],
      ["ok", "queued big bang · waiting for initialized state"],
      ["ok", "model: google/gemini-3.1-flash-lite-preview"],
      ["→", "big_bang_id = bb_a4f12c"],
    ],
  },
  {
    key: "watch",
    label: "watch",
    cmd: "$ worldfork watch big-bang bb_a4f12c",
    out: [
      ["ok", "streaming runtime activity"],
      ["t=01", "multiverse mv_01 · tick 1/4"],
      ["t=02", "multiverse mv_01 · tick 2/4 · god-agent review ✓"],
      ["t=03", "multiverse mv_01 · branched → mv_02, mv_03"],
      ["t=04", "3 multiverses · all reached terminal state"],
      ["→", "report version = rv_7c9d04"],
    ],
  },
  {
    key: "reports",
    label: "reports",
    cmd: "$ worldfork reports view rv_7c9d04",
    out: [
      ["", "report_version_id  rv_7c9d04"],
      ["", "big_bang           bb_a4f12c"],
      ["", "multiverses        3"],
      ["", "ticks completed    12"],
      ["", "format             markdown"],
      ["→", "open structured report (database-backed)"],
    ],
  },
  {
    key: "agent",
    label: "agent",
    cmd: "$ worldfork agent discover",
    out: [
      ["ok", "agent-facing api contract loaded"],
      ["ok", "recommended flow: init → watch → reports view"],
      ["ok", "endpoints: /api/agent/* (discovery, runs, jobs, reports)"],
      ["→", "ready for agent operation"],
    ],
  },
] as const;

function CLISection() {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const t = CLI_TABS[tab];

  useEffect(() => {
    setRevealed(0);
    const id = setInterval(() => {
      setRevealed((r) => {
        if (r >= t.out.length) {
          clearInterval(id);
          return r;
        }
        return r + 1;
      });
    }, 230);
    return () => clearInterval(id);
  }, [tab, t.out.length]);

  const copy = () => {
    navigator.clipboard?.writeText(t.cmd.replace(/^\$ /, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <Section
      id="cli"
      label="§04 — interface"
      title={<>Designed for agents. The CLI ships today; the web UI is next.</>}
    >
      <div className="grid md:grid-cols-12 gap-8 md:gap-10">
        <div className="md:col-span-4">
          <p className="text-bone-300 leading-relaxed text-[14.5px] max-w-sm">
            WorldFork is operated by other agents and by humans who think like
            them. Stable Python CLI, stable HTTP API. Everything is reproducible
            with a scenario id and a seed.
          </p>
          <div className="mt-6 space-y-2.5 font-mono text-[12.5px] text-bone-300">
            <div className="flex items-center gap-2">
              <span className="text-cool">▸</span>POSIX-friendly stdout
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cool">▸</span>Idempotent run ids
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cool">▸</span>Deterministic with seed
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cool">▸</span>Streamed JSONL events
            </div>
          </div>
          <div className="mt-8 border-l-2 border-cool pl-4">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cool">
              today
            </div>
            <div className="mt-1 text-bone-100 font-medium">
              CLI · HTTP API · Python SDK
            </div>
            <div className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-bone-400">
              soon
            </div>
            <div className="mt-1 text-bone-300">
              Multiverse explorer (web UI)
            </div>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="border hairline bg-ink-950 relative">
            <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-bone-500"></span>
                  <span className="w-2 h-2 bg-bone-500"></span>
                  <span className="w-2 h-2 bg-cool"></span>
                </div>
                <span className="font-mono text-[11px] text-bone-400 ml-2">
                  ~/wf · zsh
                </span>
              </div>
              <div
                role="tablist"
                aria-label="CLI command examples"
                className="flex items-center gap-1"
              >
                {CLI_TABS.map((c, i) => (
                  <button
                    key={c.key}
                    role="tab"
                    aria-selected={i === tab}
                    aria-controls="cli-output"
                    onClick={() => setTab(i)}
                    className={`px-3 py-1 font-mono text-[11px] tracking-wide border-l hairline ${
                      i === tab
                        ? "text-bone-100 bg-white/[0.04]"
                        : "text-bone-400 hover:text-bone-100"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pt-5 flex items-start justify-between gap-4">
              <div className="font-mono text-[13px] text-bone-100 leading-snug">
                <span className="text-bone-400">
                  {t.cmd.startsWith("$") ? "$ " : ""}
                </span>
                <span>{t.cmd.replace(/^\$ /, "")}</span>
              </div>
              <button
                onClick={copy}
                aria-label={`Copy command: ${t.cmd.replace(/^\$ /, "")}`}
                aria-live="polite"
                className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.14em] border hairline px-2.5 py-1 text-bone-300 hover:text-bone-100 hover:border-bone-100/40 transition-colors"
              >
                {copied ? "copied" : "copy"}
              </button>
            </div>

            <div
              id="cli-output"
              role="tabpanel"
              aria-live="polite"
              className="px-5 pt-3 pb-6 font-mono text-[12.5px] leading-[1.7] scan min-h-[230px]"
            >
              {t.out.slice(0, revealed).map(([tag, line], i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className={`w-6 shrink-0 ${
                      tag === "ok"
                        ? "text-cool"
                        : tag === "→"
                        ? "text-bone-100"
                        : tag.startsWith("t=")
                        ? "text-bone-400"
                        : "text-bone-500"
                    }`}
                  >
                    {tag}
                  </span>
                  <span className="text-bone-200">{line}</span>
                </div>
              ))}
              {revealed < t.out.length && (
                <div className="flex gap-3">
                  <span className="w-6"></span>
                  <span className="blink text-cool">_</span>
                </div>
              )}
              {revealed >= t.out.length && (
                <div className="mt-2 text-bone-400">
                  $ <span className="blink">_</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 font-mono text-[11px] text-bone-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cool"></span>
            CLI is the supported surface today. Web UI shipping soon.
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────── 8. QUICKSTART ─────────── */

function Quickstart() {
  return (
    <Section
      id="quickstart"
      label="§06 — quickstart"
      title="Paste one prompt into your agent. Done."
    >
      {/* AGENT PATH — recommended */}
      <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-start">
        <div className="md:col-span-7">
          <SetupPromptCard prompt={AGENT_INSTALL_PROMPT} variant="section" />
          <p className="mt-4 font-mono text-[11.5px] text-bone-400 leading-relaxed">
            the skill walks you through prerequisites, .env config, CLI install,
            docker compose, migrations, seeding, readiness checks, and the
            onboarding demo.
          </p>
        </div>
        <div className="md:col-span-5">
          <ol className="space-y-4 font-mono text-[12.5px] text-bone-200">
            {[
              ["paste", "drop the prompt above into your agent"],
              ["install", "agent runs npx skills add ... --all"],
              ["follow", "agent walks you through prerequisites + .env"],
              ["verify", "agent confirms readiness and runs the demo"],
            ].map(([k, v], i) => (
              <li key={k} className="flex gap-4">
                <span className="font-mono text-[10.5px] tracking-[0.16em] uppercase text-cool w-6 shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="text-bone-100 font-medium">{k}</span>
                  <span className="text-bone-400"> — {v}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* MANUAL PATH — pointer to authoritative docs */}
      <div className="mt-8 pt-6 border-t hairline flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-[12px] text-bone-400">
        <span className="text-bone-500">manual setup →</span>
        <a
          href={SETUP_DOCS_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="text-cool hover:text-bone-100"
        >
          read the setup guide
        </a>
        <a
          href={`${GITHUB_URL}#readme`}
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-bone-100"
        >
          README
        </a>
        <a
          href={`${GITHUB_URL}/blob/main/CONTRIBUTING.md`}
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-bone-100"
        >
          CONTRIBUTING
        </a>
      </div>
    </Section>
  );
}

/* ─────────── 8. SHOWCASE — real example scenario ─────────── */

function Showcase() {
  return (
    <Section
      id="showcase"
      label="§05 — example"
      title="A real scenario the project ships with."
    >
      <div className="grid md:grid-cols-12 gap-6 md:gap-10 mt-2">
        <div className="md:col-span-5">
          <Mono>examples/test-big-bang.md</Mono>
          <h3 className="mt-3 text-2xl md:text-[28px] font-medium tracking-[-0.02em] text-bone-100 text-balance">
            The Atlas Resilience Crisis
          </h3>
          <p className="mt-4 text-bone-300 text-[14px] leading-relaxed text-pretty">
            A 40-million-person coastal megaregion enters a 180-day emergency
            after a heat wave, water-pressure failures, rolling blackouts,
            supply bottlenecks, and a climate-migration surge collide with
            fragile public trust and a newly deployed AI-assisted civic
            coordination system.
          </p>
          <p className="mt-3 text-bone-400 text-[13px] leading-relaxed">
            The simulation question:{" "}
            <span className="text-bone-200">
              which governance choices preserve legitimacy, reduce harm, and
              prevent social fragmentation when scarcity, institutional
              overload, misinformation, and emergency technology all interact
              at once?
            </span>
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 font-mono text-[11px] text-bone-300">
            <div className="border hairline px-3 py-2 transition-colors hover:bg-white/[0.02] hover:border-cool/30">
              <div className="text-bone-500">tick duration</div>
              <div className="text-bone-100 mt-0.5">12 hours</div>
            </div>
            <div className="border hairline px-3 py-2 transition-colors hover:bg-white/[0.02] hover:border-cool/30">
              <div className="text-bone-500">max ticks</div>
              <div className="text-bone-100 mt-0.5">180</div>
            </div>
            <div className="border hairline px-3 py-2 transition-colors hover:bg-white/[0.02] hover:border-cool/30">
              <div className="text-bone-500">branch depth</div>
              <div className="text-bone-100 mt-0.5">5</div>
            </div>
            <div className="border hairline px-3 py-2 transition-colors hover:bg-white/[0.02] hover:border-cool/30">
              <div className="text-bone-500">active multiverses</div>
              <div className="text-bone-100 mt-0.5">24</div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4 font-mono text-[11.5px]">
            <a
              href={`${GITHUB_URL}/blob/main/examples/test-big-bang.md`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-cool hover:text-cool-soft"
            >
              read the full scenario →
            </a>
            <a
              href={`${GITHUB_URL}/tree/main/examples`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-bone-400 hover:text-bone-200"
            >
              all examples ↗
            </a>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="border hairline bg-ink-850 p-5 md:p-7 relative">
            <CornerMarks />
            <div className="flex items-center justify-between mb-4">
              <Mono>plausible terminal multiverses</Mono>
              <span className="font-mono text-[10.5px] text-bone-400">
                n_outcomes ≈ 8
              </span>
            </div>
            <ul className="grid sm:grid-cols-2 gap-px bg-bone-100/[0.06] font-mono text-[12px]">
              {[
                ["A", "Cooperative resilience success"],
                ["B", "Opaque emergency regime"],
                ["C", "Misinformation spiral"],
                ["D", "Civic-tech reform path"],
                ["E", "Regional fragmentation"],
                ["F", "Mutual-aid federation"],
                ["G", "Court-driven legitimacy reset"],
                ["H", "Labor & housing conflict"],
              ].map(([k, v]) => (
                <li
                  key={k}
                  className="bg-ink-850 px-3 py-2.5 flex items-baseline gap-3"
                >
                  <span className="text-cool">{k}</span>
                  <span className="text-bone-200">{v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-bone-400 text-[12.5px] leading-relaxed font-mono">
              <span className="text-bone-500">// </span>
              same Day 0. eight plausible terminal states.
              <br />
              <span className="text-bone-500">// </span>
              the report compares them with full lineage.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────── 9. FAQ — common questions, side-by-side definitions ─────────── */

const FAQ_ITEMS: Array<[string, ReactNode]> = [
  [
    "Is WorldFork a SaaS product?",
    <>
      No. WorldFork is open-source backend infrastructure that you self-host.
      There is no hosted service, no login, and no data is collected by this
      site.
    </>,
  ],
  [
    "What is a Big Bang?",
    <>
      The root scenario document that seeds a run. It defines the initial
      world state, the primary simulation question, and the conditions agents
      tick forward from. See{" "}
      <a
        href={`${GITHUB_URL}/blob/main/examples/test-big-bang.md`}
        target="_blank"
        rel="noreferrer noopener"
        className="text-cool hover:text-cool-soft"
      >
        the Atlas example
      </a>
      .
    </>,
  ],
  [
    "Does it require a specific LLM?",
    <>
      No. WorldFork is model-agnostic — bring whichever model you prefer. The
      example scenario recommends a cheap, fast model for smoke runs and a
      stronger one for full demonstrations.
    </>,
  ],
  [
    "What license?",
    <>
      Apache License 2.0. See the{" "}
      <a
        href={`${GITHUB_URL}/blob/main/LICENSE`}
        target="_blank"
        rel="noreferrer noopener"
        className="text-cool hover:text-cool-soft"
      >
        LICENSE
      </a>{" "}
      and{" "}
      <a
        href={`${GITHUB_URL}/blob/main/NOTICE`}
        target="_blank"
        rel="noreferrer noopener"
        className="text-cool hover:text-cool-soft"
      >
        NOTICE
      </a>{" "}
      files in the repository for the full text.
    </>,
  ],
  [
    "How do I install it with a coding agent?",
    <>
      Paste the prompt at the top of this page into Claude Code, Cursor, or
      any coding agent. The official{" "}
      <span className="font-mono text-bone-200">worldfork-setup</span> skill
      handles repo clone, environment bring-up, and first-run validation.
    </>,
  ],
  [
    "How does branching work?",
    <>
      The runtime evaluates each tick for branch-worthy decision points,
      scores them, and forks above a configurable threshold. Branches inherit
      tick history, so each child timeline diverges from a known shared past.
    </>,
  ],
  [
    "What does the audit produce?",
    <>
      Persisted runtime checkpoints, every LLM call, jobs and logs, manual
      interventions, and structured per-multiverse + final Big Bang reports.
      Tied back to durable state so any run is reproducible and inspectable.
    </>,
  ],
];

function FAQ() {
  return (
    <Section
      id="faq"
      label="§07 — faq"
      title="Common questions, plainly answered."
    >
      <dl className="grid md:grid-cols-2 gap-x-10 gap-y-8 mt-4">
        {FAQ_ITEMS.map(([q, a]) => (
          <div
            key={q}
            className="border-l border-cool/30 pl-5 transition-[border-color,padding] hover:border-cool/70 hover:pl-6"
          >
            <dt className="text-[15px] font-medium text-bone-100 tracking-[-0.01em]">
              {q}
            </dt>
            <dd className="mt-2 text-[13.5px] text-bone-300 leading-relaxed text-pretty">
              {a}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 pt-6 border-t hairline flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-[12px] text-bone-400">
        <span className="text-bone-500">more questions →</span>
        <a
          href={DOCS_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-bone-100"
        >
          Read the Docs
        </a>
        <a
          href={DEEPWIKI_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-bone-100"
        >
          DeepWiki
        </a>
        <a
          href={`${GITHUB_URL}/issues`}
          target="_blank"
          rel="noreferrer noopener"
          className="hover:text-bone-100"
        >
          file an issue
        </a>
      </div>
    </Section>
  );
}

/* ─────────── 10. FOOTER ─────────── */

function Footer() {
  return (
    <footer className="border-t hairline">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-12">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Wordmark />
            <p className="mt-4 text-bone-400 text-[13.5px] leading-relaxed max-w-sm">
              Agent-operated branching social simulation. Built by a small team
              of researchers and infrastructure engineers.
            </p>
            <div className="mt-5 flex items-center gap-2 px-2.5 py-1 border hairline-strong w-max">
              <span className="w-1.5 h-1.5 bg-cool"></span>
              <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone-200">
                HackTech &apos;26 · 1st place
              </span>
            </div>
          </div>
          {(
            [
              [
                "explore",
                [
                  ["Concept", "#concept"],
                  ["Runtime", "#runtime"],
                  ["CLI", "#cli"],
                  ["Example", "#showcase"],
                  ["FAQ", "#faq"],
                  ["Quickstart", "#quickstart"],
                ],
              ],
              [
                "docs",
                [
                  ["Read the Docs", DOCS_URL],
                  ["DeepWiki", DEEPWIKI_URL],
                  ["Setup guide", SETUP_DOCS_URL],
                  ["CLI reference", CLI_DOCS_URL],
                ],
              ],
              [
                "project",
                [
                  ["GitHub", GITHUB_URL],
                  ["Architecture", ARCH_DOCS_URL],
                ],
              ],
            ] as const
          ).map(([h, items]) => (
            <div key={h} className="md:col-span-2">
              <Mono>{h}</Mono>
              <ul className="mt-3 space-y-1.5 font-mono text-[12.5px] text-bone-300">
                {items.map(([label, href]) => {
                  const isExternal = href.startsWith("http");
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={
                          isExternal ? "noreferrer noopener" : undefined
                        }
                        className="hover:text-bone-100 transition-colors"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t hairline flex flex-col md:flex-row md:items-center md:justify-between gap-3 font-mono text-[11px] text-bone-500">
          <div>
            ©{" "}
            <time dateTime={String(new Date().getFullYear())}>
              {new Date().getFullYear()}
            </time>{" "}
            WorldFork contributors · Apache License 2.0 · this site sets no
            cookies and runs no analytics
          </div>
          <div className="flex items-center gap-5">
            <a
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-bone-100 transition-colors"
            >
              file an issue
            </a>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-bone-100 transition-colors"
            >
              docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── mobile sticky CTA ─────────── */

function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const copy = () => {
    navigator.clipboard?.writeText(AGENT_INSTALL_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-cool/40 bg-ink-950/95 backdrop-blur transition-transform shadow-[0_-12px_32px_-12px_rgba(74,158,255,0.18),0_-2px_8px_-2px_rgba(0,0,0,0.25)] ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      role="region"
      aria-label="Setup actions"
    >
      <div className="flex">
        <button
          onClick={copy}
          aria-label="Copy WorldFork setup prompt to clipboard"
          aria-live="polite"
          className={`flex-1 px-4 py-3.5 font-mono text-[12px] uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 ${
            copied ? "bg-cool text-ink-950" : "bg-cool/15 text-cool"
          }`}
        >
          {copied ? "✓ copied" : "▸ copy setup"}
        </button>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="flex-1 px-4 py-3.5 border-l border-cool/30 font-mono text-[12px] uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 text-bone-100"
        >
          GitHub →
        </a>
      </div>
    </div>
  );
}

/* ─────────── ROOT ─────────── */

export default function Landing() {
  return (
    <main
      id="main"
      className="min-h-[100dvh] bg-ink-900 text-bone-100 pb-16 md:pb-0 relative"
    >
      <span className="grain" aria-hidden="true" />
      <span className="scroll-progress" aria-hidden="true" />
      <Nav />
      <Hero />
      <ConceptLineVsTree />
      <HowItWorks />
      <CLISection />
      <Showcase />
      <Quickstart />
      <FAQ />
      <Footer />
      <MobileStickyCTA />
    </main>
  );
}

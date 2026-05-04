"use client";

import { useState } from "react";

type Line = {
  k: string;
  a: string;
  b: string;
};

type Timeline = {
  id: string;
  letter: string;
  name: string;
  blurb: string;
  lines: Line[];
};

const TIMELINES: Timeline[] = [
  {
    id: "cooperative",
    letter: "A",
    name: "Cooperative resilience",
    blurb: "Civic coordination holds. AI assist used for triage, not enforcement.",
    lines: [
      { k: "trust.public", a: "0.31", b: "0.62" },
      { k: "blackout.hours", a: "412", b: "118" },
      { k: "displaced.persons", a: "1.4M", b: "0.42M" },
      { k: "ai.scope", a: "enforcement", b: "triage_only" },
      { k: "regime.legitimacy", a: "0.22", b: "0.74" },
      { k: "mutual_aid.cells", a: "184", b: "1,206" },
      { k: "court.injunctions", a: "37", b: "4" },
      { k: "fragmentation.index", a: "0.71", b: "0.18" },
    ],
  },
  {
    id: "regime",
    letter: "B",
    name: "Opaque emergency regime",
    blurb: "Powers consolidated. AI assist becomes enforcement layer.",
    lines: [
      { k: "trust.public", a: "0.62", b: "0.19" },
      { k: "blackout.hours", a: "118", b: "284" },
      { k: "displaced.persons", a: "0.42M", b: "0.88M" },
      { k: "ai.scope", a: "triage_only", b: "enforcement" },
      { k: "regime.legitimacy", a: "0.74", b: "0.27" },
      { k: "mutual_aid.cells", a: "1,206", b: "208" },
      { k: "court.injunctions", a: "4", b: "61" },
      { k: "fragmentation.index", a: "0.18", b: "0.55" },
    ],
  },
  {
    id: "misinfo",
    letter: "C",
    name: "Misinformation spiral",
    blurb: "Information channels capture. Coordination fails on day 60.",
    lines: [
      { k: "trust.public", a: "0.62", b: "0.08" },
      { k: "blackout.hours", a: "118", b: "503" },
      { k: "displaced.persons", a: "0.42M", b: "2.1M" },
      { k: "ai.scope", a: "triage_only", b: "compromised" },
      { k: "regime.legitimacy", a: "0.74", b: "0.11" },
      { k: "mutual_aid.cells", a: "1,206", b: "94" },
      { k: "court.injunctions", a: "4", b: "12" },
      { k: "fragmentation.index", a: "0.18", b: "0.83" },
    ],
  },
];

const KEYS = ["trust.public", "blackout.hours", "displaced.persons", "ai.scope", "regime.legitimacy", "mutual_aid.cells", "court.injunctions", "fragmentation.index"];

function deltaSign(k: string, a: string, b: string): "up" | "down" | "neutral" {
  const goodWhenLower = ["blackout.hours", "displaced.persons", "fragmentation.index", "court.injunctions"];
  const goodWhenHigher = ["trust.public", "regime.legitimacy", "mutual_aid.cells"];
  const na = parseFloat(a.replace(/[^0-9.]/g, ""));
  const nb = parseFloat(b.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(na) || Number.isNaN(nb)) return a === b ? "neutral" : "down";
  if (Math.abs(na - nb) < 1e-6) return "neutral";
  const better = nb < na;
  if (goodWhenLower.includes(k)) return better ? "up" : "down";
  if (goodWhenHigher.includes(k)) return nb > na ? "up" : "down";
  return "neutral";
}

export default function CounterfactualDiff() {
  const [aId, setAId] = useState(TIMELINES[0].id);
  const [bId, setBId] = useState(TIMELINES[1].id);
  const a = TIMELINES.find((t) => t.id === aId)!;
  const b = TIMELINES.find((t) => t.id === bId)!;

  return (
    <div className="grid md:grid-cols-12 gap-6 md:gap-10">
      <div className="md:col-span-4">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-bone-400">
          counterfactual diff
        </div>
        <h3 className="mt-3 text-2xl md:text-[28px] font-medium tracking-[-0.02em] text-bone-100 text-balance">
          Pick two timelines. Read the world-state delta.
        </h3>
        <p className="mt-4 text-bone-300 text-[14px] leading-relaxed text-pretty">
          Same Day 0. Different decisions. The runtime persists every tick of every
          multiverse, so any two endings can be compared key-by-key with full lineage.
          Tap a chip to pick the &ldquo;A&rdquo; or &ldquo;B&rdquo; outcome.
        </p>
        <div className="mt-5 space-y-3">
          <PickerColumn label="A" timelines={TIMELINES} active={aId} onPick={setAId} accent="bone" />
          <PickerColumn label="B" timelines={TIMELINES} active={bId} onPick={setBId} accent="cool" />
        </div>
      </div>
      <div className="md:col-span-8">
        <div className="border hairline bg-ink-850 p-5 md:p-7 relative">
          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-4">
            <Header letter={a.letter} name={a.name} blurb={a.blurb} accent="bone" />
            <Header letter={b.letter} name={b.name} blurb={b.blurb} accent="cool" />
          </div>
          <div className="border-t hairline pt-3">
            <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-[120px_auto_1fr_1fr] gap-x-3 sm:gap-x-5 gap-y-1.5 font-mono text-[12px]">
              <div className="hidden sm:block text-bone-500 text-[10.5px] uppercase tracking-[0.14em] pb-1">
                key
              </div>
              <div className="hidden sm:block" />
              <div className="hidden sm:block text-bone-500 text-[10.5px] uppercase tracking-[0.14em] pb-1">
                A · {a.letter}
              </div>
              <div className="hidden sm:block text-bone-500 text-[10.5px] uppercase tracking-[0.14em] pb-1">
                B · {b.letter}
              </div>
              {KEYS.map((k) => {
                const av = a.lines.find((l) => l.k === k)?.a ?? "—";
                const bv = b.lines.find((l) => l.k === k)?.b ?? "—";
                const sign = deltaSign(k, av, bv);
                const arrow =
                  sign === "up" ? "↑" : sign === "down" ? "↓" : "·";
                const color =
                  sign === "up"
                    ? "text-cool"
                    : sign === "down"
                    ? "text-[#d97757]"
                    : "text-bone-500";
                return (
                  <div key={k} className="contents">
                    <div className="text-bone-400 truncate col-span-1 sm:col-span-1">
                      {k}
                    </div>
                    <div className={`text-center w-5 ${color}`}>{arrow}</div>
                    <div className="text-bone-200 sm:col-span-1 col-span-1 sm:order-none order-3 text-right sm:text-left">
                      {av}
                    </div>
                    <div className={`sm:col-span-1 col-span-3 sm:col-start-4 sm:text-left ${sign === "neutral" ? "text-bone-300" : sign === "up" ? "text-bone-100" : "text-bone-200"} text-right sm:text-left`}>
                      {bv}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-5 text-bone-400 text-[12px] leading-relaxed font-mono">
            <span className="text-bone-500">// </span>
            ↑ better in B · ↓ worse in B · · unchanged
            <br />
            <span className="text-bone-500">// </span>
            same root scenario · audited per tick
          </p>
        </div>
      </div>
    </div>
  );
}

function PickerColumn({
  label,
  timelines,
  active,
  onPick,
  accent,
}: {
  label: string;
  timelines: Timeline[];
  active: string;
  onPick: (id: string) => void;
  accent: "bone" | "cool";
}) {
  return (
    <div>
      <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone-500 mb-1.5">
        timeline {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {timelines.map((t) => {
          const isActive = t.id === active;
          const baseColor =
            accent === "cool"
              ? isActive
                ? "border-cool/60 bg-cool/10 text-bone-100"
                : "hairline text-bone-300 hover:text-bone-100 hover:border-cool/30"
              : isActive
              ? "border-bone-200/40 bg-bone-100/[0.06] text-bone-100"
              : "hairline text-bone-300 hover:text-bone-100 hover:border-bone-200/40";
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              className={`border px-2.5 py-1.5 font-mono text-[11px] tracking-wide transition-colors ${baseColor}`}
            >
              <span className="text-bone-500 mr-1.5">{t.letter}</span>
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Header({
  letter,
  name,
  blurb,
  accent,
}: {
  letter: string;
  name: string;
  blurb: string;
  accent: "bone" | "cool";
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={`font-mono text-[18px] ${accent === "cool" ? "text-cool" : "text-bone-100"}`}>
          {letter}
        </span>
        <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone-500">
          terminal state
        </span>
      </div>
      <div className="mt-1 text-bone-100 text-[14px] leading-snug">{name}</div>
      <div className="mt-1 text-bone-400 text-[12px] leading-snug font-mono">{blurb}</div>
    </div>
  );
}

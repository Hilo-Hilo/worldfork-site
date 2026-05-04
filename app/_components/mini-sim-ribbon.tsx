"use client";

import { useEffect, useRef, useState } from "react";

type Node = {
  id: number;
  x: number;
  y: number;
  parent: number | null;
  depth: number;
  score: number; // 0..1
  pruned: boolean;
};

const W = 880;
const H = 200;
const COLS = [40, 170, 310, 460, 610, 760, 850];
const MAX_DEPTH = 6;
const MAX_NODES = 28;

function spawn(parent: Node, id: number, count: number, idx: number): Node {
  const nextDepth = parent.depth + 1;
  const baseY = parent.y;
  const spread = [80, 60, 44, 32, 24, 18][parent.depth] || 14;
  const sign = count === 1 ? (Math.random() < 0.5 ? -1 : 1) : idx === 0 ? -1 : 1;
  const wobble = (Math.random() - 0.5) * 12;
  return {
    id,
    x: COLS[nextDepth] + (Math.random() - 0.5) * 20,
    y: Math.max(20, Math.min(H - 20, baseY + sign * spread * (0.55 + Math.random() * 0.5) + wobble)),
    parent: parent.id,
    depth: nextDepth,
    score: 0,
    pruned: false,
  };
}

type Phase = "growing" | "scoring" | "pruning" | "settling";

export default function MiniSimRibbon() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 0, x: COLS[0], y: H / 2, parent: null, depth: 0, score: 1, pruned: false },
  ]);
  const [phase, setPhase] = useState<Phase>("growing");
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const obs = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    const step = () => {
      if (cancelled) return;
      if (!visible.current) {
        setTimeout(step, 400);
        return;
      }

      setNodes((prev) => {
        if (phase === "growing") {
          if (prev.length >= MAX_NODES) {
            setPhase("scoring");
            return prev;
          }
          // pick a non-leaf-eligible parent: prefer shallow + recent
          const candidates = prev.filter(
            (n) => n.depth < MAX_DEPTH && prev.filter((c) => c.parent === n.id).length < 2,
          );
          if (candidates.length === 0) {
            setPhase("scoring");
            return prev;
          }
          const parent = candidates[Math.floor(Math.random() * Math.min(candidates.length, 4))];
          const existing = prev.filter((c) => c.parent === parent.id).length;
          const branches = parent.depth === 0 ? 2 : Math.random() < 0.6 ? 1 : 2;
          const toAdd = Math.min(branches, 2 - existing);
          const next = [...prev];
          for (let i = 0; i < toAdd; i++) {
            next.push(spawn(parent, prev.length + i, toAdd, existing + i));
          }
          return next;
        }
        if (phase === "scoring") {
          // score back up: deeper nodes get a value, parents averaged
          const scored = prev.map((n) => ({ ...n, score: n.depth === 0 ? 1 : Math.random() * 0.9 + 0.1 }));
          const byParent: Record<number, Node[]> = {};
          scored.forEach((n) => {
            if (n.parent !== null) {
              byParent[n.parent] = byParent[n.parent] || [];
              byParent[n.parent].push(n);
            }
          });
          // backup pass deepest-first
          const sorted = [...scored].sort((a, b) => b.depth - a.depth);
          const map = new Map(sorted.map((n) => [n.id, n] as const));
          for (const n of sorted) {
            const kids = byParent[n.id];
            if (kids && kids.length) {
              const avg = kids.reduce((s, k) => s + (map.get(k.id)?.score ?? k.score), 0) / kids.length;
              const target = map.get(n.id)!;
              target.score = (target.score + avg) / 2;
            }
          }
          setTimeout(() => setPhase("pruning"), 700);
          return Array.from(map.values()).sort((a, b) => a.id - b.id);
        }
        if (phase === "pruning") {
          // mark low-score branches pruned (and their descendants)
          const next = prev.map((n) => ({ ...n }));
          const childrenOf: Record<number, Node[]> = {};
          next.forEach((n) => {
            if (n.parent !== null) {
              childrenOf[n.parent] = childrenOf[n.parent] || [];
              childrenOf[n.parent].push(n);
            }
          });
          const prune = (id: number) => {
            const kids = childrenOf[id] || [];
            for (const k of kids) {
              k.pruned = true;
              prune(k.id);
            }
          };
          next
            .filter((n) => n.depth >= 2 && n.score < 0.45 && !n.pruned)
            .slice(0, 4)
            .forEach((n) => {
              n.pruned = true;
              prune(n.id);
            });
          setTimeout(() => setPhase("settling"), 1100);
          return next;
        }
        if (phase === "settling") {
          setTimeout(() => {
            setNodes([
              { id: 0, x: COLS[0], y: H / 2, parent: null, depth: 0, score: 1, pruned: false },
            ]);
            setPhase("growing");
            setTick((t) => t + 1);
          }, 1400);
          return prev;
        }
        return prev;
      });

      const delay = phase === "growing" ? 130 : 600;
      setTimeout(step, delay);
    };
    const t = setTimeout(step, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [phase, tick, reduced]);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const liveCount = nodes.filter((n) => !n.pruned).length;
  const prunedCount = nodes.filter((n) => n.pruned).length;

  const phaseLabel: Record<Phase, string> = {
    growing: "expanding",
    scoring: "backing up scores",
    pruning: "pruning low-value branches",
    settling: "run complete · resetting",
  };

  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2 font-mono text-[10.5px] text-bone-400 tracking-[0.14em] uppercase">
        <span className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              phase === "growing"
                ? "bg-cool"
                : phase === "scoring"
                ? "bg-cool-soft"
                : phase === "pruning"
                ? "bg-bone-300"
                : "bg-bone-500"
            }`}
            style={{ animation: !reduced ? "pulse-fade 1.2s ease-in-out infinite" : undefined }}
          />
          <span className="text-bone-300">{phaseLabel[phase]}</span>
        </span>
        <span className="num text-bone-400">
          live <span className="text-bone-100">{liveCount}</span> · pruned{" "}
          <span className="text-bone-100">{prunedCount}</span>
        </span>
      </div>
      <div className="border hairline-strong bg-ink-900/40 relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px] sm:h-[200px] block" role="img" aria-label="A live miniature Monte Carlo tree search expanding, scoring, and pruning branches in a loop.">
          <defs>
            <pattern id="mini-bp" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="miniRoot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4A9EFF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#4A9EFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#mini-bp)" />
          {/* edges */}
          {nodes
            .filter((n) => n.parent !== null)
            .map((n) => {
              const p = byId.get(n.parent!);
              if (!p) return null;
              const dx = n.x - p.x;
              const c1x = p.x + dx * 0.5;
              const c2x = n.x - dx * 0.4;
              const d = `M ${p.x} ${p.y} C ${c1x} ${p.y}, ${c2x} ${n.y}, ${n.x} ${n.y}`;
              const dim = n.pruned;
              return (
                <path
                  key={`e-${n.id}`}
                  d={d}
                  fill="none"
                  stroke={dim ? "rgba(232,233,236,0.18)" : n.depth <= 1 ? "#4A9EFF" : "rgba(124,184,255,0.55)"}
                  strokeWidth={Math.max(0.6, 1.8 - n.depth * 0.2)}
                  strokeDasharray={dim ? "3 4" : undefined}
                  strokeLinecap="round"
                  style={{
                    opacity: dim ? 0.5 : 1,
                    transition: "opacity 0.4s ease, stroke 0.4s ease",
                  }}
                />
              );
            })}
          {/* root halo */}
          <circle cx={COLS[0]} cy={H / 2} r="22" fill="url(#miniRoot)" />
          {/* nodes */}
          {nodes.map((n) => {
            const isRoot = n.depth === 0;
            const r = isRoot ? 5 : n.pruned ? 2 : 2.6;
            const fill = isRoot ? "#4A9EFF" : n.pruned ? "#363C46" : n.score > 0.7 ? "#E8E9EC" : "#7CB8FF";
            return (
              <g
                key={`n-${n.id}`}
                style={{
                  animation: !reduced ? "node-pop 0.35s cubic-bezier(0.4,0,0.2,1) both" : undefined,
                  transformOrigin: `${n.x}px ${n.y}px`,
                  transformBox: "fill-box" as const,
                }}
              >
                {phase === "scoring" && !n.pruned && !isRoot && (
                  <circle cx={n.x} cy={n.y} r={r + 3} fill="none" stroke="#4A9EFF" strokeOpacity="0.4" strokeWidth="0.6">
                    <animate attributeName="r" from={r} to={r + 6} dur="1s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" from="0.55" to="0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={r}
                  fill={fill}
                  style={{ transition: "fill 0.5s ease, r 0.3s ease" }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

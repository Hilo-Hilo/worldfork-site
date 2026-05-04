"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SmoothCursor = dynamic(
  () => import("@/components/react-bits/smooth-cursor"),
  { ssr: false },
);

const SynapticShift = dynamic(
  () => import("@/components/react-bits/synaptic-shift"),
  { ssr: false },
);

export default function CoolFx() {
  const [enabled, setEnabled] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    setCoarse(isCoarse);
    setEnabled(true);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.18] mix-blend-screen"
        style={{ maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 80%)" }}
      >
        <SynapticShift
          color="#4a9eff"
          speed={0.18}
          scale={0.9}
          intensity={1.4}
          falloff={1.18}
          complexity={9}
        />
      </div>
      {!coarse && (
        <SmoothCursor
          color="rgba(124, 184, 255, 0.55)"
          lineWidth={1.4}
          pointsCount={26}
          springStrength={0.18}
          dampening={0.78}
          blur={6}
          mixBlendMode="screen"
          trailOpacity={0.35}
        />
      )}
    </>
  );
}

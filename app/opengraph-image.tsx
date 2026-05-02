import { ImageResponse } from "next/og";

export const alt =
  "WorldFork — Monte Carlo tree search for reality. Open-source social simulation infrastructure.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0b0d 0%, #0e1014 50%, #0a0b0d 100%)",
          color: "#e8e9ec",
          padding: "72px 80px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* hairline frame */}
        <div
          style={{
            position: "absolute",
            inset: "24px",
            border: "1px solid rgba(74,158,255,0.18)",
            display: "flex",
          }}
        />

        {/* tick rail */}
        <div
          style={{
            display: "flex",
            gap: "36px",
            color: "#6b7079",
            fontSize: "16px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>t=0</span>
          <span>t=1</span>
          <span>t=2</span>
          <span>t=3</span>
          <span style={{ color: "#4a9eff" }}>● branch</span>
          <span>t=5</span>
        </div>

        {/* eyebrow */}
        <div
          style={{
            marginTop: "60px",
            fontSize: "20px",
            color: "#4a9eff",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          worldfork — mcts for reality · hacktech '26
        </div>

        {/* headline */}
        <div
          style={{
            marginTop: "28px",
            fontSize: "112px",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#f4f5f7",
            display: "flex",
          }}
        >
          Search the future.
        </div>

        {/* subhead */}
        <div
          style={{
            marginTop: "28px",
            fontSize: "32px",
            color: "#c9ccd3",
            lineHeight: 1.3,
            maxWidth: "900px",
            display: "flex",
          }}
        >
          MCTS for reality. One scenario, a searched tree of timelines, audited.
        </div>

        {/* spacer */}
        <div style={{ flexGrow: 1, display: "flex" }} />

        {/* footer row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "20px",
            color: "#9aa0ab",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ color: "#e8e9ec", fontSize: "22px" }}>
              github.com/Hilo-Hilo/WorldFork
            </div>
            <div>branching social simulation · open source</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#4a9eff",
              fontSize: "26px",
              fontWeight: 700,
            }}
          >
            <span>w</span>
            <span style={{ color: "#4a9eff" }}>/</span>
            <span style={{ color: "#e8e9ec" }}>f</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

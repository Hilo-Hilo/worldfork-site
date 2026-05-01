import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0F141C 0%, #07090d 100%)",
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 102,
          letterSpacing: -2,
          color: "#E8E9EC",
          borderRadius: 36,
          border: "2px solid rgba(74,158,255,0.45)",
        }}
      >
        <span>w</span>
        <span style={{ color: "#4A9EFF" }}>/</span>
        <span>f</span>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LIVV";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#090a0c",
          color: "#f5f5f2",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: "0.28em", fontWeight: 600, opacity: 0.55 }}>
          LIVV
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05, maxWidth: 900 }}>
            A system for a life you can actually live.
          </div>
          <div style={{ fontSize: 28, opacity: 0.55, maxWidth: 720, lineHeight: 1.35 }}>
            Body. Mind. Work. Money. People. Life.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 22, opacity: 0.4, letterSpacing: "0.08em" }}>
          evolvewithlivv.com
        </div>
      </div>
    ),
    { ...size }
  );
}

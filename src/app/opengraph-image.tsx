import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Become more capable in real life. Body, mind, life.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK_PATH = path.join(process.cwd(), "public/brand/icon-flame-l-white.png");

function markDataUrl() {
  return `data:image/png;base64,${readFileSync(MARK_PATH).toString("base64")}`;
}

export default function OpenGraphImage() {
  const mark = markDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(118deg, #080d12 0%, #111a20 48%, #39251b 100%)",
          color: "#f7f5f0",
          padding: "56px 76px 48px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 660,
            height: 660,
            right: -110,
            top: -210,
            borderRadius: 330,
            background: "radial-gradient(circle, rgba(255,135,39,0.42) 0%, rgba(219,93,23,0.12) 40%, rgba(0,0,0,0) 72%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: -100,
            right: -100,
            bottom: -170,
            height: 420,
            background: "linear-gradient(160deg, rgba(4,8,11,0) 0%, rgba(3,6,9,0.82) 68%)",
            transform: "skewY(-7deg)",
          }}
        />
        <div style={{ display: "flex", position: "relative", alignItems: "center", justifyContent: "center", height: 108 }}>
          <img src={mark} width={86} height={108} alt="" />
        </div>
        <div style={{ display: "flex", position: "relative", flexDirection: "column", gap: 24, marginTop: 6 }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 600,
              letterSpacing: "-0.045em",
              lineHeight: 1.04,
              maxWidth: 1000,
            }}
          >
            Become more capable
            <br />
            in real life.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 22, fontWeight: 500, letterSpacing: "0.25em", color: "#f5b17d" }}>
            <span>BODY</span>
            <span style={{ color: "#f47b29" }}>·</span>
            <span>MIND</span>
            <span style={{ color: "#f47b29" }}>·</span>
            <span>LIFE</span>
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", alignItems: "center", fontSize: 18, letterSpacing: "0.08em", color: "rgba(247,245,240,0.58)" }}>
          EVOLVEWITHLIVV.COM
        </div>
      </div>
    ),
    { ...size }
  );
}

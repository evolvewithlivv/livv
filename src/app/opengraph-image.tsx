import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "LIVV";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WORDMARK_PATH = path.join(process.cwd(), "public/brand/wordmark-white.png");

function wordmarkDataUrl() {
  return `data:image/png;base64,${readFileSync(WORDMARK_PATH).toString("base64")}`;
}

export default function OpenGraphImage() {
  const wordmark = wordmarkDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#090a0c",
          color: "#f5f5f2",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 570,
            height: 94,
          }}
        >
          <img src={wordmark} width={570} height={94} alt="" />
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 72,
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "0.22em",
            lineHeight: 1,
            color: "rgba(245,245,242,0.72)",
          }}
        >
          BODY · MIND · LIFE
        </div>
      </div>
    ),
    { ...size }
  );
}

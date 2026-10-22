import fs from "node:fs";
import assert from "node:assert/strict";

const css = fs.readFileSync(new URL("../src/app/livv-motion.css", import.meta.url), "utf8");
const pageMotion = fs.readFileSync(new URL("../src/components/layout/page-motion.tsx", import.meta.url), "utf8");
const countUp = fs.readFileSync(new URL("../src/components/motion/count-up.tsx", import.meta.url), "utf8");
const presence = fs.readFileSync(new URL("../src/components/motion/presence.tsx", import.meta.url), "utf8");
const layout = fs.readFileSync(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const homeLayout = fs.readFileSync(new URL("../src/app/home/layout.tsx", import.meta.url), "utf8");

const tokens = {
  "--livv-dur-fast": 150,
  "--livv-dur-base": 220,
  "--livv-dur-page": 280,
  "--livv-dur-slow": 320,
};

for (const [name, ms] of Object.entries(tokens)) {
  const match = css.match(new RegExp(`${name}:\\s*(\\d+)ms`));
  assert.ok(match, `${name} missing`);
  const value = Number(match[1]);
  assert.ok(value >= 150 && value <= 350, `${name} is ${value}ms, expected 150 to 350`);
  assert.equal(value, ms);
}

assert.match(css, /--livv-ease-out:\s*cubic-bezier\(0\.22, 1, 0\.36, 1\)/);
assert.match(css, /--livv-ease-in-out:\s*cubic-bezier\(0\.4, 0, 0\.2, 1\)/);
assert.match(css, /--livv-ease-spring:\s*cubic-bezier\(0\.2, 0\.9, 0\.2, 1\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /animation:\s*none !important/);
assert.doesNotMatch(css, /blur\(/);
assert.doesNotMatch(css, /radial-gradient|linear-gradient|confetti|bounce/);
assert.match(css, /@keyframes livv-page-in/);
assert.match(css, /@keyframes livv-rise/);
assert.match(css, /@keyframes livv-check/);
assert.match(css, /@keyframes livv-sheet-in/);
assert.match(css, /@keyframes livv-sheet-out/);
assert.match(css, /@keyframes livv-shimmer/);
assert.match(css, /scaleX\(var\(--livv-p/);
assert.match(css, /scaleY\(var\(--livv-p/);

assert.match(pageMotion, /className="livv-page-motion/);
assert.match(pageMotion, /pathname === "\/home"/);
assert.match(layout, /<RouteMotion>/);
assert.match(homeLayout, /<PageMotion>/);
assert.match(countUp, /prefers-reduced-motion: reduce/);
assert.match(countUp, /livv-count-sizer/);
assert.match(presence, /EXIT_MS = 220/);
assert.match(presence, /prefers-reduced-motion: reduce/);

const daily = fs.readFileSync(new URL("../src/app/home/daily/page.tsx", import.meta.url), "utf8");
assert.match(daily, /is-completing/);
assert.match(daily, /livv-bar/);

console.log("motion pass contract ok");

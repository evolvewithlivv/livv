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

const slow = Number(css.match(/--livv-dur-slow:\s*(\d+)ms/)[1]);
const delays = [...css.matchAll(/animation-delay:\s*(\d+)ms/g)].map((match) => Number(match[1]));
assert.ok(delays.length >= 4, "livv-rise delays missing");
assert.match(css, /nth-child\(n \+ 4\)/);
for (const delay of delays) {
  assert.ok(delay + slow <= 350, `livv-rise delay ${delay}ms + ${slow}ms exceeds 350ms`);
}
assert.equal(Math.max(...delays), 30);

assert.match(css, /transform:\s*scale\(0\.985\)/);
assert.match(css, /\.livv-tabbar \.livv-tab \.livv-tab-icon\s*\{[^}]*transition:\s*transform var\(--livv-dur-base\)/);
assert.match(css, /\.livv-tab\.is-active \.livv-tab-icon\s*\{[^}]*transform:\s*translateY\(-1px\)/);
assert.match(css, /\.livv-count\s*\{[^}]*display:\s*inline-grid/);
assert.match(countUp, /livv-count-sizer/);
assert.match(countUp, /livv-count-value/);
assert.match(countUp, /requestAnimationFrame/);

const healthCss = fs.readFileSync(new URL("../src/app/home/health/health-signal.css", import.meta.url), "utf8");
assert.doesNotMatch(healthCss, /linear-gradient|radial-gradient/);
assert.match(healthCss, /\.health-hero\{[^}]*background:rgb\(var\(--livv-surface\)\)/);
assert.match(healthCss, /\.health-hero\{[^}]*margin-top:var\(--livv-ph-gap\)/);
assert.match(healthCss, /\.health-kicker\{[^}]*color:var\(--hh-muted\)/);

const globals = fs.readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
assert.match(globals, /\.livv-landing \.livv-lockup \.auth-flame,\s*\.auth-desk \.livv-lockup \.auth-flame\s*\{[^}]*margin-left:\s*0 !important/);

const shell = fs.readFileSync(new URL("../src/components/layout/theme-shell.tsx", import.meta.url), "utf8");
assert.match(shell, /TAB_ROUTES/);
assert.match(shell, /!isTabRoute/);

for (const file of [
  "src/app/home/loading.tsx",
  "src/app/home/daily/loading.tsx",
  "src/app/home/train/loading.tsx",
  "src/app/home/health/loading.tsx",
  "src/app/home/shop/loading.tsx",
  "src/app/home/profile/loading.tsx",
]) {
  const source = fs.readFileSync(new URL("../" + file, import.meta.url), "utf8");
  assert.match(source, /RouteSkeleton/, file);
}

for (const file of [
  "src/app/home/bulletin/page.tsx",
  "src/components/layout/install-app.tsx",
  "src/components/gamification/milestone-ceremony.tsx",
]) {
  const source = fs.readFileSync(new URL("../" + file, import.meta.url), "utf8");
  assert.match(source, /Presence/, file);
  assert.match(source, /livv-sheet/, file);
}
const moment = fs.readFileSync(new URL("../src/components/ui/moment.tsx", import.meta.url), "utf8");
assert.match(moment, /is-out/);
assert.match(moment, /is-in/);

console.log("motion pass contract ok");

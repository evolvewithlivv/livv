import fs from "node:fs";
import assert from "node:assert/strict";

const css = fs.readFileSync(new URL("../src/app/home/shop/shop-rack.css", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../src/app/home/shop/page.tsx", import.meta.url), "utf8");

const slot = css.match(/\.shop-product-image\{[^}]+\}/);
const photo = css.match(/\.shop-product-image img\{[^}]+\}/);
assert.ok(slot, "shop image slot rule missing");
assert.ok(photo, "shop image rule missing");
assert.match(slot[0], /aspect-ratio:1\/1\.12/);
assert.match(slot[0], /background:rgb\(var\(--livv-surface\)\)/);
assert.doesNotMatch(slot[0], /gradient|shimmer|glow|transparent/);
assert.match(photo[0], /opacity:0/);
assert.match(photo[0], /opacity 200ms/);
assert.match(photo[0], /min-width:0/);
assert.match(photo[0], /min-height:0/);
assert.doesNotMatch(photo[0], /gradient|shimmer|glow/);
assert.match(css, /\.shop-product-image img\.is-loaded\{opacity:1\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\.shop-product-image img,\.shop-embers-progress span\{transition:none\}/);

assert.match(page, /function ShopPhoto/);
assert.match(page, /useLayoutEffect/);
assert.match(page, /className=\{loaded \? "is-loaded" : undefined\}/);
assert.match(page, /width=\{250\}/);
assert.match(page, /height=\{280\}/);
assert.match(page, /onLoad=\{\(\) => setLoaded\(true\)\}/);
assert.doesNotMatch(page, /prefetch=\{false\}/);
assert.doesNotMatch(page, /—/);
assert.doesNotMatch(page, /shimmer|linear-gradient|radial-gradient/);

console.log("shop image slots passed");

import fs from "node:fs";
import assert from "node:assert/strict";

const css = fs.readFileSync(new URL("../src/app/home/profile/profile-signal.css", import.meta.url), "utf8");
const page = fs.readFileSync(new URL("../src/app/home/profile/page.tsx", import.meta.url), "utf8");

assert.match(page, /<strong className="you-record-num"><CountUp value=\{rec\.streak \|\| 0\} \/><\/strong>/);
assert.match(page, /<strong className="you-record-num">\{rec\.workoutsCompleted \|\| 0\}<\/strong>/);
assert.match(page, /<strong className="you-record-num">\{todayDone\}<\/strong>/);
assert.match(page, /CountUp value=\{rec\.streak/);
assert.doesNotMatch(page, /—/);

const numeral = css.match(/\.you-record-num,\s*\.you-record-num \.livv-count > span\s*\{[^}]+\}/);
assert.ok(numeral, "shared record numeral rule missing");
assert.match(numeral[0], /font-size:\s*1\.85rem/);
assert.match(numeral[0], /font-weight:\s*650/);
assert.match(numeral[0], /line-height:\s*1/);
assert.match(css, /\.you-record-num\s*\{[^}]*display:\s*block/);
assert.match(css, /\.you-record-num \.livv-count\s*\{[^}]*vertical-align:\s*baseline/);
assert.match(css, /\.you-record > div > span\s*\{/);
assert.doesNotMatch(css, /\.you-record span\s*\{/);
assert.match(css, /\.you-record\s*\{[^}]*align-items:\s*start/);

console.log("you record numerals passed");

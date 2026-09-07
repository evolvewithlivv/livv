import { readFile, writeFile } from "node:fs/promises";

const file = "src/app/home/connect/page.tsx";
const source = await readFile(file, "utf8");

// Guard against the malformed closing tag introduced in the Connect page.
// The matching opening element is a <div className="px-5 pt-5"> wrapper.
const malformed = "          </header>";
const fixed = "          </div>";

if (source.includes(malformed)) {
  await writeFile(file, source.replace(malformed, fixed), "utf8");
  console.log(`Prepared ${file}: repaired unmatched </header>.`);
} else {
  console.log(`Prepared ${file}: no malformed closing tag found.`);
}

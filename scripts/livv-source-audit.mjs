import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const skip=new Set([".git","node_modules",".next"]);
const files=[];
function walk(dir){for(const name of fs.readdirSync(dir)){if(skip.has(name))continue;const p=path.join(dir,name),s=fs.statSync(p);if(s.isDirectory())walk(p);else if(/\.(tsx?|css|json|md)$/.test(name))files.push(p)}}
walk(root);
const palette=["#0F7FFF","#FCF927","#F93827","#F61981","#9A00FF","#4DFF00","#FF9D23"].map(x=>x.toLowerCase());
const violations=[];
for(const file of files){const text=fs.readFileSync(file,"utf8");for(const m of text.matchAll(/#[0-9a-fA-F]{6}\b/g)){const hex=m[0].toLowerCase();if(!palette.includes(hex)&&!file.endsWith("package.json"))violations.push(`${path.relative(root,file)}: ${m[0]}`)}}
const dashes=[];for(const file of files){const text=fs.readFileSync(file,"utf8");if(text.includes("—"))dashes.push(path.relative(root,file))}
if(violations.length||dashes.length){console.error("LIVV source audit failed");if(violations.length)console.error("Off-palette hex values:\n"+violations.join("\n"));if(dashes.length)console.error("Em dash found:\n"+dashes.join("\n"));process.exit(1)}
console.log(`LIVV source audit passed: ${files.length} source files checked.`);

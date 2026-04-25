import sharp from "sharp";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const svgPath = resolve(projectRoot, "brand/svg/og-image.svg");
const svg = readFileSync(svgPath);

const targets = [
  { path: resolve(projectRoot, "site/public/og-image.png"), width: 1200, height: 630 },
  { path: resolve(projectRoot, "brand/svg/png/og-image.png"), width: 1200, height: 630 },
  { path: resolve(projectRoot, "brand/svg/png/og-image@2x.png"), width: 2400, height: 1260 },
];

for (const t of targets) {
  await sharp(svg, { density: Math.round((t.width / 1200) * 96) })
    .resize(t.width, t.height)
    .png()
    .toFile(t.path);
  console.log(`wrote ${t.path}`);
}

import sharp from "sharp";
import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "../..");
const svgPath = resolve(projectRoot, "brand/svg/og-image.svg");
const fontPath = resolve(projectRoot, "brand/Fonts/Cal_Sans/CalSans-Regular.ttf");

const SUBLINE = "Driven people, on the trail, in good company.";
const SUBLINE_X = 60;
const SUBLINE_Y = 490;
const SUBLINE_SIZE = 20;
const SUBLINE_FILL = "#5A5650";

const font = opentype.loadSync(fontPath);
const path = font.getPath(SUBLINE, SUBLINE_X, SUBLINE_Y, SUBLINE_SIZE);
const sublinePathData = path.toPathData(2);
const sublineFragment = `<path d="${sublinePathData}" fill="${SUBLINE_FILL}"/>`;

let svg = readFileSync(svgPath, "utf8");
svg = svg.replace(
  /<!-- subline:start -->[\s\S]*?<!-- subline:end -->/,
  `<!-- subline:start -->\n${sublineFragment}\n<!-- subline:end -->`
);
writeFileSync(svgPath, svg);

const targets = [
  { path: resolve(projectRoot, "site/public/og-image.png"), width: 1200, height: 630 },
  { path: resolve(projectRoot, "brand/svg/png/og-image.png"), width: 1200, height: 630 },
  { path: resolve(projectRoot, "brand/svg/png/og-image@2x.png"), width: 2400, height: 1260 },
];

for (const t of targets) {
  await sharp(Buffer.from(svg), { density: Math.round((t.width / 1200) * 96) })
    .resize(t.width, t.height)
    .png()
    .toFile(t.path);
  console.log(`wrote ${t.path}`);
}

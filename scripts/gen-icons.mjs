// Render the app icon PNGs from public/icon.svg. Run after changing the SVG:
//   pnpm gen:icons
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = await readFile(join(pub, "icon.svg"));

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of targets) {
  const png = await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(join(pub, name), png);
  console.log(`✓ ${name} (${size}×${size})`);
}

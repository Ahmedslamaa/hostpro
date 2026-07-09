/**
 * Génère tous les PNG d'icônes PWA à partir de icon-source.svg
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dir, "../public");
const svgPath = resolve(publicDir, "icon-source.svg");

if (!existsSync(svgPath)) {
  console.error("icon-source.svg not found in public/");
  process.exit(1);
}

const svgBuffer = readFileSync(svgPath);

// Standard icons (any purpose)
const SIZES = [16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512];

// Maskable icons need extra safe-zone padding (20% each side → resize to 60% of canvas)
const MASKABLE = [192, 512];

async function gen(size, outPath, options = {}) {
  const { maskable = false } = options;

  let pipeline = sharp(svgBuffer, { density: 300 });

  if (maskable) {
    // For maskable: place icon at 60% scale centered on the full background colour
    const innerSize = Math.round(size * 0.6);
    const padding = Math.round((size - innerSize) / 2);
    const innerBuf = await sharp(svgBuffer, { density: 300 })
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();

    pipeline = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 30, g: 8, b: 53, alpha: 1 }, // matches SVG bg #1E0835
      },
    }).composite([{ input: innerBuf, top: padding, left: padding }]);
  } else {
    pipeline = pipeline.resize(size, size);
  }

  await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`  ✓ ${outPath.split("public\\").pop() ?? outPath.split("public/").pop()}`);
}

async function main() {
  console.log("Generating icons from icon-source.svg…\n");

  // Standard PNGs
  for (const size of SIZES) {
    const name = size === 16 ? "icon-16.png"
      : size === 32 ? "icon-32.png"
      : `icon-${size}.png`;
    await gen(size, resolve(publicDir, name));
  }

  // Maskable PNGs
  for (const size of MASKABLE) {
    await gen(size, resolve(publicDir, `icon-maskable-${size}.png`), { maskable: true });
  }

  // Apple touch icon (180px, no rounded corners — OS clips it)
  console.log("\nApple touch / og…");
  await sharp(svgBuffer, { density: 300 })
    .resize(180, 180)
    .png()
    .toFile(resolve(publicDir, "icon-180.png"));
  console.log("  ✓ icon-180.png (apple-touch-icon)");

  // Favicon 32×32 (ICO-like, but PNG works for modern browsers)
  // The actual .ico needs a special lib; we leave favicon.ico pointing to icon-32.png
  // via layout metadata instead.

  console.log("\n✓ All icons generated!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

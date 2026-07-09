/**
 * Génère favicon.ico (multi-size: 16 + 32 + 48) depuis icon-source.svg
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dir, "../public");
const svgBuffer = readFileSync(resolve(publicDir, "icon-source.svg"));

async function svgToPng(size) {
  return sharp(svgBuffer, { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
}

function buildIco(pngBuffers) {
  const HEADER_SIZE = 6;
  const DIR_ENTRY_SIZE = 16;
  const sizes = pngBuffers.map((b) => b.length);
  const count = pngBuffers.length;

  // Calculate offsets
  const dataOffset = HEADER_SIZE + DIR_ENTRY_SIZE * count;
  const offsets = [];
  let cur = dataOffset;
  for (const s of sizes) { offsets.push(cur); cur += s; }

  const total = cur;
  const buf = Buffer.alloc(total);
  let pos = 0;

  // ICO Header
  buf.writeUInt16LE(0, pos); pos += 2; // reserved
  buf.writeUInt16LE(1, pos); pos += 2; // type: 1 = ICO
  buf.writeUInt16LE(count, pos); pos += 2; // count

  // Directory entries
  const ICON_SIZES = [16, 32, 48];
  for (let i = 0; i < count; i++) {
    const sz = ICON_SIZES[i];
    buf.writeUInt8(sz === 256 ? 0 : sz, pos); pos++; // width
    buf.writeUInt8(sz === 256 ? 0 : sz, pos); pos++; // height
    buf.writeUInt8(0, pos); pos++;  // color count
    buf.writeUInt8(0, pos); pos++;  // reserved
    buf.writeUInt16LE(1, pos); pos += 2; // planes
    buf.writeUInt16LE(32, pos); pos += 2; // bit count
    buf.writeUInt32LE(sizes[i], pos); pos += 4; // size of image data
    buf.writeUInt32LE(offsets[i], pos); pos += 4; // offset of image data
  }

  // Image data
  for (const png of pngBuffers) {
    png.copy(buf, pos); pos += png.length;
  }

  return buf;
}

async function main() {
  console.log("Generating favicon.ico (16 + 32 + 48 px)…");
  const [p16, p32, p48] = await Promise.all([
    svgToPng(16), svgToPng(32), svgToPng(48),
  ]);
  const ico = buildIco([p16, p32, p48]);
  writeFileSync(resolve(publicDir, "favicon.ico"), ico);
  console.log("✓ favicon.ico written");
}

main().catch((e) => { console.error(e); process.exit(1); });

import { deflateSync, inflateSync } from "node:zlib";

const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out[4] = type.charCodeAt(0);
  out[5] = type.charCodeAt(1);
  out[6] = type.charCodeAt(2);
  out[7] = type.charCodeAt(3);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodeRgba(png: Uint8Array): { width: number; height: number; pixels: Uint8Array } {
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (png[i] !== PNG_SIGNATURE[i]) throw new Error("Not a PNG");
  }
  let width = 0;
  let height = 0;
  let depth = 0;
  let color = 0;
  let interlace = 0;
  const idat: Uint8Array[] = [];
  let offset = 8;
  while (offset + 8 <= png.length) {
    const length = new DataView(png.buffer, png.byteOffset + offset, 4).getUint32(0);
    const type = String.fromCharCode(png[offset + 4], png[offset + 5], png[offset + 6], png[offset + 7]);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      width = view.getUint32(0);
      height = view.getUint32(4);
      depth = data[8];
      color = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  if (depth !== 8 || color !== 6 || interlace !== 0) {
    throw new Error("Only 8-bit non-interlaced RGBA PNGs can be resized");
  }
  const compressed = new Uint8Array(idat.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of idat) {
    compressed.set(part, cursor);
    cursor += part.length;
  }
  const raw = inflateSync(compressed);
  const bpp = 4;
  const stride = width * bpp;
  const pixels = new Uint8Array(width * height * bpp);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = src;
    src += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= bpp ? pixels[y * stride + x - bpp] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= bpp ? pixels[(y - 1) * stride + x - bpp] : 0;
      const value = raw[row + x];
      let out = value;
      if (filter === 1) out = (value + left) & 255;
      else if (filter === 2) out = (value + up) & 255;
      else if (filter === 3) out = (value + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) out = (value + paeth(left, up, upLeft)) & 255;
      else if (filter !== 0) throw new Error("Unsupported PNG filter");
      pixels[y * stride + x] = out;
    }
  }
  return { width, height, pixels };
}

function scaleRgba(src: Uint8Array, sw: number, sh: number, dw: number, dh: number): Uint8Array {
  const dst = new Uint8Array(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const sy = ((y + 0.5) * sh) / dh - 0.5;
    const y0 = Math.max(0, Math.floor(sy));
    const y1 = Math.min(sh - 1, y0 + 1);
    const fy = Math.max(0, sy - y0);
    for (let x = 0; x < dw; x++) {
      const sx = ((x + 0.5) * sw) / dw - 0.5;
      const x0 = Math.max(0, Math.floor(sx));
      const x1 = Math.min(sw - 1, x0 + 1);
      const fx = Math.max(0, sx - x0);
      const i = (y * dw + x) * 4;
      for (let c = 0; c < 4; c++) {
        const p00 = src[(y0 * sw + x0) * 4 + c];
        const p10 = src[(y0 * sw + x1) * 4 + c];
        const p01 = src[(y1 * sw + x0) * 4 + c];
        const p11 = src[(y1 * sw + x1) * 4 + c];
        const value =
          p00 * (1 - fx) * (1 - fy) +
          p10 * fx * (1 - fy) +
          p01 * (1 - fx) * fy +
          p11 * fx * fy;
        dst[i + c] = Math.max(0, Math.min(255, Math.round(value)));
      }
    }
  }
  return dst;
}

function encodeRgba(width: number, height: number, pixels: Uint8Array): Uint8Array {
  const stride = width * 4;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const start = y * (stride + 1);
    raw[start] = 0;
    raw.set(pixels.subarray(y * stride, (y + 1) * stride), start + 1);
  }
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw);
  const parts = [PNG_SIGNATURE, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", new Uint8Array())];
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

const scaled = new Map<string, Uint8Array>();

/** Resize an 8-bit RGBA PNG so the bytes match the size declared in the manifest. */
export function resizePng(png: Uint8Array, size: number): Uint8Array {
  const target = Math.max(1, Math.round(size));
  const key = `${target}:${png.byteLength}`;
  const cached = scaled.get(key);
  if (cached) return cached;
  const decoded = decodeRgba(png);
  if (decoded.width === target && decoded.height === target) {
    scaled.set(key, png);
    return png;
  }
  const pixels = scaleRgba(decoded.pixels, decoded.width, decoded.height, target, target);
  const encoded = encodeRgba(target, target, pixels);
  scaled.set(key, encoded);
  return encoded;
}

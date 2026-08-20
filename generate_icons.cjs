const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function writePNG(width, height, rgbaBuffer) {
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image scanlines with filter byte (0 = None) at start of each line
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let srcOffset = 0;
  let dstOffset = 0;
  for (let y = 0; y < height; y++) {
    rawData[dstOffset++] = 0; // Filter byte: None
    rgbaBuffer.copy(rawData, dstOffset, srcOffset, srcOffset + width * 4);
    dstOffset += width * 4;
    srcOffset += width * 4;
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function drawHanssonIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);

  // Helper to set pixel RGBA with bounds check and alpha blending
  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size || a <= 0) return;
    const idx = (y * size + x) * 4;
    if (a >= 255) {
      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = 255;
    } else {
      const srcA = a / 255;
      const dstA = buf[idx + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA > 0) {
        buf[idx] = Math.round((r * srcA + buf[idx] * dstA * (1 - srcA)) / outA);
        buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA);
        buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA);
        buf[idx + 3] = Math.round(outA * 255);
      }
    }
  }

  // Draw background gradient
  for (let y = 0; y < size; y++) {
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const diag = (nx + ny) * 0.5;

      // Dark slate navy gradient (#0f172a to #0369a1)
      const r = Math.round(15 * (1 - diag) + 10 * diag);
      const g = Math.round(23 * (1 - diag) + 40 * diag);
      const b = Math.round(42 * (1 - diag) + 70 * diag);
      setPixel(x, y, r, g, b, 255);
    }
  }

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 512;

  // Draw decorative circles
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dist - 170 * scale) < 1.5 * scale) {
        setPixel(x, y, 56, 189, 248, 60);
      }
    }
  }

  // Shield function: returns true if point is inside shield
  function inShield(px, py, inset = 0) {
    const sx = (px - cx) / scale;
    const sy = (py - (cy - 10 * scale)) / scale; // center shield vertically

    if (sy < -180 + inset) return false;
    if (sy > 180 - inset) return false;

    // Width decreases as sy increases downwards
    let maxWidth = 150 - inset;
    if (sy < -100) {
      // Top curved curve
      const topT = (-100 - sy) / (80 - inset);
      maxWidth = 150 - topT * topT * 30 - inset;
    } else if (sy > 0) {
      // Bottom tapering point
      const botT = sy / 180;
      maxWidth = (150 - inset) * (1 - Math.pow(botT, 1.4));
    }

    return Math.abs(sx) <= Math.max(0, maxWidth);
  }

  // Draw Shield Outer Border & Fill
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inShield(x, y, 0)) {
        if (!inShield(x, y, 14)) {
          // Shield Border (Cyan / Blue gradient)
          const t = y / size;
          const r = Math.round(56 * (1 - t) + 2 * t);
          const g = Math.round(189 * (1 - t) + 132 * t);
          const b = Math.round(248 * (1 - t) + 199 * t);
          setPixel(x, y, r, g, b, 255);
        } else {
          // Shield Inner (Dark Navy background #0f172a with subtle inner gradient)
          const t = y / size;
          const r = Math.round(15 + 10 * t);
          const g = Math.round(23 + 15 * t);
          const b = Math.round(42 + 25 * t);
          setPixel(x, y, r, g, b, 255);
        }
      }
    }
  }

  // Draw Smart Node Circuit Lines
  function drawLine(x0, y0, x1, y1, r, g, b, a, width) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(len * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lx = x0 + dx * t;
      const ly = y0 + dy * t;
      for (let ox = -width; ox <= width; ox++) {
        for (let oy = -width; oy <= width; oy++) {
          if (ox * ox + oy * oy <= width * width) {
            setPixel(Math.round(lx + ox), Math.round(ly + oy), r, g, b, a);
          }
        }
      }
    }
  }

  function drawCircle(px, py, radius, r, g, b, a) {
    for (let y = Math.floor(py - radius - 1); y <= Math.ceil(py + radius + 1); y++) {
      for (let x = Math.floor(px - radius - 1); x <= Math.ceil(px + radius + 1); x++) {
        const dx = x - px;
        const dy = y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          setPixel(x, y, r, g, b, a);
        }
      }
    }
  }

  const s = scale;
  const cyOff = cy - 10 * s;

  // Nodes
  drawLine(cx, cyOff - 120 * s, cx, cyOff - 80 * s, 56, 189, 248, 180, 2 * s);
  drawLine(cx - 70 * s, cyOff - 40 * s, cx - 35 * s, cyOff - 20 * s, 56, 189, 248, 180, 2 * s);
  drawLine(cx + 70 * s, cyOff - 40 * s, cx + 35 * s, cyOff - 20 * s, 56, 189, 248, 180, 2 * s);
  drawLine(cx, cyOff + 60 * s, cx, cyOff + 110 * s, 56, 189, 248, 180, 2 * s);

  drawCircle(cx, cyOff - 120 * s, 5 * s, 56, 189, 248, 255);
  drawCircle(cx - 70 * s, cyOff - 40 * s, 5 * s, 56, 189, 248, 255);
  drawCircle(cx + 70 * s, cyOff - 40 * s, 5 * s, 56, 189, 248, 255);
  drawCircle(cx, cyOff + 110 * s, 5 * s, 56, 189, 248, 255);

  // Large Glowing Emerald Checkmark in the center
  const checkPts = [
    { x: cx - 45 * s, y: cyOff - 5 * s },
    { x: cx - 10 * s, y: cyOff + 30 * s },
    { x: cx + 55 * s, y: cyOff - 45 * s }
  ];

  // Draw thick checkmark line with glow
  const checkWidth = Math.max(2, 10 * s);
  // Outer glow
  drawLine(checkPts[0].x, checkPts[0].y, checkPts[1].x, checkPts[1].y, 52, 211, 153, 90, checkWidth * 1.5);
  drawLine(checkPts[1].x, checkPts[1].y, checkPts[2].x, checkPts[2].y, 52, 211, 153, 90, checkWidth * 1.5);
  // Main stroke
  drawLine(checkPts[0].x, checkPts[0].y, checkPts[1].x, checkPts[1].y, 52, 211, 153, 255, checkWidth);
  drawLine(checkPts[1].x, checkPts[1].y, checkPts[2].x, checkPts[2].y, 52, 211, 153, 255, checkWidth);

  return writePNG(size, size, buf);
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const publicDir = path.join(__dirname, 'public');

console.log('Generating PWA icons...');

const sizes = [
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-192-maskable.png', size: 192, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'icon-144.png', size: 144, maskable: false },
  { name: 'icon-96.png', size: 96, maskable: false },
  { name: 'icon-72.png', size: 72, maskable: false },
  { name: 'favicon-32x32.png', size: 32, maskable: false },
  { name: 'favicon-16x16.png', size: 16, maskable: false },
];

for (const { name, size, maskable } of sizes) {
  const pngData = drawHanssonIcon(size, maskable);
  fs.writeFileSync(path.join(iconsDir, name), pngData);
  // Also place in public root for direct fallback
  if (['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-32x32.png'].includes(name)) {
    fs.writeFileSync(path.join(publicDir, name), pngData);
  }
  console.log(`Generated ${name} (${size}x${size})`);
}

// Copy icon.svg to public root as well
const svgSource = path.join(iconsDir, 'icon.svg');
if (fs.existsSync(svgSource)) {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), fs.readFileSync(svgSource));
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), fs.readFileSync(svgSource));
}

console.log('All icons generated successfully!');

// detect-bound.js
const { spawn } = require('child_process');
const Jimp = require('jimp');

/**
 * Parse bounds string like:
 *   "[0,275][1080,2232]" → {x,y,w,h}
 *   "0,275,1080,2232"   → {x,y,w,h}
 */
function parseBounds(bounds) {
    const m = bounds.match(/(-?\d+),\s*(-?\d+)\]\s*\[?\s*(-?\d+),\s*(-?\d+)/);
    if (m) {
      const x1 = Number(m[1]), y1 = Number(m[2]),
          x2 = Number(m[3]), y2 = Number(m[4]);
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
    const parts = bounds.split(/[, \t]+/).map(Number).filter(n => !isNaN(n));
    if (parts.length === 4) {
        const [x1, y1, x2, y2] = parts;
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
    throw new Error("Bad bounds format: " + bounds);
}

/**
 * Capture screenshot into Buffer
 */
function captureScreenshot(deviceSerial) {
    return new Promise((resolve, reject) => {
      const args = deviceSerial
          ? ['-s', deviceSerial, 'exec-out', 'screencap', '-p']
          : ['exec-out', 'screencap', '-p'];
      const adb = spawn('adb', args);

      const chunks = [];
      adb.stdout.on('data', (c) => chunks.push(c));
      adb.stderr.on('data', (c) => console.error(c.toString()));
      adb.on('error', reject);
      adb.on('close', () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Capture screenshot and process
 * mode = "annotate" → full screenshot with rectangle
 * mode = "crop"     → just cropped region
 */
async function captureAndProcess(bounds, outPath, mode = 'annotate', opts = {}) {
    const { deviceSerial, strokeColor = 0xFF0000FF, strokeWidth = 5 } = opts;
    const b = parseBounds(bounds);

    const buf = await captureScreenshot(deviceSerial);
    let img = await Jimp.read(buf);

    if (mode === 'crop') {
      img = img.crop(b.x, b.y, b.w, b.h);
  } else {
      // draw rectangle (only stroke)
      for (let i = 0; i < strokeWidth; i++) {
          img.scan(b.x, b.y + i, b.w, 1, (_, __, ___, idx) => {
              img.bitmap.data.writeUInt32BE(strokeColor, idx);
          });
          img.scan(b.x, b.y + b.h - i - 1, b.w, 1, (_, __, ___, idx) => {
              img.bitmap.data.writeUInt32BE(strokeColor, idx);
          });
          img.scan(b.x + i, b.y, 1, b.h, (_, __, ___, idx) => {
              img.bitmap.data.writeUInt32BE(strokeColor, idx);
          });
          img.scan(b.x + b.w - i - 1, b.y, 1, b.h, (_, __, ___, idx) => {
              img.bitmap.data.writeUInt32BE(strokeColor, idx);
          });
      }
  }

    await img.writeAsync(outPath);
    return { saved: outPath, mode, rect: b };
}

// CLI runner
if (require.main === module) {
    (async () => {
      const [mode, bounds, outPath, deviceSerial] = process.argv.slice(2);
      if (!mode || !bounds || !outPath) {
          console.log("Usage: node detect-bound.js <annotate|crop> <bounds> <outPath> [deviceSerial]");
          console.log('Example: node detect-bound.js annotate "[0,275][1080,2232]" /sdcard/highlight.png');
          process.exit(1);
      }
      try {
          const res = await captureAndProcess(bounds, outPath, mode, { deviceSerial });
        console.log("Saved:", res);
    } catch (e) {
          console.error("Error:", e);
      }
  })();
}

module.exports = { captureAndProcess };

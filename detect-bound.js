// adb-screenshot.js
const { spawn } = require('child_process');
const fs = require('fs');
const sharp = require('sharp');

/**
 * Parse bounds passed as either:
 * - array [x1,y1,x2,y2]
 * - string "[0,275][1080,2232]" or "0,275,1080,2232"
 */
function parseBounds(bounds) {
    if (Array.isArray(bounds) && bounds.length === 4) {
        const [x1, y1, x2, y2] = bounds.map(Number);
        return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    }
    if (typeof bounds === 'string') {
        // try pattern like [0,275][1080,2232]
        const m = bounds.match(/(-?\d+),\s*(-?\d+)\]\s*\[?\s*(-?\d+),\s*(-?\d+)/);
        if (m) {
            const x1 = Number(m[1]), y1 = Number(m[2]), x2 = Number(m[3]), y2 = Number(m[4]);
            return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        }
        // fallback comma separated
        const parts = bounds.split(/[, \t]+/).map(Number).filter(n => !Number.isNaN(n));
        if (parts.length === 4) {
            const [x1, y1, x2, y2] = parts;
            return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        }
    }
    throw new Error('Invalid bounds format. Provide [x1,y1,x2,y2] or "[x1,y1][x2,y2]" or "x1,y1,x2,y2"');
}

/**
 * Capture a PNG screenshot from device using adb exec-out screencap -p
 * Returns a Buffer.
 */
function captureScreenshotViaAdb(deviceSerial) {
    return new Promise((resolve, reject) => {
        const args = deviceSerial ? ['-s', deviceSerial, 'exec-out', 'screencap', '-p']
            : ['exec-out', 'screencap', '-p'];
        const adb = spawn('adb', args);

        const chunks = [];
        let errBuf = [];
        adb.stdout.on('data', (c) => chunks.push(c));
        adb.stderr.on('data', (c) => errBuf.push(c));
        adb.on('error', (err) => reject(err));
        adb.on('close', (code) => {
            if (code !== 0 && errBuf.length) {
                return reject(new Error(Buffer.concat(errBuf).toString('utf8')));
            }
            resolve(Buffer.concat(chunks));
        });
    });
}

/**
 * Main function
 * mode: 'annotate' | 'crop'
 * bounds: [x1,y1,x2,y2] or string like "[0,275][1080,2232]"
 * outPath: file path to write image
 * opts: { deviceSerial, strokeWidth, strokeColor }
 */
async function captureAndProcess(bounds, outPath, mode = 'annotate', opts = {}) {
    const { deviceSerial, strokeWidth = 8, strokeColor = 'rgba(255,0,0,0.9)' } = opts;
    const b = parseBounds(bounds);

    // 1) capture png buffer via adb
    const pngBuf = await captureScreenshotViaAdb(deviceSerial);

    // load image into sharp to get dimensions (ensures validity)
    const img = sharp(pngBuf);
    const meta = await img.metadata();

    // sanitize crop region inside image bounds
    const left = Math.max(0, Math.min(b.x, meta.width - 1));
    const top = Math.max(0, Math.min(b.y, meta.height - 1));
    const width = Math.max(1, Math.min(b.w, meta.width - left));
    const height = Math.max(1, Math.min(b.h, meta.height - top));

    if (mode === 'crop') {
        await img.extract({ left, top, width, height }).png().toFile(outPath);
        return { path: outPath, mode: 'crop', rect: { left, top, width, height } };
    }

    // mode === 'annotate' -> create SVG overlay containing a rectangle
    const svg = `
  <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
    <rect x="${left}" y="${top}" width="${width}" height="${height}"
      fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" />
  </svg>`.trim();

    await img
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png()
        .toFile(outPath);

    return { path: outPath, mode: 'annotate', rect: { left, top, width, height }, metadata: meta };
}

// CLI convenience
if (require.main === module) {
    (async () => {
        const argv = process.argv.slice(2);
        if (argv.length < 3) {
            console.log('Usage: node detect-bound.js <mode:annotate|crop> <bounds> <outPath> [deviceSerial]');
            console.log('Example: node detect-bound.js annotate "[0,275][1080,2232]" out.png');
            process.exit(1);
        }
        const [mode, bounds, outPath, deviceSerial] = argv;
        try {
            const res = await captureAndProcess(bounds, outPath, mode, { deviceSerial });
            console.log('Saved:', res);
        } catch (e) {
            console.error('Error:', e.message || e);
            process.exit(2);
        }
    })();
}

module.exports = { captureAndProcess, parseBounds };

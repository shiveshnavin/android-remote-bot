"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectBounds = detectBounds;
// detect-bounds.ts
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
function parseBounds(input) {
    const m = input.trim().match(/^\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]\s*$/);
    if (!m)
        throw new Error(`Invalid bounds: "${input}". Expected: "[x1,y1][x2,y2]"`);
    const [, a, b, c, d] = m;
    const x1 = +a, y1 = +b, x2 = +c, y2 = +d;
    if (x2 < x1 || y2 < y1)
        throw new Error("Invalid bounds: bottom-right must be >= top-left");
    return { x1, y1, x2, y2 };
}
function mkDrawBoxFilter(b, fillOpacity = 0.35, borderPx = 4, color = "red") {
    const w = b.x2 - b.x1 + 1;
    const h = b.y2 - b.y1 + 1;
    const fill = `drawbox=x=${b.x1}:y=${b.y1}:w=${w}:h=${h}:color=${color}@${fillOpacity}:t=fill`;
    const border = `drawbox=x=${b.x1}:y=${b.y1}:w=${w}:h=${h}:color=${color}@1:t=${borderPx}`;
    return `${fill},${border}`;
}
/**
 * Capture a screenshot with adb and mark bounds using ffmpeg.
 *
 * @param boundsStr e.g. "[0,1524][1720,2364]"
 * @param markedTargetFile optional output file; default: ./workspace/dump_marked.png
 * @returns absolute path of marked file
 */
async function detectBounds(boundsStr, markedTargetFile) {
    const b = parseBounds(boundsStr);
    const workspaceDir = (0, path_1.resolve)("./workspace");
    (0, fs_1.mkdirSync)(workspaceDir, { recursive: true });
    const dumpPath = (0, path_1.join)(workspaceDir, "dump.png");
    const markedPath = (0, path_1.resolve)(markedTargetFile ?? (0, path_1.join)(workspaceDir, "dump_marked.png"));
    // Step 1: adb screenshot → dump.png
    const { stdout } = await execFileAsync("adb", ["exec-out", "screencap", "-p"], {
        encoding: "buffer",
        maxBuffer: 1024 * 1024 * 64
    });
    (0, fs_1.writeFileSync)(dumpPath, stdout);
    // Step 2: ffmpeg → dump_marked.png
    const vf = mkDrawBoxFilter(b);
    await new Promise((resolvePromise, reject) => {
        const ff = (0, child_process_1.spawn)("ffmpeg", ["-y", "-i", dumpPath, "-vf", vf, markedPath], { stdio: "inherit" });
        ff.on("error", reject);
        ff.on("close", (code) => {
            if (code === 0)
                resolvePromise();
            else
                reject(new Error(`ffmpeg exited with code ${code}`));
        });
    });
    return markedPath;
}
// CLI usage: ts-node detect-bounds.ts "[x1,y1][x2,y2]" [optionalTargetFile]
if (require.main === module) {
    const [, , boundsStr, targetFile] = process.argv;
    if (!boundsStr) {
        console.error("Usage: ts-node detect-bounds.ts \"[x1,y1][x2,y2]\" [markedTargetFile]");
        process.exit(1);
    }
    detectBounds(boundsStr, targetFile)
        .then((out) => console.log(`Saved marked image: ${out}`))
        .catch((err) => {
        console.error("Error:", err);
        process.exit(1);
    });
}

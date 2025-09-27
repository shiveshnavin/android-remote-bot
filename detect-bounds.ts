// detect-bounds.ts
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { execFile, spawn } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type Bounds = { x1: number; y1: number; x2: number; y2: number };

function parseBounds(input: string): Bounds {
    const m = input.trim().match(/^\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]\s*$/);
    if (!m) throw new Error(`Invalid bounds: "${input}". Expected: "[x1,y1][x2,y2]"`);
    const [, a, b, c, d] = m;
    const x1 = +a, y1 = +b, x2 = +c, y2 = +d;
    if (x2 < x1 || y2 < y1) throw new Error("Invalid bounds: bottom-right must be >= top-left");
    return { x1, y1, x2, y2 };
}

function mkDrawBoxFilter(b: Bounds, fillOpacity = 0.35, borderPx = 4, color = "red") {
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
export async function detectBounds(boundsStr: string, markedTargetFile?: string): Promise<string> {
    const b = parseBounds(boundsStr);

    const workspaceDir = resolve("./workspace");
    mkdirSync(workspaceDir, { recursive: true });

    const dumpPath = join(workspaceDir, "dump.png");
    const markedPath = resolve(markedTargetFile ?? join(workspaceDir, "dump_marked.png"));

    console.log("Capturing screenshot...");
    // Step 1: adb → dump.png
    const { stdout } = await execFileAsync("adb", ["exec-out", "screencap", "-p"], {
        encoding: "buffer",
        maxBuffer: 1024 * 1024 * 64
    });
    writeFileSync(dumpPath, stdout);

    console.log("Marking bounds with ffmpeg...");
    // Step 2: ffmpeg → dump_marked.png
    const vf = mkDrawBoxFilter(b);
    await new Promise<void>((resolvePromise, reject) => {
        const ff = spawn("ffmpeg", ["-y", "-i", dumpPath, "-vf", vf, markedPath]
            // , { stdio: "inherit" }
        );
        ff.on("error", reject);
        ff.on("close", (code) => {
            if (code === 0) resolvePromise();
            else reject(new Error(`ffmpeg exited with code ${code}`));
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

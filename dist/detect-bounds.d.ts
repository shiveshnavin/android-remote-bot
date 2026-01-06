/**
 * Capture a screenshot with adb and mark bounds using ffmpeg.
 *
 * @param boundsStr e.g. "[0,1524][1720,2364]"
 * @param markedTargetFile optional output file; default: ./workspace/dump_marked.png
 * @returns absolute path of marked file
 */
export declare function detectBounds(boundsStr: string, markedTargetFile?: string): Promise<string>;

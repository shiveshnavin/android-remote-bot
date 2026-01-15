export declare const PipelaneUtils: {
    generatePipelaneId(pipelaneName: string): string;
    generatePipelaneTaskId(pipelaneName: string, pipeTaskName: string): string;
    /**
     * Removes all special characters and spaces from a string, leaving only alphanumeric characters.
     * replaces them with optional replacement character (default is underscore).
     * @param str
     * @param replacementChar
     * @param str
     * @returns
     */
    refineString(str: string | null | undefined, replacementChar?: string): string;
};

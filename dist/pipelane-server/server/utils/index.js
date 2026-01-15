"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelaneUtils = void 0;
exports.PipelaneUtils = {
    generatePipelaneId(pipelaneName) {
        return `${exports.PipelaneUtils.refineString(pipelaneName)}`;
    },
    generatePipelaneTaskId(pipelaneName, pipeTaskName) {
        return `${exports.PipelaneUtils.refineString(pipelaneName)}::${exports.PipelaneUtils.refineString(pipeTaskName)}`;
    },
    /**
     * Removes all special characters and spaces from a string, leaving only alphanumeric characters.
     * replaces them with optional replacement character (default is underscore).
     * @param str
     * @param replacementChar
     * @param str
     * @returns
     */
    refineString(str, replacementChar = '-') {
        if (!str)
            return '';
        return str.replace(/[^a-zA-Z0-9]/g, replacementChar);
    }
};

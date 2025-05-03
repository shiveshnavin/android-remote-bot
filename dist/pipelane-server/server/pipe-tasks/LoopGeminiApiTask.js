"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopGeminiApiTask = void 0;
//@ts-ignore
const pipelane_1 = require("pipelane");
const generationConfig = {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};
class LoopGeminiApiTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = "gemini";
    static TASK_TYPE_NAME = "llm";
    fileManager;
    model;
    apiKey = process.env.GEMINI_API_KEY;
    constructor(variantName, apiKey) {
        super(LoopGeminiApiTask.TASK_TYPE_NAME, variantName || LoopGeminiApiTask.TASK_VARIANT_NAME);
        this.apiKey = apiKey || this.apiKey;
    }
    kill() {
        return true;
    }
    async init() {
        const { GoogleGenerativeAI, } = require("@google/generative-ai");
        const { GoogleAIFileManager } = require("@google/generative-ai/server");
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        this.fileManager = new GoogleAIFileManager(apiKey);
        this.model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });
    }
    async uploadToGemini(path, mimeType) {
        const uploadResult = await this.fileManager.uploadFile(path, {
            mimeType,
            displayName: path,
        });
        const file = uploadResult.file;
        console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
        return file;
    }
    async callGemini(parts) {
        let finalParts = [];
        await Promise.all(parts.map(part => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (part.fileData?.localFileUri) {
                        let fileRes = (await this.uploadToGemini(part.fileData?.localFileUri, part.fileData.mimeType));
                        part.fileData.fileUri = fileRes.uri;
                        part.fileData.mimeType = fileRes.mimeType;
                        delete part.fileData?.localFileUri;
                    }
                    finalParts.push(part);
                    resolve(part);
                }
                catch (e) {
                    reject(e);
                }
            });
        }));
        const result = await this.model.generateContent({
            contents: [{ role: "user", parts: finalParts }],
            generationConfig,
        });
        return result;
    }
    async execute(pipeWorksInstance, data) {
        let inputs = data.last || [data.additionalInputs];
        if (!inputs) {
            return [{
                    status: false,
                    message: `invalid input. Required {
                                additionalInputs: {
                                    parts: InputPart[]
                                },
                                last: { parts: InputPart[] }[]
                            }`
                }];
        }
        let outputs = [];
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            try {
                let response = await this.callGemini(input.parts);
                outputs.push({ ...response, status: true });
            }
            catch (e) {
                pipeWorksInstance.onLog(e.message);
                outputs.push({ message: e.message, status: false });
            }
        }
        return outputs;
    }
}
exports.LoopGeminiApiTask = LoopGeminiApiTask;
// let gem = new LoopGeminiApiTask()
// gem.execute(new PipeLane({}), {
//     additionalInputs: {
//         parts: [
//             { text: "Extract the objects in the provided image and output them in a list in alphabetical order" }
//         ]
//     }
// }).then(console.log)

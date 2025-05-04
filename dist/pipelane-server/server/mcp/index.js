"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMcpServer = createMcpServer;
const express_1 = __importDefault(require("express"));
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const zod_1 = require("zod");
const pipelane_1 = __importDefault(require("pipelane"));
function generateZodSchema(obj) {
    if (obj === null)
        return zod_1.z.null();
    if (typeof obj === "number")
        return zod_1.z.number().describe("A number");
    if (typeof obj === "boolean")
        return zod_1.z.boolean().describe("A boolean");
    if (typeof obj === "string") {
        if (obj.toLocaleLowerCase().trim().startsWith("number")) {
            return zod_1.z.number().describe(obj);
        }
        if (obj.toLocaleLowerCase().trim().startsWith("boolean")) {
            return zod_1.z.boolean().describe(obj);
            ;
        }
        if (obj.toLocaleLowerCase().trim().startsWith("object")) {
            return zod_1.z.any().describe(obj);
            ;
        }
        if (obj.toLocaleLowerCase().trim().startsWith("array")) {
            return zod_1.z.any().describe(obj);
            ;
        }
        return zod_1.z.string().describe(obj);
    }
    if (Array.isArray(obj)) {
        const itemSchema = obj.length > 0 ? generateZodSchema(obj[0]) : zod_1.z.any();
        return zod_1.z.array(itemSchema);
    }
    if (typeof obj === "object") {
        const shape = {};
        for (const key in obj) {
            shape[key] = generateZodSchema(obj[key]);
        }
        return zod_1.z.object(shape);
    }
    return zod_1.z.any();
}
function addTools(variantConfig, server) {
    let taskNames = Object.keys(variantConfig);
    for (let taskName of taskNames) {
        let plTasks = variantConfig[taskName];
        for (let task of plTasks) {
            let taskDesc = task.describe();
            let zodSchema = generateZodSchema(taskDesc.inputs.additionalInputs);
            //@ts-ignore
            server.tool(task.getTaskTypeName() + "-" + task.getTaskVariantName(), taskDesc.summary, 
            //@ts-ignore
            zodSchema.shape, async (additionalInputs) => {
                let pl = new pipelane_1.default(variantConfig, 'mcp');
                try {
                    //@ts-ignore
                    task.pipeWorkInstance = pl;
                    let response = await task.execute(pl, {
                        inputs: [],
                        additionalInputs: additionalInputs
                    });
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify(response)
                            }]
                    };
                }
                catch (e) {
                    return {
                        content: [{
                                type: "text",
                                text: 'Task failed with error: ' + e.message
                            }]
                    };
                }
            });
        }
    }
}
function createMcpServer(variantConfig, db) {
    const server = new mcp_js_1.McpServer({
        name: "pipelane-bot",
        version: "1.0.0"
    });
    addTools(variantConfig, server);
    server.tool("check-available-tasks", "Check supported tasks", {}, async () => {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(Object.keys(variantConfig))
                }]
        };
    });
    const McpApp = (0, express_1.default)();
    const transports = {};
    McpApp.get("/sse", async (req, res) => {
        const transport = new sse_js_1.SSEServerTransport("/messages", res);
        transports[transport.sessionId] = transport;
        console.log("mcp:SSE session started:", transport.sessionId);
        res.on("close", () => {
            console.log("mcp:SSE session closed:", transport.sessionId);
            delete transports[transport.sessionId];
        });
        await server.connect(transport);
    });
    McpApp.post("/messages", async (req, res) => {
        const sessionId = req.query.sessionId;
        const transport = transports[sessionId];
        console.log("mcp:request:", req.body);
        if (transport) {
            await transport.handlePostMessage(req, res);
        }
        else {
            res.status(400).send("No transport found for sessionId");
        }
    });
    return McpApp;
}

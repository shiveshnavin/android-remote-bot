"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlUtils = void 0;
const xml2js = __importStar(require("xml2js"));
class XmlUtils {
    xmlString;
    xmlJson;
    constructor(xmlString) {
        this.xmlString = xmlString;
        this.xmlJson = null;
    }
    // Parse the XML string into a JavaScript object
    parseXml(xmlString) {
        const parser = new xml2js.Parser();
        return new Promise((resolve, reject) => {
            parser.parseString(xmlString || this.xmlString, (err, result) => {
                if (err) {
                    reject("Error parsing XML: " + err);
                }
                else {
                    this.xmlJson = result;
                    resolve(this.xmlJson);
                }
            });
        });
    }
    // Find the node with the given label in the 'text' attribute
    async findNodeByLabel(label) {
        // Parse the XML before searching
        if (!this.xmlJson) {
            await this.parseXml();
        }
        // Check if the root is "hierarchy" and get the nodes from there
        const root = this.xmlJson.hierarchy.node;
        // Recursive function to search through the XML
        const searchNode = (node) => {
            if (!node) {
                return null;
            }
            // Check if the 'text' attribute matches the label
            if (node.$ && node.$.text && node.$.text.includes(label)) {
                return node;
            }
            // Recursively search through child nodes if they exist
            if (node.node) {
                for (const child of node.node) {
                    const result = searchNode(child);
                    if (result)
                        return result;
                }
            }
            return null;
        };
        // Start searching through the nodes
        for (const node of root) {
            const result = searchNode(node);
            if (result) {
                return result;
            }
        }
        console.log('Node not found', `${label}`);
        return null;
    }
    // Find the node with the given attribute and value
    async findNodeByAttr(attr, attrValue) {
        // Parse the XML before searching
        if (!this.xmlJson) {
            await this.parseXml();
        }
        // Get root nodes from parsed XML
        const root = this.xmlJson.hierarchy.node;
        // Recursive function to search through the XML
        const searchNode = (node) => {
            if (!node) {
                return null;
            }
            // Check if the attribute matches the target value
            if (node.$ && node.$[attr] && node.$[attr].includes(attrValue)) {
                return node;
            }
            // Recursively search through children if any
            if (node.node) {
                for (const child of node.node) {
                    const result = searchNode(child);
                    if (result)
                        return result;
                }
            }
            return null;
        };
        // Begin search
        for (const node of root) {
            const result = searchNode(node);
            if (result) {
                return result;
            }
        }
        console.log('Node not found', `${attr} = ${attrValue}`);
        return null;
    }
    // Get bounds of the node and return the center coordinates
    getBounds(node) {
        let bounds = node?.$?.bounds;
        // Example bounds format: '[403,1017][1074,1059]'
        const match = bounds?.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
        if (match) {
            const left = parseInt(match[1], 10);
            const top = parseInt(match[2], 10);
            const right = parseInt(match[3], 10);
            const bottom = parseInt(match[4], 10);
            // You can choose either the center of the bounds or a specific point, e.g., top-left corner
            const x = Math.floor((left + right) / 2); // Center X
            const y = Math.floor((top + bottom) / 2); // Center Y
            return { x, y };
        }
        return null;
    }
}
exports.XmlUtils = XmlUtils;

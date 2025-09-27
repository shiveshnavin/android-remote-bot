"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResolvers = generateResolvers;
const utils_1 = require("./utils");
const pipelane_1 = require("./pipelane");
const lodash_1 = __importDefault(require("lodash"));
function generateResolvers(db, variantConfig, cronScheduler) {
    const resolvers = [
        (0, utils_1.generateTaskTypeResolvers)(variantConfig),
        (0, pipelane_1.generatePipelaneResolvers)(db, variantConfig, cronScheduler)
    ];
    let resolver = {};
    resolvers.forEach(r => {
        resolver = lodash_1.default.defaultsDeep(resolver, r);
    });
    return resolver;
}

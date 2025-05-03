"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTaskTypeResolvers = generateTaskTypeResolvers;
function generateTaskTypeResolvers(variantConfig) {
    return {
        TaskType: {
            description: (parent) => {
                let types = variantConfig[parent.type] || [];
                let anyType = types[0];
                return anyType.describe();
            },
            variants: (parent) => {
                if (parent.variants)
                    return parent.variants;
                let types = variantConfig[parent.type] || [];
                return types.map(pt => pt.getTaskVariantName());
            }
        },
        Query: {
            TaskType: async (parent, arg) => {
                let types = variantConfig[arg.type] || [];
                return {
                    type: arg.type,
                    variants: types.map(pt => pt.getTaskVariantName())
                };
            },
            taskTypes: () => {
                return Object.keys(variantConfig).map(vt => {
                    return {
                        type: vt
                    };
                });
            }
        }
    };
}

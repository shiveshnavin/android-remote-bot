import { TaskVariantConfig } from "pipelane";
export declare function generateTaskTypeResolvers(variantConfig: TaskVariantConfig): {
    TaskType: {
        description: (parent: any) => import("pipelane").PipeTaskDescription;
        variants: (parent: any) => any;
    };
    Query: {
        TaskType: (parent: any, arg: any) => Promise<{
            type: any;
            variants: string[];
        }>;
        taskTypes: () => {
            type: string;
        }[];
    };
};

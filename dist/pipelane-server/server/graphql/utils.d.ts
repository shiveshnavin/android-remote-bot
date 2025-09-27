import PipeLane, { TaskVariantConfig } from "pipelane";
import { Status } from "../../gen/model";
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
export declare function getTasksExecFromPipelane(cached: PipeLane): any[];
export declare function mapStatus(event: any, output: ({
    status: Status;
} & any)[]): Status;

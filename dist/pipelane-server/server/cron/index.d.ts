import PipeLane, { TaskVariantConfig } from "pipelane";
import { PipelaneExecution, Pipelane as PipelaneSchedule, Status } from "../../gen/model";
import Cron from "croner";
export declare class CronScheduler {
    stopped: boolean;
    cronJobs: {
        name: string;
        job: Cron;
    }[];
    schedules: PipelaneSchedule[];
    currentExecutions: PipeLane[];
    pipelaneResolver: {
        PipelaneExecution: {
            definition: (parent: any) => Promise<import("../../gen/model").Pipetask>;
            tasks: (parent: any) => Promise<any>;
        };
        Pipetask: {
            active: (parent: any) => any;
            isParallel: (parent: any) => any;
        };
        Pipelane: {
            active: (parent: any) => any;
            nextRun: (parent: PipelaneSchedule) => string;
            tasks: (parent: PipelaneSchedule) => Promise<any[]>;
            executions(parent: PipelaneSchedule): Promise<any[]>;
        };
        Query: {
            Pipelane: (parent: any, arg: import("../../gen/model").QueryPipelaneArgs) => Promise<PipelaneSchedule>;
            Pipetask: (parent: any, arg: any) => Promise<import("../../gen/model").Pipetask>;
            PipelaneExecution(pr: any, arg: import("../../gen/model").QueryPipelaneExecutionArgs): Promise<any>;
            pipelanes: () => Promise<PipelaneSchedule[]>;
            pipelaneTasks: (parent: any, arg: any) => Promise<import("../../gen/model").Pipetask[]>;
            executions(parent: any, request: {
                limit: number;
            }): Promise<any[]>;
            pipelaneExecutions(pr: any, arg: import("../../gen/model").QueryPipelaneExecutionsArgs): Promise<any[]>;
        };
        Mutation: {
            createPipelaneTask(parent: any, request: import("../../gen/model").MutationCreatePipelaneTaskArgs): Promise<import("../../gen/model").Pipetask>;
            clonePipelane(parent: any, request: import("../../gen/model").MutationClonePipelaneArgs): Promise<PipelaneSchedule & import("../../gen/model").CreatePipelanePayload>;
            createPipelane(parent: any, request: import("../../gen/model").MutationCreatePipelaneArgs): Promise<PipelaneSchedule & import("../../gen/model").CreatePipelanePayload>;
            deletePipelane(parent: any, request: {
                name: string;
            }): Promise<string>;
            deletePipelaneTask(parent: any, request: {
                name: string;
                pipelaneName: string;
            }): Promise<string>;
            createPipelaneExecution(parent: any, request: {
                data: PipelaneExecution;
            }): Promise<any>;
            createPipelaneTaskExecution(parent: any, request: {
                data: import("../../gen/model").PipetaskExecution;
            }): Promise<any>;
            executePipelane(parent: any, request: {
                name: string;
                input: string;
            }): Promise<PipelaneExecution>;
        };
    };
    variantConfig: TaskVariantConfig;
    pipelaneLogLevel: 0 | 1 | 2 | 3 | 4 | 5;
    constructor(variantConfig: TaskVariantConfig, pipelaneLogLevel?: 0 | 1 | 2 | 3 | 4 | 5);
    getPipelaneDefinition(pipeName: any): Promise<PipelaneSchedule | undefined>;
    init(initialSchedules: PipelaneSchedule[], pipelaneResolver: any): void;
    stopJob(name: String): void;
    stopAll(): void;
    startAll(): void;
    addToSchedule(pl: PipelaneSchedule): void;
    findScheduledJob(pl: PipelaneSchedule): {
        name: string;
        job: Cron;
    };
    schedulePipelaneCronjob(pl: PipelaneSchedule): void;
    triggerPipelane(pl: PipelaneSchedule, input?: string): Promise<PipelaneExecution | undefined>;
    private lock;
    listenToPipe(pipelaneInstance: PipeLane, plx: PipelaneExecution, onResult?: (output: ({
        status: Status;
    } & any)[]) => void): void;
    mapStatus(event: any, output: ({
        status: Status;
    } & any)[]): Status;
    validateCronString(cronString: string): any;
    getNextRun(cronExpression: string): Date;
    isPipeRunnable(schedule: PipelaneSchedule): boolean;
}
/**
 * @param {string} cronExpression The cron expression. See https://croner.56k.guru/usage/pattern/
 * @param {Date} [timestamp] The timestamp to check. Defaults to the current time.
 * @returns {Number} The number of seconds until the next cron run.
 */
export declare function getSecondsUntilNextCronRun(cronExpression: any, timestamp?: Date): number;

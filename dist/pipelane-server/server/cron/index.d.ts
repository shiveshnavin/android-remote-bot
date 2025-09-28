import PipeLane, { TaskVariantConfig } from "pipelane";
import { PipelaneExecution, Pipelane as PipelaneSchedule, Status } from "../../gen/model";
import { Cron } from "croner";
export declare class CronScheduler {
    stopped: boolean;
    cronJobs: {
        name: string;
        job: Cron;
    }[];
    schedules: PipelaneSchedule[];
    currentExecutions: PipeLane[];
    executionsCache: PipeLane[];
    maxCacheSize: number;
    pipelaneResolver: any;
    variantConfig: TaskVariantConfig;
    pipelaneLogLevel: 0 | 1 | 2 | 3 | 4 | 5;
    constructor(variantConfig: TaskVariantConfig, pipelaneLogLevel?: 0 | 1 | 2 | 3 | 4 | 5, maxCacheSize?: number);
    getPipelaneDefinition(pipeName: string, existing?: PipelaneSchedule): Promise<PipelaneSchedule | undefined>;
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

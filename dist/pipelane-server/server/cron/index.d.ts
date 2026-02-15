import PipeLane, { TaskVariantConfig, PipeTask, OutputWithStatus } from "pipelane";
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
    listeners: Map<string, PipelaneExecutionListener>;
    constructor(variantConfig: TaskVariantConfig, pipelaneLogLevel?: 0 | 1 | 2 | 3 | 4 | 5, maxCacheSize?: number);
    getPipelaneDefinition(pipeName: string, existing?: PipelaneSchedule): Promise<PipelaneSchedule | undefined>;
    init(initialSchedules: PipelaneSchedule[], pipelaneResolver: any): void;
    stopJob(instanceId: String): void;
    stopAll(): void;
    startAll(): void;
    addToSchedule(pl: PipelaneSchedule): void;
    findScheduledJob(pl: PipelaneSchedule): {
        name: string;
        job: Cron;
    };
    schedulePipelaneCronjob(pl: PipelaneSchedule): void;
    createInstanceId(name: string): string;
    attachListenerToPipelane(name: string, listener: PipelaneExecutionListener): Promise<void>;
    triggerPipelaneByName(name: string, input?: string, listener?: PipelaneExecutionListener, instanceId?: string): Promise<PipelaneExecution | undefined>;
    triggerPipelane(pl: PipelaneSchedule, input?: string, listener?: PipelaneExecutionListener, instanceId?: string): Promise<PipelaneExecution | undefined>;
    pipelineLocks: Map<string, Promise<void>>;
    private acquirePipelineSlot;
    private lock;
    listenToPipe(pipelaneInstance: PipeLane, plx: PipelaneExecution, onResult?: (output: ({
        status: Status;
    } & any)[]) => void, listener?: PipelaneExecutionListener): void;
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
export type EventType = 'NEW_TASK' | 'TASK_FINISHED' | 'SKIPPED' | 'COMPLETE';
export type PipelaneExecutionListener = (pipelaneInstance: PipeLane, event: EventType, task: PipeTask<any, any>, output: OutputWithStatus[], plx: PipelaneExecution) => void;

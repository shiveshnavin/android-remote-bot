import { OutputWithStatus, TaskVariantConfig } from "pipelane";
export declare const VariantConfig: TaskVariantConfig;
export type ErrorOutput = OutputWithStatus & {
    message?: string;
};
export * from './';

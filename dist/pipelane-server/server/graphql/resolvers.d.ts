import { MultiDbORM } from "multi-db-orm";
import { TaskVariantConfig } from "pipelane";
import { CronScheduler } from "../cron";
export declare function generateResolvers(db: MultiDbORM, variantConfig: TaskVariantConfig, cronScheduler?: CronScheduler): {};

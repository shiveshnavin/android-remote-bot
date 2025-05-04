import { MultiDbORM } from "multi-db-orm";
import { TaskVariantConfig } from "pipelane";
export declare function createMcpServer(variantConfig: TaskVariantConfig, db: MultiDbORM): import("express-serve-static-core").Express;

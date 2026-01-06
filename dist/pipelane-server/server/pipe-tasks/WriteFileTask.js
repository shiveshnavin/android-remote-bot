"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteCsvFileTask = void 0;
//@ts-ignore
const pipelane_1 = require("pipelane");
const fs_1 = __importDefault(require("fs"));
const json2csv_1 = require("json2csv");
class WriteCsvFileTask extends pipelane_1.PipeTask {
    static TASK_TYPE_NAME = "write-file";
    static TASK_VARIANT_NAME = "csv";
    constructor(variantName) {
        super(WriteCsvFileTask.TASK_TYPE_NAME, variantName || WriteCsvFileTask.TASK_VARIANT_NAME);
    }
    kill() {
        return true;
    }
    async execute(pipeWorksInstance, inputs) {
        let jsonData = inputs.last.filter(item => item.status == true);
        let format = inputs.additionalInputs?.format || "csv";
        let file = inputs.additionalInputs?.file || `${pipeWorksInstance.instanceId}.${format}`;
        let incremental = inputs.additionalInputs?.incremental || true;
        const fields = Object.keys(jsonData[0]);
        const opts = { fields };
        const parser = new json2csv_1.Parser(opts);
        if (incremental && format === "csv") {
            const writeStream = fs_1.default.createWriteStream(file, { flags: 'a' });
            const fileExists = fs_1.default.existsSync(file);
            if (!fileExists) {
                const header = fields.join(',') + '\n';
                writeStream.write(header);
            }
            jsonData.forEach((item) => {
                const csvRow = parser.parse([item]).split('\n')[1] + '\n';
                writeStream.write(csvRow);
            });
            writeStream.end();
        }
        else if (format === "csv") {
            const csvData = parser.parse(jsonData);
            fs_1.default.writeFileSync(file, csvData);
        }
        else {
            return [{
                    file,
                    message: 'Format not supported ' + format,
                    status: false
                }];
        }
        return [{
                file,
                lines: jsonData.length,
                status: jsonData.length > 0
            }];
    }
}
exports.WriteCsvFileTask = WriteCsvFileTask;

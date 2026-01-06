"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellTask = void 0;
const pipelane_1 = require("pipelane");
const child_process_1 = require("child_process");
class ShellTask extends pipelane_1.PipeTask {
    static TASK_VARIANT_NAME = "shell";
    static TASK_TYPE_NAME = "shell";
    allowedCommands = [];
    constructor(variantName, allowedCommands) {
        super(ShellTask.TASK_TYPE_NAME, variantName || ShellTask.TASK_VARIANT_NAME);
        this.allowedCommands = allowedCommands || [];
    }
    kill() {
        return true;
    }
    describe() {
        return {
            summary: 'Task to execute shell commands',
            inputs: {
                last: [],
                additionalInputs: {
                    cmd: "string, the shell command to run"
                }
            }
        };
    }
    isExecutableAllowed(command, allowedExecutables) {
        if (allowedExecutables.includes("*"))
            return true;
        const commands = command.split(/[&;&|&&|]/);
        // Iterate through each command
        for (let i = 0; i < commands.length; i++) {
            const singleCommand = commands[i].trim().split(' ')[0];
            if (!allowedExecutables.includes(singleCommand)) {
                return false;
            }
        }
        return true;
    }
    async execute(pipeWorksInstance, input) {
        let cmd = input.additionalInputs.cmd;
        if (!this.isExecutableAllowed(input.additionalInputs.cmd, this.allowedCommands)) {
            return [{
                    status: false,
                    message: 'Command not allowed'
                }];
        }
        return new Promise((resolve, reject) => {
            console.log('Executing command:', `bash -c "source ~/.bash_profile && ${cmd}" `);
            (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
                if (error !== null) {
                    resolve([{
                            status: false,
                            message: 'Error in exec: ' + error + ' : ' + stderr
                        }]);
                }
                else {
                    resolve([{
                            status: true,
                            output: stdout
                        }]);
                }
            });
        });
    }
}
exports.ShellTask = ShellTask;

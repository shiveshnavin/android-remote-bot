"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.PipelaneAction = void 0;
var PipelaneAction;
(function (PipelaneAction) {
    PipelaneAction["Create"] = "CREATE";
    PipelaneAction["Update"] = "UPDATE";
})(PipelaneAction || (exports.PipelaneAction = PipelaneAction = {}));
var Status;
(function (Status) {
    Status["Failed"] = "FAILED";
    Status["InProgress"] = "IN_PROGRESS";
    Status["PartialSuccess"] = "PARTIAL_SUCCESS";
    Status["Paused"] = "PAUSED";
    Status["Skipped"] = "SKIPPED";
    Status["Success"] = "SUCCESS";
})(Status || (exports.Status = Status = {}));

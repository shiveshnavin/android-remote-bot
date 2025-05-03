"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PipeTaskPage;
const Context_1 = require("@/components/Context");
const client_1 = require("@apollo/client");
const expo_router_1 = require("expo-router");
const hooks_1 = require("expo-router/build/hooks");
const react_1 = __importStar(require("react"));
const react_2 = require("react");
const react_native_boxes_1 = require("react-native-boxes");
const react_native_boxes_2 = require("react-native-boxes");
const api_1 = require("@/common/api");
const react_3 = __importDefault(require("@monaco-editor/react"));
const ReactUtils_1 = require("../../../../common/utils/ReactUtils");
const Try_1 = require("expo-router/build/views/Try");
const Errorboundary_1 = require("../../../../components/Errorboundary");
function PipeTaskPage() {
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    const { task: name, pipe: pipelaneName } = (0, expo_router_1.useLocalSearchParams)();
    const [curPipetask, setCurPipetask] = (0, react_1.useState)(undefined);
    const [taskTypes, setTaskTypes] = (0, react_1.useState)([]);
    const [err, seterr] = (0, react_1.useState)(undefined);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const appContext = (0, react_2.useContext)(Context_1.AppContext);
    const router = (0, hooks_1.useRouter)();
    const api = appContext.context.api;
    function getPipetask() {
        setLoading(true);
        seterr(undefined);
        if (name != 'new') {
            api.graph.query({
                query: (0, client_1.gql) `query PipeTasks($name: ID!, $pipelaneName: ID!) {
                    Pipetask(name: $name, pipelaneName: $pipelaneName) {
                      name
                      pipelaneName
                      taskVariantName
                      taskTypeName
                      isParallel
                      step
                      input
                      active
                    }
                    taskTypes {
                      type
                      variants
                      description {
                        summary
                        inputs {
                            last
                            additionalInputs
                        }
                      }
                    }
                  }
                  `,
                variables: {
                    pipelaneName,
                    name
                }
            }).then(result => {
                setCurPipetask(result.data.Pipetask);
                setTaskTypes(result.data.taskTypes);
                if (!result.data.Pipetask) {
                    seterr(`No task exists with name ${name} in ${pipelaneName}`);
                }
            }).catch(error => {
                seterr((0, api_1.getGraphErrorMessage)(error));
            }).finally(() => {
                setLoading(false);
            });
        }
        else {
            let newTask = Object.assign({}, api.SAMPLE_PIPETASK);
            newTask.pipelaneName = pipelaneName;
            api.graph.query({
                query: (0, client_1.gql) `
                        query TaskTypes {
                        taskTypes {
                            type
                            variants
                            description {
                            summary
                            inputs {
                                    last
                                    additionalInputs
                                }
                            }
                        }
                        }`,
                variables: {}
            }).then(result => {
                let taskTypes = result.data.taskTypes;
                newTask.taskTypeName = taskTypes[0].type;
                newTask.taskVariantName = taskTypes[0].variants[0];
                setCurPipetask(newTask);
                setTaskTypes(result.data.taskTypes);
            }).catch(error => {
                seterr((0, api_1.getGraphErrorMessage)(error));
            }).finally(() => {
                setLoading(false);
            });
        }
    }
    (0, react_1.useEffect)(() => {
        getPipetask();
    }, [pipelaneName, name]);
    return (react_1.default.createElement(react_native_boxes_1.VPage, null,
        err && react_1.default.createElement(react_native_boxes_2.AlertMessage, { style: {
                margin: theme.dimens.space.md,
                width: '95%'
            }, text: err, type: "critical" }),
        loading && react_1.default.createElement(react_native_boxes_2.Spinner, { style: {
                marginTop: theme.dimens.space.xl
            } }),
        curPipetask && react_1.default.createElement(PipetaskView, { loading: loading, seterr: seterr, save: (task) => {
                if (task.taskTypeName == 'new') {
                    seterr('Please select the task type');
                    return;
                }
                if (task.taskVariantName == 'new') {
                    seterr('Please select the task variant name');
                    return;
                }
                if (task.name == 'new') {
                    seterr('Please enter task name');
                    return;
                }
                try {
                    JSON.parse(task.input);
                    seterr(undefined);
                }
                catch (e) {
                    seterr('Input must be a valid JSON string');
                    return;
                }
                setLoading(true);
                seterr(undefined);
                delete task.__typename;
                api.upsertPipelaneTask({ ...task }, (name && name != 'new' ? name : task.name)).then(result => {
                    setCurPipetask(result.data.createPipelaneTask);
                    if (result.data.createPipelaneTask.name != name) {
                        router.navigate(`/home/${result.data.createPipelaneTask.pipelaneName}/${result.data.createPipelaneTask.name}`);
                    }
                    else {
                        router.navigate('/home/' + task.pipelaneName);
                    }
                }).catch((error) => {
                    seterr((0, api_1.getGraphErrorMessage)(error));
                }).finally(() => {
                    setLoading(false);
                });
            }, taskTypes: taskTypes, pipetask: curPipetask })));
}
function PipetaskView({ loading, pipetask: inputPipetask, taskTypes, save, seterr }) {
    const router = (0, hooks_1.useRouter)();
    const [taskDesc, setTaskDesc] = (0, react_1.useState)(undefined);
    const [task, setTask] = (0, react_1.useState)({
        ...inputPipetask
    });
    (0, react_1.useEffect)(() => {
        let taskDesc = undefined;
        let taskInput = JSON.stringify(JSON.parse(inputPipetask.input), null, 2);
        const matchingTaskType = taskTypes.find(t => t.type == task.taskTypeName);
        if (matchingTaskType && matchingTaskType?.description) {
            taskDesc = (0, api_1.removeFieldRecursively)(matchingTaskType?.description, "__typename");
            setTaskDesc(taskDesc);
        }
        if (inputPipetask?.name == 'new' && taskDesc?.inputs?.additionalInputs) {
            taskInput = JSON.stringify(taskDesc?.inputs?.additionalInputs, null, 2);
            setTask(t => {
                t.input = taskInput;
                return t;
            });
        }
        if (task.taskTypeName == 'eval-js') {
            setEditingField('js');
        }
        else {
            setEditingField(undefined);
        }
        forceUpdate();
    }, [task.taskVariantName, task.taskTypeName]);
    const [ignored, forceUpdate] = (0, react_1.useReducer)(x => x + 1, 0);
    const theme = (0, react_2.useContext)(react_native_boxes_1.ThemeContext);
    const [editingField, setEditingField] = (0, react_1.useState)(undefined);
    const appContext = (0, react_2.useContext)(Context_1.AppContext);
    const api = appContext.context.api;
    const taskVariants = (taskTypes?.find(t => t.type == task.taskTypeName)?.variants || [])?.map(tt => ({
        id: tt,
        value: tt,
        title: tt,
    }));
    taskVariants?.unshift({
        id: 'auto',
        value: 'auto',
        title: 'auto'
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = (0, react_1.useState)(false);
    return (react_1.default.createElement(react_native_boxes_1.VBox, null,
        react_1.default.createElement(react_native_boxes_1.TransparentCenterToolbar, { options: [{
                    id: 'delete',
                    icon: 'trash',
                    title: 'Delete',
                    onClick: () => {
                        setShowDeleteConfirm(true);
                    }
                }], title: `${task.pipelaneName}   ➤   ${task.name}`, homeIcon: "arrow-left", forgroundColor: theme.colors.text, onHomePress: () => {
                router.navigate(`/home/${task.pipelaneName}`);
            } }),
        taskDesc?.summary && (react_1.default.createElement(react_native_boxes_1.TextView, { style: {
                padding: theme.dimens.space.md,
                marginLeft: theme.dimens.space.lg,
            } }, taskDesc?.summary)),
        react_1.default.createElement(react_native_boxes_1.CardView, null,
            react_1.default.createElement(react_native_boxes_1.HBox, { style: {
                    padding: theme.dimens.space.md,
                    justifyContent: 'space-between'
                } },
                react_1.default.createElement(react_native_boxes_1.TextView, null, "Active"),
                react_1.default.createElement(react_native_boxes_1.SwitchView, { value: task.active, onValueChange: (newV) => {
                        setTask((task) => {
                            task.active = newV;
                            return task;
                        });
                        forceUpdate();
                    } })),
            react_1.default.createElement(react_native_boxes_1.HBox, { style: {
                    padding: theme.dimens.space.md,
                    justifyContent: 'space-between'
                } },
                react_1.default.createElement(react_native_boxes_1.TextView, null, "Parallel execution"),
                react_1.default.createElement(react_native_boxes_1.SwitchView, { value: task.isParallel, onValueChange: (newV) => {
                        setTask((task) => {
                            task.isParallel = newV;
                            return task;
                        });
                        forceUpdate();
                    } })),
            react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { icon: "close", placeholder: "Name", onChangeText: (t) => {
                    setTask((task) => {
                        task.name = t;
                        return task;
                    });
                    forceUpdate();
                }, value: task.name, initialText: task.name }),
            react_1.default.createElement(react_native_boxes_1.DropDownView, { title: "Task Type", forceDialogSelectOnWeb: true, onSelect: (taskTypeName) => {
                    setTask((task) => {
                        task.taskTypeName = taskTypeName;
                        if (task.taskTypeName !== taskTypeName) {
                            task.taskVariantName = 'auto';
                        }
                        return task;
                    });
                    forceUpdate();
                }, selectedId: task.taskTypeName, options: taskTypes?.map(tt => ({
                    id: tt.type,
                    value: tt.type,
                    title: tt.type,
                })) || [] }),
            react_1.default.createElement(react_native_boxes_1.DropDownView, { title: "Task Variant", forceDialogSelectOnWeb: true, onSelect: (taskVariantName) => {
                    setTask((task) => {
                        task.taskVariantName = taskVariantName;
                        return task;
                    });
                    forceUpdate();
                }, selectedId: task.taskVariantName || 'auto', 
                //@ts-ignore
                options: taskVariants }),
            react_1.default.createElement(react_native_boxes_1.Caption, { style: {
                    marginTop: theme.dimens.space.md,
                    marginLeft: theme.dimens.space.sm
                } }, "Additional Inputs"),
            react_1.default.createElement(react_native_boxes_1.Center, { style: {
                    borderWidth: 0.1,
                    borderColor: theme.colors.caption,
                    borderRadius: 10,
                    padding: 3,
                    margin: theme.dimens.space.sm
                } },
                react_1.default.createElement(react_3.default, { onChange: (t) => {
                        setTask((task) => {
                            task.input = t;
                            return task;
                        });
                        forceUpdate();
                    }, height: "30vh", value: task.input, defaultLanguage: "json", 
                    // defaultValue={task.input as string}
                    theme: theme.colors.text == '#444444' ? "light" : "vs-dark", options: {
                        tabSize: 2,
                        formatOnPaste: true,
                        formatOnType: true,
                        lineNumbers: "off",
                        wordWrap: "on",
                        minimap: { enabled: false }
                    } })),
            (0, ReactUtils_1.isObject)(task.input) && (react_1.default.createElement(react_native_boxes_1.Expand, { title: "Edit field as code", leftPadding: 0, initialExpand: task.taskTypeName == 'eval-js' },
                react_1.default.createElement(react_native_boxes_1.DropDownView, { title: "Select field", forceDialogSelectOnWeb: true, placeholder: "Select field to edit separately", selectedId: editingField, onSelect: (id) => {
                        setEditingField(id);
                        forceUpdate();
                    }, options: Object.keys(JSON.parse(task.input) || {}).map(key => {
                        return {
                            id: key,
                            value: key,
                            title: key
                        };
                    }) }),
                editingField && (react_1.default.createElement(react_native_boxes_1.Center, { style: {
                        borderWidth: 0.1,
                        borderColor: theme.colors.caption,
                        borderRadius: 10,
                        padding: 3,
                        margin: theme.dimens.space.sm
                    } },
                    react_1.default.createElement(Try_1.Try, { catch: Errorboundary_1.ErrorBoundary },
                        react_1.default.createElement(react_3.default, { onChange: (t) => {
                                try {
                                    setTask((task) => {
                                        let inputObj = JSON.parse(task.input);
                                        inputObj[editingField] = t;
                                        task.input = JSON.stringify(inputObj, null, 2);
                                        console.log(task.input);
                                        return task;
                                    });
                                    seterr(undefined);
                                }
                                catch (e) {
                                    seterr('Please enter a valid input');
                                }
                                forceUpdate();
                            }, height: "30vh", defaultLanguage: "javascript", value: JSON.parse(task.input)[editingField], theme: theme.colors.text == '#444444' ? "light" : "vs-dark", options: {
                                tabSize: 2,
                                formatOnPaste: true,
                                formatOnType: true,
                                lineNumbers: "off",
                                wordWrap: "on",
                                minimap: { enabled: false }
                            } })))))),
            react_1.default.createElement(react_native_boxes_1.Caption, { style: {
                    paddingBottom: theme.dimens.space.md
                } }, "You can access pipelane data using contextual varialbles like `pl` (Pipelane Instance), `input` (Input to task, contains last and additionalInputs fields. AdditionalInputs is essentially what you are writing in the above box), `prev` (Output of previous task, same as input.last), `axios` (An instance of axios for making network calls if required) and `Utils` which contains functions like `escapeJSONString`. E.g. to access an output of a task by its index you can use pl.executedTasks[0].outputs[0].my_output_field similarly you can use prev[0].my_output_field to access previous output and input.additionalInputs.my_static_input to access the values entered in above box."),
            taskDesc && (react_1.default.createElement(react_native_boxes_1.Expand, { title: "Task description" },
                react_1.default.createElement(react_native_boxes_1.CompositeTextInputView, { editable: false, placeholder: "Outputs", textInputProps: {
                        numberOfLines: 10,
                        multiline: true,
                        style: {
                            color: theme.colors.text,
                            textAlignVertical: 'top',
                            verticalAlign: 'top',
                            alignContent: 'flex-start',
                        }
                    }, value: (0, ReactUtils_1.prettyJson)(JSON.stringify(taskDesc)) || '', initialText: (0, ReactUtils_1.prettyJson)(JSON.stringify(taskDesc)) || '' }))),
            react_1.default.createElement(react_native_boxes_1.ConfirmationDialog, { title: "Delete ?", confirmText: "Confirm", cancelText: "Cancel", message: " This action is irreversible. Are you sure you want to delete this task?", onDismiss: () => {
                    setShowDeleteConfirm(false);
                }, onConfirm: function () {
                    api.deletePipelaneTask(task.pipelaneName, task.name).then(() => {
                        router.navigate('/home/' + task.pipelaneName);
                    }).catch(e => seterr((0, api_1.getGraphErrorMessage)(e)));
                }, visible: showDeleteConfirm }),
            react_1.default.createElement(react_native_boxes_1.LoadingButton, { loading: loading, style: {
                    marginTop: theme.dimens.space.md
                }, onPress: () => {
                    if (!taskVariants.map(t => t.value).includes(task.taskVariantName)) {
                        task.taskVariantName = 'auto';
                    }
                    save(task);
                } }, "Save"))));
}

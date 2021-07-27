"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var objectTypeDescription_1 = require("./objectTypeDescription");
var objectTypeChildDescription_1 = require("./objectTypeChildDescription");
var xml2js = require("xml2js");
var xlsx = require("xlsx");
var helpers_1 = require("yargs/helpers");
var yargs = require("yargs");
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
function extractObjectTypeTables(nodesetXML, instanceNodes, tables, nodes_description) {
    console.log("ObjectTypes found: ", nodesetXML.UANodeSet.UAObjectType.length);
    nodesetXML.UANodeSet.UAObjectType.forEach(function (objectType) {
        var currentObjectType = new objectTypeDescription_1.ObjectTypeDescription();
        currentObjectType.browsename = objectType.$.BrowseName;
        var description = nodes_description.find(function (e) { return e.Name == currentObjectType.browsename; });
        if (description != undefined) {
            currentObjectType.description = description.Description;
        }
        if (objectType.References[0].Reference !== undefined) {
            objectType.References[0].Reference.forEach(function (child) {
                if (child.$.ReferenceType == "HasSubtype") {
                    if (child.$.IsForward == "false") {
                        currentObjectType.superType = child._;
                    }
                    else {
                        console.warn("Wrong HasSubtype reference");
                    }
                }
                else {
                    var row_1 = new objectTypeChildDescription_1.ObjectTypeChildDescription();
                    row_1.referenceType = child.$.ReferenceType;
                    var childNode = instanceNodes.find(function (e) { return e.$.NodeId == child._; });
                    row_1.datatype = childNode.$.DataType;
                    row_1.browsename = childNode.$.BrowseName;
                    var description_1 = nodes_description.find(function (e) { return e.Name == row_1.browsename; });
                    if (description_1 != undefined) {
                        row_1.description = description_1.Description;
                    }
                    row_1.nodeClass = childNode.NodeClass;
                    var modelingRuleNode = childNode.References[0].Reference.find(function (e) { return e.$.ReferenceType == "HasModellingRule"; });
                    switch (modelingRuleNode._) {
                        case 'i=80':
                            row_1.modelingrule = "Optional";
                            break;
                        case 'i=78':
                            row_1.modelingrule = "Mandatory";
                            break;
                        case 'i=11508':
                            row_1.modelingrule = "OptionalPlaceholder";
                            break;
                        case 'i=11510':
                            row_1.modelingrule = "MandatoryPlaceholder";
                            break;
                        default:
                            row_1.modelingrule = modelingRuleNode._;
                    }
                    if (row_1.nodeClass == "UAMethod") {
                        row_1.typedefinition = "";
                    }
                    else {
                        var NodeTypeId_1 = childNode.References[0].Reference.find(function (e) { return e.$.ReferenceType == "HasTypeDefinition"; });
                        switch (NodeTypeId_1._) {
                            case 'i=68':
                                row_1.typedefinition = "PropertyType";
                                break;
                            case 'i=58':
                                row_1.typedefinition = "BaseObjectType";
                                break;
                            case 'i=63':
                                row_1.typedefinition = "BaseDataVariableType";
                                break;
                            case 'i=2376':
                                row_1.typedefinition = "MultiStateDiscreteType";
                                break;
                            case 'i=17497':
                                row_1.typedefinition = "AnalogUnitType";
                                break;
                            case 'i=11575':
                                row_1.typedefinition = "FileType";
                                break;
                            case 'ns=2;i=7':
                                row_1.typedefinition = "NotificationType";
                                break;
                            case 'ns=2;i=21':
                                row_1.typedefinition = "2:ProductionType";
                                break;
                            case 'ns=2;i=44':
                                row_1.typedefinition = "ToolListType";
                                break;
                            case 'ns=4;i=1004':
                                row_1.typedefinition = "MachineryItemIdentificationType";
                                break;
                            default:
                                var NodeType = instanceNodes.find(function (e) { return e.$.NodeId == NodeTypeId_1._; });
                                if (NodeType == undefined) {
                                    console.log("No BrowseName for Type of Node %s is found", NodeTypeId_1);
                                }
                                else {
                                    row_1.typedefinition = NodeType.$.BrowseName;
                                }
                        }
                    }
                    currentObjectType.childrows.push(row_1);
                }
            });
        }
        tables.push(currentObjectType);
    });
}
function loadModel(file) {
    return __awaiter(this, void 0, void 0, function () {
        var instanceNodes, parser, nodesetXML;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instanceNodes = Array();
                    parser = new xml2js.Parser( /* options */);
                    return [4 /*yield*/, parser.parseStringPromise(file)];
                case 1:
                    nodesetXML = _a.sent();
                    if (nodesetXML.UANodeSet.UAVariable !== undefined) {
                        nodesetXML.UANodeSet.UAVariable.forEach(function (e) { return e.NodeClass = "UAVariable"; });
                        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAVariable);
                    }
                    if (nodesetXML.UANodeSet.UAObject !== undefined) {
                        nodesetXML.UANodeSet.UAObject.forEach(function (e) { return e.NodeClass = "UAObject"; });
                        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAObject);
                    }
                    if (nodesetXML.UANodeSet.UAMethod !== undefined) {
                        nodesetXML.UANodeSet.UAMethod.forEach(function (e) { return e.NodeClass = "UAMethod"; });
                        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAMethod);
                    }
                    if (nodesetXML.UANodeSet.UADataType !== undefined) {
                        nodesetXML.UANodeSet.UADataType.forEach(function (e) { return e.NodeClass = "UADataType"; });
                        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UADataType);
                    }
                    if (nodesetXML.UANodeSet.UAObjectType !== undefined) {
                        nodesetXML.UANodeSet.UAObjectType.forEach(function (e) { return e.NodeClass = "UAObjectType"; });
                        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAObjectType);
                    }
                    if (nodesetXML.UANodeSet.UAVariableType !== undefined) {
                        nodesetXML.UANodeSet.UAVariableType.forEach(function (e) { return e.NodeClass = "UAVariableType"; });
                        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAVariableType);
                    }
                    return [2 /*return*/, { instanceNodes: instanceNodes, nodesetXML: nodesetXML }];
            }
        });
    });
}
function generateDocx(data, path, output) {
    return __awaiter(this, void 0, void 0, function () {
        // The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
        function replaceErrors(key, value) {
            if (value instanceof Error) {
                return Object.getOwnPropertyNames(value).reduce(function (error, key) {
                    error[key] = value[key];
                    return error;
                }, {});
            }
            return value;
        }
        function errorHandler(error) {
            console.log(JSON.stringify({ error: error }, replaceErrors));
            if (error.properties && error.properties.errors instanceof Array) {
                var errorMessages = error.properties.errors.map(function (error) {
                    return error.properties.explanation;
                }).join("\n");
                console.log('errorMessages', errorMessages);
                // errorMessages is a humanly readable message looking like this:
                // 'The tag beginning with "foobar" is unopened'
            }
            throw error;
        }
        var content, zip, doc, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.readFile(path, 'binary')];
                case 1:
                    content = _a.sent();
                    zip = new PizZip(content);
                    try {
                        doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
                    }
                    catch (error) {
                        // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
                        errorHandler(error);
                    }
                    //set the templateVariables
                    doc.setData(data);
                    try {
                        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                        doc.render();
                    }
                    catch (error) {
                        // Catch rendering errors (errors relating to the rendering of the template: angularParser throws an error)
                        errorHandler(error);
                    }
                    buf = doc.getZip()
                        .generate({ type: 'nodebuffer' });
                    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
                    console.log("write file");
                    return [4 /*yield*/, fs_1.promises.writeFile(output, buf)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var data, objectTypeTable, nodes, myNodeSetFile, _a, instanceNodes, nodesetXML, nodes_description, workbook, i, sheet, json;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    yargs(helpers_1.hideBin(process.argv))
                        .option('nodeset', {
                        alias: 'n',
                        type: 'string',
                        description: 'The nodeset for which the documentation is to be generated'
                    })
                        .option('template', {
                        alias: 't',
                        type: 'string',
                        description: 'path to the docx template'
                    })
                        .option('output', {
                        alias: 'o',
                        type: 'string',
                        description: 'path to the output file',
                        default: "output.docx"
                    })
                        .option('description', {
                        alias: 'd',
                        type: 'string',
                        description: 'path to a description excel file',
                    }).argv;
                    console.log(yargs.argv);
                    data = Object();
                    objectTypeTable = Array();
                    nodes = Array();
                    return [4 /*yield*/, fs_1.promises.readFile(yargs.argv['nodeset'], 'utf8')];
                case 1:
                    myNodeSetFile = _b.sent();
                    return [4 /*yield*/, loadModel(myNodeSetFile)];
                case 2:
                    _a = _b.sent(), instanceNodes = _a.instanceNodes, nodesetXML = _a.nodesetXML;
                    nodes = nodes.concat(instanceNodes);
                    nodes_description = Array();
                    if (yargs.argv['description']) {
                        console.log("Read descirption file");
                        workbook = xlsx.readFile(yargs.argv['description']);
                        for (i = 0; i < workbook.SheetNames.length; i++) {
                            sheet = workbook.Sheets[workbook.SheetNames[i]];
                            json = xlsx.utils.sheet_to_json(sheet);
                            nodes_description = nodes_description.concat(json);
                        }
                    }
                    console.log("Found %i descriptions", nodes_description.length);
                    extractObjectTypeTables(nodesetXML, nodes, objectTypeTable, nodes_description);
                    data.objectTypes = objectTypeTable;
                    return [4 /*yield*/, generateDocx(data, yargs.argv['template'], yargs.argv['output'])];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=main.js.map
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
//import fs = require("fs");
var fs_1 = require("fs");
var objectTypeTable_1 = require("./objectTypeTable");
var objectTypeTableChildRow_1 = require("./objectTypeTableChildRow");
var xml2js = require("xml2js");
var xlsx = require("xlsx");
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
function extractObjectTypeTables(nodesetXML, instancenodes, tables, nodes_description) {
    console.log("ObjectTypes found: ", nodesetXML.UANodeSet.UAObjectType.length);
    nodesetXML.UANodeSet.UAObjectType.forEach(function (objectType) {
        //console.log(objectType.$.BrowseName)
        var table = new objectTypeTable_1.objectTypeTable();
        table.browseName = objectType.$.BrowseName;
        //console.log(objectType.References[0].Reference)
        if (objectType.References[0].Reference !== undefined) {
            objectType.References[0].Reference.forEach(function (child) {
                //console.log(child)
                if (child.$.ReferenceType == "HasSubtype") {
                    if (child.$.IsForward == "false") {
                        table.superType = child._;
                    }
                    else {
                        console.warn("Wrong HasSubtype reference");
                    }
                }
                else {
                    var row = new objectTypeTableChildRow_1.objectTypeTableChildRow();
                    row.referenceType = child.$.ReferenceType;
                    var childNode = instancenodes.find(function (e) { return e.$.NodeId == child._; });
                    row.datatype = childNode.$.DataType;
                    row.browsename = childNode.$.BrowseName;
                    var description = nodes_description.find(function (e) { return e.Name == row.browsename; });
                    console.log(row.browsename, description);
                    if (description != undefined) {
                        row.description = description.Description;
                    }
                    row.nodeClass = childNode.NodeClass;
                    var modelingRuleNode = childNode.References[0].Reference.find(function (e) { return e.$.ReferenceType == "HasModellingRule"; });
                    switch (modelingRuleNode._) {
                        case 'i=80':
                            row.modelingrule = "Optional";
                            break;
                        case 'i=78':
                            row.modelingrule = "Mandatory";
                            break;
                        case 'i=11508':
                            row.modelingrule = "OptionalPlaceholder";
                            break;
                        case 'i=11510':
                            row.modelingrule = "MandatoryPlaceholder";
                            break;
                        default:
                            row.modelingrule = modelingRuleNode._;
                    }
                    var NodeTypeId = childNode.References[0].Reference.find(function (e) { return e.$.ReferenceType == "HasTypeDefinition"; });
                    switch (NodeTypeId._) {
                        case 'i=68':
                            row.typedefinition = "PropertyType";
                            break;
                        case 'i=58':
                            row.typedefinition = "BaseObjectType";
                            break;
                        case 'i=63':
                            row.typedefinition = "BaseDataVariableType";
                            break;
                        case 'i=2376':
                            row.typedefinition = "MultiStateDiscreteType";
                            break;
                        case 'i=17497':
                            row.typedefinition = "AnalogUnitType";
                            break;
                        case 'i=11575':
                            row.typedefinition = "FileType";
                            break;
                        case 'ns=2;i=44':
                            row.typedefinition = "FileType";
                            break;
                        case 'ns=2;i=7':
                            row.typedefinition = "NotificationType";
                            break;
                        case 'ns=2;i=21':
                            row.typedefinition = "2:ProductionType";
                            break;
                        case 'ns=2;i=44':
                            row.typedefinition = "ToolListType";
                            break;
                        case 'ns=4;i=1004':
                            row.typedefinition = "MachineryItemIdentificationType";
                            break;
                        default:
                            var NodeType = instancenodes.find(function (e) { return e.$.NodeId == NodeTypeId._; });
                            if (NodeType == undefined) {
                                console.log("No BrowseName for Type of Node %s is found", NodeTypeId);
                            }
                            else {
                                row.typedefinition = NodeType.$.BrowseName;
                            }
                    }
                    table.childrows.push(row);
                }
            });
        }
        tables.push(table);
    });
}
function loadModel(file) {
    return __awaiter(this, void 0, void 0, function () {
        var instancenodes, parser, nodesetXML;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instancenodes = Array();
                    parser = new xml2js.Parser( /* options */);
                    return [4 /*yield*/, parser.parseStringPromise(file)];
                case 1:
                    nodesetXML = _a.sent();
                    nodesetXML.UANodeSet.UAVariable.forEach(function (e) { return e.NodeClass = "UAVariable"; });
                    nodesetXML.UANodeSet.UAObject.forEach(function (e) { return e.NodeClass = "UAObject"; });
                    if (nodesetXML.UANodeSet.UAMethod !== undefined) {
                        nodesetXML.UANodeSet.UAMethod.forEach(function (e) { return e.NodeClass = "UAMethod"; });
                    }
                    nodesetXML.UANodeSet.UADataType.forEach(function (e) { return e.NodeClass = "UADataType"; });
                    nodesetXML.UANodeSet.UAObjectType.forEach(function (e) { return e.NodeClass = "UAObjectType"; });
                    nodesetXML.UANodeSet.UAVariableType.forEach(function (e) { return e.NodeClass = "UAVariableType"; });
                    instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAVariable);
                    instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAObject);
                    instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAMethod);
                    instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UADataType);
                    instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAObjectType);
                    instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAVariableType);
                    return [2 /*return*/, { instancenodes: instancenodes, nodesetXML: nodesetXML }];
            }
        });
    });
}
function generateDocx(data) {
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
                case 0: return [4 /*yield*/, fs_1.promises.readFile('OPCUA_4_GMS_v01_template.docx', 'binary')];
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
                    return [4 /*yield*/, fs_1.promises.writeFile('output.docx', buf)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var data, objectTypeTable, nodes, myNodeSetFile, _a, instancenodes, nodesetXML, workbook, nodes_description, i, sheet, json;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = Object();
                    objectTypeTable = Array();
                    nodes = Array();
                    return [4 /*yield*/, fs_1.promises.readFile("opc.ua.gms.nodeset2.xml", 'utf8')];
                case 1:
                    myNodeSetFile = _b.sent();
                    return [4 /*yield*/, loadModel(myNodeSetFile)];
                case 2:
                    _a = _b.sent(), instancenodes = _a.instancenodes, nodesetXML = _a.nodesetXML;
                    nodes = nodes.concat(instancenodes);
                    workbook = xlsx.readFile('parameterlist_v12.xlsx');
                    nodes_description = Array();
                    for (i = 1; i < workbook.SheetNames.length; i++) {
                        sheet = workbook.Sheets[workbook.SheetNames[i]];
                        json = xlsx.utils.sheet_to_json(sheet);
                        nodes_description = nodes_description.concat(json);
                    }
                    //console.log(nodes_description)
                    extractObjectTypeTables(nodesetXML, nodes, objectTypeTable, nodes_description);
                    data.obejctTypes = objectTypeTable;
                    return [4 /*yield*/, generateDocx(data)];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=main.js.map
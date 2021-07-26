import {Argv} from "yargs";
import {promises as fs} from 'fs';
import {objectTypeTable} from "./objectTypeTable";
import {objectTypeTableChildRow} from "./objectTypeTableChildRow";
import xml2js = require ("xml2js");
import xlsx = require("xlsx");
import {hideBin} from "yargs/helpers";
import yargs = require("yargs");

var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');

function extractObjectTypeTables(nodesetXML, instancenodes, tables: any[], nodes_description) {
    console.log("ObjectTypes found: ", nodesetXML.UANodeSet.UAObjectType.length);
    nodesetXML.UANodeSet.UAObjectType.forEach(function (objectType) {
        console.log(objectType)
        var table = new objectTypeTable();
        table.browseName = objectType.$.BrowseName
        if (objectType.References[0].Reference !== undefined) {
            objectType.References[0].Reference.forEach(function (child) {
                if (child.$.ReferenceType == "HasSubtype") {
                    if (child.$.IsForward == "false") {
                        table.superType = child._
                    } else {
                        console.warn("Wrong HasSubtype reference");
                    }
                } else {
                    var row = new objectTypeTableChildRow();
                    row.referenceType = child.$.ReferenceType
                    var childNode = instancenodes.find(e => e.$.NodeId == child._);
                    row.datatype = childNode.$.DataType;
                    row.browsename = childNode.$.BrowseName;
                    var description = nodes_description.find(e => e.Name == row.browsename);
                    console.log(row.browsename, description);
                    if (description != undefined) {
                        row.description = description.Description;
                    }
                    row.nodeClass = childNode.NodeClass;
                    var modelingRuleNode = childNode.References[0].Reference.find(e => e.$.ReferenceType == "HasModellingRule")
                    switch (modelingRuleNode._) {
                        case 'i=80':
                            row.modelingrule = "Optional"
                            break;
                        case 'i=78':
                            row.modelingrule = "Mandatory"
                            break;
                        case 'i=11508':
                            row.modelingrule = "OptionalPlaceholder"
                            break;
                        case 'i=11510':
                            row.modelingrule = "MandatoryPlaceholder"
                            break;
                        default:
                            row.modelingrule = modelingRuleNode._
                    }
                    if (row.nodeClass == "UAMethod"){
                        row.typedefinition = ""
                    } else{
                        var NodeTypeId = childNode.References[0].Reference.find(e => e.$.ReferenceType == "HasTypeDefinition")
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
                                const NodeType = instancenodes.find(e => e.$.NodeId == NodeTypeId._);
                                if (NodeType == undefined) {
                                    console.log("No BrowseName for Type of Node %s is found", NodeTypeId)
                                } else {
                                    row.typedefinition = NodeType.$.BrowseName
                                }
                        }
                    }
                    table.childrows.push(row);

                }
            })
        }
        tables.push(table)
    })
}

async function loadModel(file: string) {
    var instancenodes = Array();
    var parser = new xml2js.Parser(/* options */);
    var nodesetXML = await parser.parseStringPromise(file);
    if (nodesetXML.UANodeSet.UAVariable !== undefined) {
        nodesetXML.UANodeSet.UAVariable.forEach(e => e.NodeClass = "UAVariable");
        instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAVariable);
    }
    if (nodesetXML.UANodeSet.UAObject !== undefined) {
        nodesetXML.UANodeSet.UAObject.forEach(e => e.NodeClass = "UAObject");
        instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAObject);
    }
    if (nodesetXML.UANodeSet.UAMethod !== undefined) {
        nodesetXML.UANodeSet.UAMethod.forEach(e => e.NodeClass = "UAMethod");
        instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAMethod);
    }
    if (nodesetXML.UANodeSet.UADataType !== undefined) {
        nodesetXML.UANodeSet.UADataType.forEach(e => e.NodeClass = "UADataType");
        instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UADataType);
    }
    if (nodesetXML.UANodeSet.UAObjectType !== undefined) {
        nodesetXML.UANodeSet.UAObjectType.forEach(e => e.NodeClass = "UAObjectType");
        instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAObjectType);
    }
    if (nodesetXML.UANodeSet.UAVariableType !== undefined) {
        nodesetXML.UANodeSet.UAVariableType.forEach(e => e.NodeClass = "UAVariableType");
        instancenodes = instancenodes.concat(nodesetXML.UANodeSet.UAVariableType);
    }
    return {instancenodes, nodesetXML};
}

async function generateDocx(data, path, output) {
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
        console.log(JSON.stringify({error: error}, replaceErrors));

        if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors.map(function (error) {
                return error.properties.explanation;
            }).join("\n");
            console.log('errorMessages', errorMessages);
            // errorMessages is a humanly readable message looking like this:
            // 'The tag beginning with "foobar" is unopened'
        }
        throw error;
    }

    // Load the docx file as binary content
    var content = await fs.readFile(path, 'binary');

    var zip = new PizZip(content);
    var doc;
    try {
        doc = new Docxtemplater(zip, {paragraphLoop: true, linebreaks: true});
    } catch (error) {
        // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
        errorHandler(error);
    }

//set the templateVariables
    doc.setData(data);

    try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render()
    } catch (error) {
        // Catch rendering errors (errors relating to the rendering of the template: angularParser throws an error)
        errorHandler(error);
    }

    var buf = doc.getZip()
        .generate({type: 'nodebuffer'});

// buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    console.log("write file")
    await fs.writeFile(output, buf);
}

async function main() {

    yargs(hideBin(process.argv))
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
        }).argv

    console.log(yargs.argv)


    var data = Object();
    var objectTypeTable = Array();
    var nodes = Array();
    const myNodeSetFile = await fs.readFile(yargs.argv['nodeset'], 'utf8');
    var {instancenodes, nodesetXML} = await loadModel(myNodeSetFile);
    nodes = nodes.concat(instancenodes);

    var workbook = xlsx.readFile('parameterlist_v12.xlsx');
    var nodes_description = Array();
    for (let i = 1; i < workbook.SheetNames.length; i++) {
        var sheet = workbook.Sheets[workbook.SheetNames[i]];
        var json = xlsx.utils.sheet_to_json(sheet);
        nodes_description = nodes_description.concat(json);
    }
    //console.log(nodes_description)


    extractObjectTypeTables(nodesetXML, nodes, objectTypeTable, nodes_description);
    data.obejctTypes = objectTypeTable;

    await generateDocx(data, yargs.argv['template'], yargs.argv['output']);

}

main()
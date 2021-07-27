import {promises as fs} from 'fs';
import {ObjectTypeDescription} from "./objectTypeDescription";
import {ObjectTypeChildDescription} from "./objectTypeChildDescription";
import xml2js = require ("xml2js");
import xlsx = require("xlsx");
import {hideBin} from "yargs/helpers";
import yargs = require("yargs");

let PizZip = require('pizzip');
let Docxtemplater = require('docxtemplater');

function extractObjectTypeTables(nodesetXML, instanceNodes, tables: any[], nodes_description) {
    console.log("ObjectTypes found: ", nodesetXML.UANodeSet.UAObjectType.length);
    nodesetXML.UANodeSet.UAObjectType.forEach(function (objectType) {
        let currentObjectType = new ObjectTypeDescription();
        currentObjectType.browsename = objectType.$.BrowseName
        const description = nodes_description.find(e => e.Name == currentObjectType.browsename);
        if (description != undefined) {
            currentObjectType.description = description.Description;
        }
        if (objectType.References[0].Reference !== undefined) {
            objectType.References[0].Reference.forEach(function (child) {
                if (child.$.ReferenceType == "HasSubtype") {
                    if (child.$.IsForward == "false") {
                        currentObjectType.superType = child._
                    } else {
                        console.warn("Wrong HasSubtype reference");
                    }
                } else {
                    let row = new ObjectTypeChildDescription();
                    row.referenceType = child.$.ReferenceType
                    let childNode = instanceNodes.find(e => e.$.NodeId == child._);
                    row.datatype = childNode.$.DataType;
                    row.browsename = childNode.$.BrowseName;
                    const description = nodes_description.find(e => e.Name == row.browsename);
                    if (description != undefined) {
                        row.description = description.Description;
                    }
                    row.nodeClass = childNode.NodeClass;
                    const modelingRuleNode = childNode.References[0].Reference.find(e => e.$.ReferenceType == "HasModellingRule");
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
                        const NodeTypeId = childNode.References[0].Reference.find(e => e.$.ReferenceType == "HasTypeDefinition");
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
                                const NodeType = instanceNodes.find(e => e.$.NodeId == NodeTypeId._);
                                if (NodeType == undefined) {
                                    console.log("No BrowseName for Type of Node %s is found", NodeTypeId)
                                } else {
                                    row.typedefinition = NodeType.$.BrowseName
                                }
                        }
                    }
                    currentObjectType.childrows.push(row);

                }
            })
        }
        tables.push(currentObjectType)
    })
}

async function loadModel(file: string) {
    let instanceNodes = Array();
    const parser = new xml2js.Parser(/* options */);
    const nodesetXML = await parser.parseStringPromise(file);
    if (nodesetXML.UANodeSet.UAVariable !== undefined) {
        nodesetXML.UANodeSet.UAVariable.forEach(e => e.NodeClass = "UAVariable");
        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAVariable);
    }
    if (nodesetXML.UANodeSet.UAObject !== undefined) {
        nodesetXML.UANodeSet.UAObject.forEach(e => e.NodeClass = "UAObject");
        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAObject);
    }
    if (nodesetXML.UANodeSet.UAMethod !== undefined) {
        nodesetXML.UANodeSet.UAMethod.forEach(e => e.NodeClass = "UAMethod");
        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAMethod);
    }
    if (nodesetXML.UANodeSet.UADataType !== undefined) {
        nodesetXML.UANodeSet.UADataType.forEach(e => e.NodeClass = "UADataType");
        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UADataType);
    }
    if (nodesetXML.UANodeSet.UAObjectType !== undefined) {
        nodesetXML.UANodeSet.UAObjectType.forEach(e => e.NodeClass = "UAObjectType");
        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAObjectType);
    }
    if (nodesetXML.UANodeSet.UAVariableType !== undefined) {
        nodesetXML.UANodeSet.UAVariableType.forEach(e => e.NodeClass = "UAVariableType");
        instanceNodes = instanceNodes.concat(nodesetXML.UANodeSet.UAVariableType);
    }
    return { instanceNodes, nodesetXML};
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
    const content = await fs.readFile(path, 'binary');

    const zip = new PizZip(content);
    let doc;
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

    const buf = doc.getZip()
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
        })
        .option('description', {
            alias: 'd',
            type: 'string',
            description: 'path to a description excel file',
        }).argv

    console.log(yargs.argv)


    let data = Object();
    let objectTypeTable = Array();
    let nodes = Array();
    const myNodeSetFile = await fs.readFile(yargs.argv['nodeset'], 'utf8');
    let {instanceNodes, nodesetXML} = await loadModel(myNodeSetFile);
    nodes = nodes.concat(instanceNodes);

    let nodes_description = Array();
    if (yargs.argv['description']) {
        console.log("Read descirption file")
        const workbook = xlsx.readFile(yargs.argv['description']);
        for (let i = 0; i < workbook.SheetNames.length; i++) {
            const sheet = workbook.Sheets[workbook.SheetNames[i]];
            const json = xlsx.utils.sheet_to_json(sheet);
            nodes_description = nodes_description.concat(json);
        }
    }
    console.log("Found %i descriptions",nodes_description.length)


    extractObjectTypeTables(nodesetXML, nodes, objectTypeTable, nodes_description);
    data.objectTypes = objectTypeTable;

    await generateDocx(data, yargs.argv['template'], yargs.argv['output']);

}

main()
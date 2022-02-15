import {promises as fs} from 'fs';
import {ObjectTypeDescription} from "./objectTypeDescription";
import {ObjectTypeChildDescription} from "./objectTypeChildDescription";
import {DataTypeDescription} from "./dataTypeDescription";
import {DataTypeFieldDescription} from "./dataTypeFieldDescription";
import {MetaRowDescription} from './metaRowDescription';
import {ObjectDescription} from './objectDescription';
import {MethodDescription} from './methodDescription';
import {MultiStateValueDiscreteTypeDescription} from "./multiStateValueDiscreteTypeDescription";
import xml2js = require ("xml2js");
import xlsx = require("xlsx");
import {hideBin} from "yargs/helpers";
import yargs = require("yargs");
import { PropertyDescription } from './propertyDescription';


let PizZip = require('pizzip');
let Docxtemplater = require('docxtemplater');

function checkIsEventType(uaObjectTypes, objectType) {
    var returnValue = false;
    if (objectType.References[0].Reference !== undefined) {
        objectType.References[0].Reference.forEach(function (child) {
            if (child.$.ReferenceType == "HasSubtype") {
                if (child.$.IsForward == "false") {
                    switch (child._) {
                        case 'i=58':
                            return;
                        case 'i=2041': // Base Event Type
                        case 'i=2130': // 2130 System Event Type
                        case 'i=2131': // 2131 Device Failure Event Type
                            returnValue = true;
                            return;
                        default:
                            var superObjectType = uaObjectTypes.find(function (e) { return e.$.NodeId == child._; });
                            if ( superObjectType !== undefined) {
                                returnValue =  checkIsEventType(uaObjectTypes, superObjectType);
                            }
                            return; 
                    }
                }
            }
        });
    }
    return returnValue;
}

function returnDataTypeBrowseName(nodeId) {
    switch (nodeId) {
        case 'i=1':
            return "Boolean"
        case 'i=2':
            return "SByte"
        case 'i=3':
            return "Byte"
        case 'i=6':
            return 'Int32'
        case 'i=7':
            return 'UInt32'
        case 'i=8':
            return 'Int64'
        case 'i=9':
            return 'UInt64'
        case 'i=10':
            return 'Float'
        case 'i=11':
            return 'Double'
        case 'i=12':
            return 'String'
        default:
            return nodeId
    }
}

function parseUAMethod(childNode, instanceNodes, methodDescription) {
    childNode.References[0].Reference.forEach(function (child) {
        if (child.$.ReferenceType == "HasProperty") {
            let methodChildNode = instanceNodes.find(e => e.$.NodeId == child._); 
            let argument = methodChildNode.Value[0]['uax:ListOfExtensionObject'][0]['uax:ExtensionObject'][0]['uax:Body'][0]['uax:Argument'][0]   
            var name = argument['uax:Name'][0];
            var description = "n.A.";
            var dataType = "";
            
            if (argument['uax:Description'][0]['uax:Text'] != undefined)
            {
                description = argument['uax:Description'][0]['uax:Text'][0]
            }                               
            var dataTypeId = argument['uax:DataType'][0]['uax:Identifier'][0]

            let dataTypeNode = instanceNodes.find(e => e.$.NodeId == dataTypeId);
            if (dataTypeNode != undefined) {
                dataType = dataTypeNode['$'].BrowseName;
            } else {
                dataType = returnDataTypeBrowseName(dataTypeId)
            }
            if (argument['uax:ValueRank'][0] == '1')
            {
                dataType = 'Array of ' + dataType;
            }
            let metaRowDescription = new MetaRowDescription();
            if (methodChildNode.$.BrowseName == "InputArguments") {
                metaRowDescription.browsename = name; 
                metaRowDescription.datatype = dataType;
                metaRowDescription.description = description;
                methodDescription.inputrows.push(metaRowDescription)
            } else if (methodChildNode.$.BrowseName == "OutputArguments") {
                metaRowDescription.browsename = name;
                metaRowDescription.datatype = dataType;
                metaRowDescription.description = description;
                methodDescription.outputrows.push(metaRowDescription)
            } else {
                console.log("Undefined Argument in Method.")
            }        
        } 
    });
    return {}
} 

function addPropertyDescription(node, instanceNodes, property) {
    if (node.References[0].Reference !== undefined) {
        node.References[0].Reference.forEach(function (referenceNode) {
            if ( (referenceNode.$.ReferenceType == "HasProperty") && (referenceNode.$.IsForward != "false") ) {
                let childNode = instanceNodes.find(e => e.$.NodeId == referenceNode._);
                if (childNode != undefined) {
                    if (    (childNode.$.BrowseName != 'OutputArguments' ) // Used for Methods
                        && (childNode.$.BrowseName != 'InputArguments')   // Used for Methods
                        && (childNode.$.BrowseName != 'EURange')          // Defined by AnalogUnitRangeType
                        && (childNode.$.BrowseName != 'EngineeringUnits') // Defined by AnalogUnitType
                        && (childNode.$.BrowseName != 'EnumValues')       // Defined by MultiStateValueDiscreteType
                        && (childNode.$.BrowseName != 'ValueAsText') ){   // Defined by MultiStateValueDiscreteType
                        let metaRowDescription = new MetaRowDescription();
                        metaRowDescription.browsename = childNode.$.BrowseName;
                        metaRowDescription.datatype = childNode.$.DataType;
                        if (childNode.Description != undefined) {
                            metaRowDescription.description = childNode.Description[0];
                        } else {
                            metaRowDescription.description = 'N/A';
                        }
                        property.rows.push(metaRowDescription)
                    }
                }
            }
        });
    }
}

function addObjectChildDescription(instanceNodes, node, fullBrowseNamePath, row, multiStateDescriptions) {
    row.referenceType = node.$.ReferenceType
    let childNode = instanceNodes.find(e => e.$.NodeId == node._);
    if (childNode == undefined) {
        return;
    }
    row.datatype = childNode.$.DataType;
    row.browsename = childNode.$.BrowseName;
    if (childNode.Description != undefined) {
        row.description = childNode.Description[0];
    }
    row.nodeClass = childNode.NodeClass;
    const modelingRuleNode = childNode.References[0].Reference.find(e => e.$.ReferenceType == "HasModellingRule");
    switch (modelingRuleNode._) {
        case 'i=80':
            row.modelingrule = "0:Optional"
            break;
        case 'i=78':
            row.modelingrule = "0:Mandatory"
            break;
        case 'i=11508':
            row.modelingrule = "0:OptionalPlaceholder"
            break;
        case 'i=11510':
            row.modelingrule = "0:MandatoryPlaceholder"
            break;
        default:
            row.modelingrule = modelingRuleNode._
    }
    if (row.nodeClass == "UAMethod"){
        row.typedefinition = "" 
        let methodDescription = new MethodDescription();
        parseUAMethod(childNode, instanceNodes, methodDescription);
        row.method.push(methodDescription);
    } else{
        const NodeTypeId = childNode.References[0].Reference.find(e => e.$.ReferenceType == "HasTypeDefinition");
        switch (NodeTypeId._) {
            case 'i=68':
                row.typedefinition = "0:PropertyType";
                break;
            case 'i=58':
                row.typedefinition = "0:BaseObjectType";
                let objectDescription = new ObjectDescription();
                objectDescription.browsename = childNode.$.BrowseName;
                objectDescription.objectTypeBrowsename = fullBrowseNamePath;
                if (childNode.References[0].Reference !== undefined) {
                    childNode.References[0].Reference.forEach(function (objectChildReference) { 
                        if (   (objectChildReference.$.ReferenceType != 'HasTypeDefinition')
                            && (objectChildReference.$.ReferenceType != 'HasModellingRule')
                            && (objectChildReference.$.IsForward != "false") ) {
                            let objectTypeChildDescription = new ObjectTypeChildDescription();
                            addObjectChildDescription(instanceNodes, objectChildReference, fullBrowseNamePath + '_' + objectDescription.browsename, objectTypeChildDescription , multiStateDescriptions)                 
                            objectDescription.childrows.push(objectTypeChildDescription);
                        } 
                    });
                }
                row.baseObject.push(objectDescription);
                break;
            case 'i=61':
                row.typedefinition = "0:FolderType";
                break;
            case 'i=63':
                row.typedefinition = "0:BaseDataVariableType";
                break;
            case 'i=2376':
                row.typedefinition = "0:MultiStateDiscreteType";
                break;
            case 'i=11238':
                row.typedefinition = "0:MultiStateValueDiscreteType";
                var multiStateVariableBrowseName = fullBrowseNamePath + "_" + row.browsename;
                var multiStateDescriptionArray = multiStateDescriptions.filter(e => e.BrowseName == multiStateVariableBrowseName);
                let multiStateValueDiscreteTypeDescription = new MultiStateValueDiscreteTypeDescription();
                for (var i = 0; i < multiStateDescriptionArray.length; i++) {
                    let metaRowDescription = new MetaRowDescription();
                    metaRowDescription.browsename =  multiStateDescriptionArray[i].Name;
                    metaRowDescription.value = multiStateDescriptionArray[i].Value;
                    metaRowDescription.description = multiStateDescriptionArray[i].Description;
                    multiStateValueDiscreteTypeDescription.rows.push(metaRowDescription);
                }
                row.multiStateValue.push(multiStateValueDiscreteTypeDescription)
                break;
            case 'i=17497':
                row.typedefinition = "0:AnalogUnitType";
                break;
            case 'i=17570':
                row.typedefinition = "0:AnalogUnitRangeType";
                break;
            case 'i=11575':
                row.typedefinition = "0:FileType";
                break;
            case 'ns=2;i=7':
                row.typedefinition = "0:NotificationType";
                break;
            case 'ns=2;i=21':
                row.typedefinition = "2:ProductionType";
                break;
            case '6388':
                row.typedefinition = "2:LockingServiceType";
                break;
            case 'ns=2;i=44':
                row.typedefinition = "0:ToolListType";
                break;
            case 'ns=4;i=1004':
                row.typedefinition = "0:MachineryItemIdentificationType";
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
    let propertyDescription = new PropertyDescription();
    addPropertyDescription(childNode, instanceNodes, propertyDescription);
    if (propertyDescription.rows.length > 0)
    {
        row.property.push(propertyDescription);
    }

    
}

function extratSuperTypeSrc(nodeId)
{
    if (nodeId.startsWith('ns')) {
        return 'http://hbk.org/UA/TMS/DSP/'
    } else {
        return 'http://opcfoundation.org/UA/'
    }
}

function extractObjectTypeTables(nodesetXML, instanceNodes, objectTables: any[], eventTables: any[], multiStateDescriptions) {
    console.log("ObjectTypes found: ", nodesetXML.UANodeSet.UAObjectType.length);
    nodesetXML.UANodeSet.UAObjectType.forEach(function (objectType) {
        var isEventType = checkIsEventType(nodesetXML.UANodeSet.UAObjectType, objectType);
        let currentObjectType = new ObjectTypeDescription();
        currentObjectType.browsename = objectType.$.BrowseName
        if (objectType.Description != undefined) {
            currentObjectType.description = objectType.Description[0];
        }
        if (objectType.References[0].Reference !== undefined) {
            objectType.References[0].Reference.forEach(function (child) {
                if (child.$.ReferenceType == "HasSubtype") {
                    if (child.$.IsForward == "false") {
                        let superTypeNode = instanceNodes.find(e => e.$.NodeId == child._);                       
                        if (superTypeNode != undefined) {
                            currentObjectType.superType = superTypeNode.$.BrowseName;
                        } else {
                            switch (child._) {
                                case 'i=58':
                                    currentObjectType.superType = "0:BaseObjectType";
                                    break;
                                case 'i=2130':
                                    currentObjectType.superType = "0:SystemEventType";
                                    break;
                                default:
                                    currentObjectType.superType = child._;
                            }
                        }
                        currentObjectType.superTypeSrc = extratSuperTypeSrc(child._);
                    } else {
                        console.warn("Wrong HasSubtype reference");
                    }
                } else {
                    let row = new ObjectTypeChildDescription();
                    addObjectChildDescription(instanceNodes, child, currentObjectType.browsename, row, multiStateDescriptions)                 
                    currentObjectType.childrows.push(row);
                }
            })
        }
        if (isEventType == true) {
            eventTables.push(currentObjectType);
        } 
        else { 
            objectTables.push(currentObjectType);
        } 

    })
}

function checkIsEnumerationDataType(uaDataTypes, dataType) {
    var returnValue = false;
    if (dataType.References[0].Reference !== undefined) {
        dataType.References[0].Reference.forEach(function (child) {
            if (child.$.ReferenceType == "HasSubtype") {
                if (child.$.IsForward == "false") {
                    switch (child._) {
                        case 'i=24': // BaseDataType
                        case 'i=22': // Structure
                            return;
                        case 'i=29': // Enumeration
                            returnValue = true;
                            return;
                        default:
                            var superObjectType = uaDataTypes.find(function (e) { return e.$.NodeId == child._; });
                            returnValue =  checkIsEnumerationDataType(uaDataTypes, superObjectType);
                            return; 
                    }
                }
            }
        });
    }
    return returnValue;
}

function extractDataTypeTables(nodesetXML, instanceNodes, structuresTable: any[], enumTable: any[]) {
    console.log("DataTypes found: ", nodesetXML.UANodeSet.UADataType.length);
    nodesetXML.UANodeSet.UADataType.forEach(function (dataType) {
        var isEnumerationDataType = checkIsEnumerationDataType(nodesetXML.UANodeSet.UADataType, dataType);
        let currentDataType = new DataTypeDescription();
        currentDataType.browsename = dataType.$.BrowseName;
        currentDataType.description = dataType.$.Description;
        if (dataType.Description != undefined)
        {
            currentDataType.description = dataType.Description[0];
        }
        if (dataType.References[0].Reference !== undefined) {
            dataType.References[0].Reference.forEach(function (child) {
                if (child.$.ReferenceType == "HasSubtype") {
                    if (child.$.IsForward == "false") {
                        let superTypeNode = instanceNodes.find(e => e.$.NodeId == child._);                   
                        if (superTypeNode != undefined) {
                            currentDataType.superType = superTypeNode.$.BrowseName;
                        } else {
                            switch (child._) {
                                case 'i=29':
                                    currentDataType.superType = "0:Enumeration";
                                    break;
                                case 'i=22':
                                    currentDataType.superType = "0:Structure";
                                    break;
                                default:
                                    currentDataType.superType = child._;
                            }
                        }
                        currentDataType.superTypeSrc = extratSuperTypeSrc(child._);
                    } else {
                        console.warn("Wrong HasSubtype reference");
                    }
                } 
            })
        }
        dataType.Definition[0].Field.forEach(function (field) {
            let row = new DataTypeFieldDescription();
            row.browsename = field.$.Name;
            if (field.Description != undefined)
                row.description = field.Description[0];

            if (isEnumerationDataType == true) {    
                row.value = field.$.Value;
            } else {
                row.datatype = field.$.DataType;
            }
            currentDataType.childrows.push(row);
        })
        if (isEnumerationDataType == true) {
            enumTable.push(currentDataType);
        } 
        else { 
            structuresTable.push(currentDataType);
        } 
    });
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
            description: 'path to a MultiStateValueDiscreteType description excel file',
        }).argv

    console.log(yargs.argv)


    let data = Object();
    let objectTypeTable = Array();
    let eventTypeTable = Array();
    let structureTable = Array();
    let enumTable = Array();
    let nodes = Array();
    const myNodeSetFile = await fs.readFile(yargs.argv['nodeset'], 'utf8');
    let {instanceNodes, nodesetXML} = await loadModel(myNodeSetFile);
    nodes = nodes.concat(instanceNodes);

    let multiStateDescriptions = Array();
    if (yargs.argv['description']) {
        console.log("Read descirption file")
        const workbook = xlsx.readFile(yargs.argv['description']);
        for (let i = 0; i < workbook.SheetNames.length; i++) {
            const sheet = workbook.Sheets[workbook.SheetNames[i]];
            const json = xlsx.utils.sheet_to_json(sheet);
            multiStateDescriptions = multiStateDescriptions.concat(json);
        }
    }
    console.log("Found %i definitions of MultiStateValueDiscreteTypes",multiStateDescriptions.length)

    extractObjectTypeTables(nodesetXML, nodes, objectTypeTable, eventTypeTable, multiStateDescriptions);
    extractDataTypeTables(nodesetXML, nodes, structureTable, enumTable);
    data.objectTypes = objectTypeTable;
    data.eventTypes = eventTypeTable;
    data.structures = structureTable;
    data.enumerations = enumTable;
    await generateDocx(data, yargs.argv['template'], yargs.argv['output']);

}

main()
# opcua_doc_generator
A scripte to generate a docx documentation from a OPC UA nodeset file

## Warning this script not stable the template placeholder can be changed very often

## Features
- Generate a  docx Documentation from a OPC UA nodeset file
- Customize with your own Template

### Missing Features and Problems
- Doc internal references
- VariableType generation
- DataType generation
- Method generation
- Profile generation
- other models will not import

## Dependencies
https://github.com/open-xml-templating/docxtemplater
https://www.npmjs.com/package/xml2js
https://www.npmjs.com/package/xlsx

## Example 
A simple coffee machine OPC UA model we use in our trainings and a simple template based on the OPC UA  Companion Specification template
 run 
```node main.js -n example/coffeemachine.nodeset2.xml -t example/opcua_template.docx```

## How to Customize 
Copy the example doc file or start with an empty docx file.
You can add the text between: {#obejctTypes} and {/obejctTypes} will be reapte for each ObejctType.
The following placeholder can insert and will be removed with the value of the ObjectType:
- {browseName}
- {isAbstract}
- {superType}
- {superTypeSrc} (not completed)
Also you can access childs of the ObjectType insert {childrows}...{/childrows}. Child has the following placeholders:- {browseName}
- {browseName}
- {nodeClass}
- {referenceType}
- {#datatype}{datatype}{/datatype}
- {typedefintion}
- {modelingsrule}
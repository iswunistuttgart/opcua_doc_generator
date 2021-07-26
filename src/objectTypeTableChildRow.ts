export class objectTypeTableChildRow {
    private _referenceType: string;
    private _nodeClass: string;
    private _browsename: string;
    private _datatype: string;
    private _description: string;

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get referenceType(): string {
        return this._referenceType;
    }

    set referenceType(value: string) {
        this._referenceType = value;
    }

    get nodeClass(): string {
        return this._nodeClass;
    }

    set nodeClass(value: string) {
        this._nodeClass = value;
    }

    get browsename(): string {
        return this._browsename;
    }

    set browsename(value: string) {
        if (value.startsWith('1') == true) {
            this._browsename = value.substring(2);
        } else {
            this._browsename = value;
        }
    }

    get datatype(): string {
        return this._datatype;
    }

    set datatype(value: string) {
        this._datatype = value;
    }

    get typedefinition(): string {
        return this._typedefinition;
    }

    set typedefinition(value: string) {
        this._typedefinition = value;
    }

    get modelingrule(): string {
        return this._modelingrule;
    }

    set modelingrule(value: string) {
        this._modelingrule = value;
    }

    private _typedefinition: string;
    private _modelingrule: string;
}
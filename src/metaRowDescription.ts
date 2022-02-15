export class MetaRowDescription {
    private _browsename: string = "";
    private _datatype: string = "";
    private _description: string = "";
    private _value: string;


    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get datatype(): string {
        return this._datatype;
    }

    set datatype(value: string) {
        this._datatype = value;
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

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
    }

}
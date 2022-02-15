import {DataTypeFieldDescription} from "./dataTypeFieldDescription";

export class DataTypeDescription {
    private _browsename: string
    private _isAbstract: string = "False";
    private _superType: string;
    private _superTypeSrc: string;
    private _description: string = "";

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    childrows: DataTypeFieldDescription[] = [];

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

    get isAbstract(): string {
        return this._isAbstract;
    }

    set isAbstract(value: string) {
        this._isAbstract = value;
    }

    get superType(): string {
        return this._superType;
    }

    set superType(value: string) {
        this._superType = value;
    }

    get superTypeSrc(): string {
        return this._superTypeSrc;
    }

    set superTypeSrc(value: string) {
        this._superTypeSrc = value;
    }
}
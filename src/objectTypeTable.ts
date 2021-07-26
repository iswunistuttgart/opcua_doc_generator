import {objectTypeTableChildRow} from "./objectTypeTableChildRow";

export class objectTypeTable {
    private _browseName: string
    private _isAbstract: string = "False";
    private _superType: string;
    private _superTypeSrc: string;
    childrows: objectTypeTableChildRow[] = [];

    get browseName(): string {
        return this._browseName;
    }

    set browseName(value: string) {
        if (value.startsWith('1') == true) {
            this._browseName = value.substring(2);
        } else {
            this._browseName = value;
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
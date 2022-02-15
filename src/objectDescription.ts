import {ObjectTypeChildDescription} from "./objectTypeChildDescription";

export class ObjectDescription {
    private _browsename: string
    private _objectTypeBrowsename: string

    childrows: ObjectTypeChildDescription[] = [];

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

    get objectTypeBrowsename(): string {
        return this._objectTypeBrowsename;
    }

    set objectTypeBrowsename(value: string) {
        if (value.startsWith('1') == true) {
            this._objectTypeBrowsename = value.substring(2);
        } else {
            this._objectTypeBrowsename = value;
        }
    }
}
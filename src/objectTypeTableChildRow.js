"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectTypeTableChildRow = void 0;
var objectTypeTableChildRow = /** @class */ (function () {
    function objectTypeTableChildRow() {
    }
    Object.defineProperty(objectTypeTableChildRow.prototype, "description", {
        get: function () {
            return this._description;
        },
        set: function (value) {
            this._description = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTableChildRow.prototype, "referenceType", {
        get: function () {
            return this._referenceType;
        },
        set: function (value) {
            this._referenceType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTableChildRow.prototype, "nodeClass", {
        get: function () {
            return this._nodeClass;
        },
        set: function (value) {
            this._nodeClass = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTableChildRow.prototype, "browsename", {
        get: function () {
            return this._browsename;
        },
        set: function (value) {
            if (value.startsWith('1') == true) {
                this._browsename = value.substring(2);
            }
            else {
                this._browsename = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTableChildRow.prototype, "datatype", {
        get: function () {
            return this._datatype;
        },
        set: function (value) {
            this._datatype = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTableChildRow.prototype, "typedefinition", {
        get: function () {
            return this._typedefinition;
        },
        set: function (value) {
            this._typedefinition = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTableChildRow.prototype, "modelingrule", {
        get: function () {
            return this._modelingrule;
        },
        set: function (value) {
            this._modelingrule = value;
        },
        enumerable: false,
        configurable: true
    });
    return objectTypeTableChildRow;
}());
exports.objectTypeTableChildRow = objectTypeTableChildRow;
//# sourceMappingURL=objectTypeTableChildRow.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectTypeTable = void 0;
var objectTypeTable = /** @class */ (function () {
    function objectTypeTable() {
        this._isAbstract = "False";
        this.childrows = [];
    }
    Object.defineProperty(objectTypeTable.prototype, "browseName", {
        get: function () {
            return this._browseName;
        },
        set: function (value) {
            if (value.startsWith('1') == true) {
                this._browseName = value.substring(2);
            }
            else {
                this._browseName = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTable.prototype, "isAbstract", {
        get: function () {
            return this._isAbstract;
        },
        set: function (value) {
            this._isAbstract = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTable.prototype, "superType", {
        get: function () {
            return this._superType;
        },
        set: function (value) {
            this._superType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(objectTypeTable.prototype, "superTypeSrc", {
        get: function () {
            return this._superTypeSrc;
        },
        set: function (value) {
            this._superTypeSrc = value;
        },
        enumerable: false,
        configurable: true
    });
    return objectTypeTable;
}());
exports.objectTypeTable = objectTypeTable;
//# sourceMappingURL=objectTypeTable.js.map
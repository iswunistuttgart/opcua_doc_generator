"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeDescription = void 0;
var ObjectTypeDescription = /** @class */ (function () {
    function ObjectTypeDescription() {
        this._isAbstract = "False";
        this._description = "";
        this.childrows = [];
    }
    Object.defineProperty(ObjectTypeDescription.prototype, "description", {
        get: function () {
            return this._description;
        },
        set: function (value) {
            this._description = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeDescription.prototype, "browsename", {
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
    Object.defineProperty(ObjectTypeDescription.prototype, "isAbstract", {
        get: function () {
            return this._isAbstract;
        },
        set: function (value) {
            this._isAbstract = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeDescription.prototype, "superType", {
        get: function () {
            return this._superType;
        },
        set: function (value) {
            this._superType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeDescription.prototype, "superTypeSrc", {
        get: function () {
            return this._superTypeSrc;
        },
        set: function (value) {
            this._superTypeSrc = value;
        },
        enumerable: false,
        configurable: true
    });
    return ObjectTypeDescription;
}());
exports.ObjectTypeDescription = ObjectTypeDescription;
//# sourceMappingURL=objectTypeDescription.js.map
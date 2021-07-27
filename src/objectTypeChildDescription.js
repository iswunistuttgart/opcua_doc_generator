"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeChildDescription = void 0;
var ObjectTypeChildDescription = /** @class */ (function () {
    function ObjectTypeChildDescription() {
        this._description = "";
    }
    Object.defineProperty(ObjectTypeChildDescription.prototype, "description", {
        get: function () {
            return this._description;
        },
        set: function (value) {
            this._description = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeChildDescription.prototype, "referenceType", {
        get: function () {
            return this._referenceType;
        },
        set: function (value) {
            this._referenceType = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeChildDescription.prototype, "nodeClass", {
        get: function () {
            return this._nodeClass;
        },
        set: function (value) {
            this._nodeClass = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeChildDescription.prototype, "browsename", {
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
    Object.defineProperty(ObjectTypeChildDescription.prototype, "datatype", {
        get: function () {
            return this._datatype;
        },
        set: function (value) {
            this._datatype = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeChildDescription.prototype, "typedefinition", {
        get: function () {
            return this._typedefinition;
        },
        set: function (value) {
            this._typedefinition = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObjectTypeChildDescription.prototype, "modelingrule", {
        get: function () {
            return this._modelingrule;
        },
        set: function (value) {
            this._modelingrule = value;
        },
        enumerable: false,
        configurable: true
    });
    return ObjectTypeChildDescription;
}());
exports.ObjectTypeChildDescription = ObjectTypeChildDescription;
//# sourceMappingURL=objectTypeChildDescription.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Enum(...x) {
    const o = {};
    for (const k in x) {
        o[x[k]] = x[k];
    }
    return o;
}
exports.Enum = Enum;
exports.Cardinal = Enum("north", "east", "south", "west");
//# sourceMappingURL=index.js.map
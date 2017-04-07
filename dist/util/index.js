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
function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}
exports.shuffle = shuffle;
//# sourceMappingURL=index.js.map
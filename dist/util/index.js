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
function Array2D(width, height) {
    const a = new Array(width);
    for (let i = 0; i < width; i++) {
        a[i] = new Array(height);
    }
    return a;
}
exports.Array2D = Array2D;
//# sourceMappingURL=index.js.map
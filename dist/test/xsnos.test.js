"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="mocha" />
const chai_1 = require("chai");
const puzzles_1 = require("../puzzles");
describe("The Xs and Os solver", () => {
    it("should be able to solve a trivial Xs and Os puzzle", () => {
        const solver = new puzzles_1.XsAndOs.Solver();
        const solutions = solver.solutions([
            ["O", , , ,],
            [, , , ,],
            [, , , ,],
            [, , , ,]
        ]);
        const value = solutions.next().value;
        (0, chai_1.expect)(value).to.not.be.undefined;
        solver.display(value);
    });
});
//# sourceMappingURL=xsnos.test.js.map
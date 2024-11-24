"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="mocha" />
const chai_1 = require("chai");
const puzzles_1 = require("../puzzles");
describe("the crossword solver", () => {
    it("can fill up a simple crossword", () => {
        const solver = new puzzles_1.Crossword.Solver(new puzzles_1.Crossword.BasicDictionary("ace\ntea\ntot\natt\nceo\neat"));
        const solutions = solver.solutions({ values: [["?", "?", "?"], ["?", "?", "?"], ["?", "?", "?"]] });
        const first = solutions.next();
        (0, chai_1.expect)(first).to.exist;
        (0, chai_1.expect)(first.value).to.exist;
        (0, chai_1.expect)(first.value).to.deep.equal({ values: [["A", "C", "E"], ["T", "E", "A"], ["T", "O", "T"]] });
    });
});
//# sourceMappingURL=crossword.test.js.map
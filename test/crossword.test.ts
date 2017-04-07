/// <reference types="mocha" />
import {expect} from "chai";
import {Crossword} from "../puzzles";

describe("the crossword solver", () => {
    it("can fill up a simple crossword", () => {
        const solver = new Crossword.Solver(new Crossword.BasicDictionary("ace\ntea\ntot\natt\nceo\neat"));
        const solutions = solver.solutions({ values: [["?","?","?"],["?","?","?"],["?","?","?"]] });
        const first = solutions.next();
        expect(first).to.exist;
        expect(first.value).to.exist;
        expect(first.value).to.deep.equal({ values: [["A", "C", "E"],["T", "E", "A"],["T", "O", "T"]] });
    });
});
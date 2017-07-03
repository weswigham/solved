/// <reference types="mocha" />
import {expect} from "chai";
import {XsAndOs} from "../puzzles";

describe("The Xs and Os solver", () => {
    it("should be able to solve a trivial Xs and Os puzzle", () => {
        const solver = new XsAndOs.Solver();
        const solutions = solver.solutions([
            ["O",   ,   ,   ,],
            [   ,   ,   ,   ,],
            [   ,   ,   ,   ,],
            [   ,   ,   ,   ,]
        ]);
        const value = solutions.next().value;
        expect(value).to.not.be.undefined;
        solver.display(value);
    });
})
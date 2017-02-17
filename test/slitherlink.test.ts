/// <reference types="mocha" />
import {expect} from "chai";
import {Slitherlink} from "../";

describe("a slitherlink solver", () => {
    // Samples taken from http://www.nikoli.com/en/puzzles/slitherlink/
    it("should be able to parse and solve an easy slitherlink puzzle", () => {
        // Sample problem 1 by Casty
        const initial = Slitherlink.newState([
            [ , , , ,0,2, , , , ,],
            [2,3,0, , , , ,2,2,3,],
            [ , , ,3, , ,3, , , ,],
            [3, , , ,2,2, , , ,1,],
            [ ,2, ,2, , ,0, ,2, ,],
            [ ,2, ,3, , ,3, ,3, ,],
            [3, , , ,1,0, , , ,2,],
            [ , , ,2, , ,3, , , ,],
            [3,0,3, , , , ,3,3,1,],
            [ , , , ,0,2, , , , ,],
        ]);
        const solver = new Slitherlink.Solver();
        console.log("Initial:");
        solver.display(initial);
        console.log("");
        const gen = solver.solutions(initial);
        const first = gen.next().value;
        expect(first).to.not.be.undefined;
        solver.display(first);
    });

    it("should be able to parse and solve a medium slitherlink puzzle", () => {
        // Sample problem 6 by -4
        const initial = Slitherlink.newState([
            [3, ,1, , ,3, , ,2,2, , ,3, , ,2, ,1,],
            [3, ,1,1,0,2, , , , , , ,3,1,3,3, ,2,],
            [ , , , , , , ,3, , ,2, , , , , , , ,],
            [ ,0,3, ,1,1, ,1,3,2,2, ,2,1, ,3,1, ,],
            [ ,3, , , ,3, , , , , , ,3, , , ,1, ,],
            [ ,1, , , ,1, , , , , , ,0, , , ,3, ,],
            [ ,3,2, ,3,2, ,2,3,2,3, ,3,3, ,2,3, ,],
            [ , , , , , , ,1, , ,3, , , , , , , ,],
            [3, ,1,2,3,0, , , , , , ,0,2,1,2, ,0,],
            [3, ,2, , ,2, , ,3,1, , ,2, , ,1, ,1,],
        ]);
        const solver = new Slitherlink.Solver();
        console.log("Initial:");
        solver.display(initial);
        console.log("");
        const gen = solver.solutions(initial);
        const first = gen.next().value;
        expect(first).to.not.be.undefined;
        solver.display(first);
    });
});
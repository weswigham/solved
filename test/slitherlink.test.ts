/// <reference types="mocha" />
import {expect} from "chai";
import {Slitherlink} from "../";

describe("a slitherlink solver", () => {
    it("should be able to parse and solve an easy slitherlink puzzle", () => {
        debugger;
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
        const gen = solver.solutions(initial);
        const first = gen.next().value;
        expect(first).to.not.be.undefined;
        solver.display(first);
    });
});
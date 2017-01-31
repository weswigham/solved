/// <reference types="mocha" />
import {expect} from "chai";
import {RainRadarSolver, RainRadarState} from "../";

describe("a rainradar solver", () => {
    it("should be able to solve a simple rainradar puzzle", () => {
        const solver = new RainRadarSolver();
        const solutions = solver.solutions({columns: [3, -1, -1], rows: [3, -1, -1], clouds: []});
        const resolved = [...solutions];
        expect(resolved.length).to.equal(1);
        expect(resolved[0]).to.be.deep.equal({columns: [0, -1, -1], rows: [0, -1, -1], clouds: [{ul: {x: 0, y: 0}, lr: {x: 2, y: 2}}]});
    });

    it("should be able to solve a more complicated rainradar puzzle", () => {
        const solver = new RainRadarSolver();
        const solutions = solver.solutions({columns: [5, -1, -1, 5, -1], rows: [-1, -1, -1, 4, -1], clouds: []});
        const resolved = [...solutions];
        expect(resolved.length).to.equal(1);
        expect(resolved[0]).to.be.deep.equal({columns: [0, -1, -1, 0, -1], rows: [-1, -1, -1, 0, -1], clouds: [{ul: {x: 0, y: 0}, lr: {x: 3, y: 4}}]});
    });

    it("should be able to soulve a multicloud rain radar puzzle", () => {
        
    });
});
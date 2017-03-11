"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="mocha" />
const chai_1 = require("chai");
const puzzles_1 = require("../puzzles");
describe("a rainradar solver", () => {
    it("should be able to solve a simple rainradar puzzle", () => {
        const solver = new puzzles_1.RainRadar.Solver();
        const solutions = solver.solutions({ columns: [3, -1, -1], rows: [3, -1, -1], clouds: [] });
        const resolved = [...solutions];
        chai_1.expect(resolved.length).to.equal(1);
        chai_1.expect(resolved[0]).to.be.deep.equal({ columns: [0, -1, -1], rows: [0, -1, -1], clouds: [{ ul: { x: 0, y: 0 }, lr: { x: 2, y: 2 } }] });
    });
    it("should be able to solve a more complicated rainradar puzzle", () => {
        const solver = new puzzles_1.RainRadar.Solver();
        const solutions = solver.solutions({ columns: [5, -1, 5, 5, -1], rows: [-1, -1, -1, 4, -1], clouds: [] });
        const resolved = [...solutions];
        chai_1.expect(resolved.length).to.equal(1);
        chai_1.expect(resolved[0]).to.be.deep.equal({ columns: [0, -1, 0, 0, -1], rows: [-1, -1, -1, 0, -1], clouds: [{ ul: { x: 0, y: 0 }, lr: { x: 3, y: 4 } }] });
    });
    it("should be able to verify when there are multiple meaningfully different solutions", () => {
        const solver = new puzzles_1.RainRadar.Solver();
        const solutions = solver.solutions({ columns: [5, -1, -1, 5, -1], rows: [-1, -1, -1, 4, -1], clouds: [] });
        const resolved = [...solutions];
        chai_1.expect(resolved.length).to.equal(2);
        chai_1.expect(resolved[1]).to.be.deep.equal({ columns: [0, -1, -1, 0, -1], rows: [-1, -1, -1, 0, -1], clouds: [
                { ul: { x: 0, y: 0 }, lr: { x: 1, y: 4 } },
                { ul: { x: 3, y: 0 }, lr: { x: 4, y: 4 } }
            ] });
        chai_1.expect(resolved[0]).to.be.deep.equal({ columns: [0, -1, -1, 0, -1], rows: [-1, -1, -1, 0, -1], clouds: [{ ul: { x: 0, y: 0 }, lr: { x: 3, y: 4 } }] });
    });
    it("should be able to soulve a multicloud rain radar puzzle", () => {
        const solver = new puzzles_1.RainRadar.Solver();
        const solutions = solver.solutions({ columns: [-1, 4, -1, 3, -1], rows: [-1, 4, 2, 4, -1], clouds: [] });
        const resolved = [...solutions];
        chai_1.expect(resolved.length).to.equal(1);
        chai_1.expect(resolved[0]).to.be.deep.equal({ columns: [-1, 0, -1, 0, -1], rows: [-1, 0, 0, 0, -1], clouds: [
                { ul: { x: 0, y: 0 }, lr: { x: 1, y: 1 } },
                { ul: { x: 0, y: 3 }, lr: { x: 1, y: 4 } },
                { ul: { x: 3, y: 1 }, lr: { x: 4, y: 3 } },
            ] });
    });
});
//# sourceMappingURL=rainradar.test.js.map
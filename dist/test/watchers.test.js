"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="mocha" />
const chai_1 = require("chai");
const puzzles_1 = require("../puzzles");
describe("the watchers solver", () => {
    it("can solve a watchers puzzle", () => {
        const solver = new puzzles_1.Watchers.Solver(false);
        const initialState = {
            rules: [
                [
                    [
                        [true, false, true, false, false],
                        [false, false, false, false, false],
                        [true, false, true, false, true],
                        [false, false, false, false, false],
                        [false, false, false, false, false]
                    ],
                    [
                        [false, true, false, false, false],
                        [true, false, false, false, true],
                        [false, false, true, false, false],
                        [false, false, false, false, false],
                        [false, false, true, false, false]
                    ],
                    [
                        [true, false, true, false, false],
                        [true, false, false, false, false],
                        [false, false, false, false, false],
                        [false, false, false, true, true],
                        [false, false, false, false, false]
                    ],
                    [
                        [false, false, false, true, false],
                        [false, false, false, false, false],
                        [false, true, false, false, false],
                        [false, false, true, true, false],
                        [false, true, false, false, false]
                    ],
                    [
                        [false, false, false, false, true],
                        [false, false, false, false, false],
                        [false, true, false, true, false],
                        [false, false, true, false, false],
                        [true, false, false, false, false]
                    ]
                ],
                [
                    [[false, true, true, false, false], [true, false, false, true, false], [false, false, false, true, false], [false, false, false, false, false], [false, false, false, false, false]],
                    [[false, false, false, false, false], [false, true, false, false, false], [true, true, false, false, false], [false, false, false, false, false], [false, true, false, true, false]],
                    [[false, false, false, false, false], [false, false, true, false, true], [false, false, false, false, false], [false, false, true, false, false], [true, false, false, false, true]],
                    [[false, false, false, false, false], [true, false, false, true, true], [false, false, false, false, false], [false, false, true, true, false], [false, false, false, false, false]],
                    [[false, true, false, false, false], [false, false, true, true, true], [false, false, false, false, false], [false, true, false, false, false], [false, false, false, false, false]]
                ],
                [
                    [[true, false, false, false, false], [false, true, false, false, false], [true, false, false, false, false], [true, false, false, false, true], [false, false, false, false, false]],
                    [[false, false, false, true, true], [false, true, false, false, false], [false, true, false, false, false], [false, false, false, false, true], [false, false, false, false, false]],
                    [[true, true, false, false, false], [false, false, false, false, false], [false, false, true, false, false], [true, true, false, false, false], [false, false, false, false, false]],
                    [[false, false, false, false, true], [true, false, false, false, false], [false, false, false, true, false], [false, false, false, false, true], [false, false, true, false, false]],
                    [[true, false, false, false, false], [false, false, false, false, false], [false, false, false, false, true], [false, true, false, true, false], [false, true, false, false, false]]
                ],
                [
                    [[false, false, false, false, false], [false, false, false, false, false], [true, false, true, false, false], [true, false, false, false, false], [false, false, true, true, false]],
                    [[false, false, false, false, false], [false, false, false, false, true], [false, false, true, false, true], [false, true, false, false, false], [false, false, false, false, true]],
                    [[false, false, false, true, true], [false, false, true, true, false], [false, false, false, false, false], [false, false, true, false, false], [false, false, false, false, false]],
                    [[false, false, true, true, false], [false, false, false, true, false], [false, false, false, false, true], [false, false, false, true, false], [false, false, false, false, false]],
                    [[false, false, true, false, false], [false, false, false, false, false], [true, true, false, true, false], [false, false, false, false, true], [false, false, false, false, false]]
                ],
                [
                    [[false, false, false, false, true], [false, false, true, false, false], [false, false, false, false, false], [false, false, false, false, false], [true, false, true, true, false]],
                    [[false, false, false, true, false], [false, true, false, false, false], [false, false, false, false, true], [false, false, false, false, false], [false, true, false, false, true]],
                    [[false, true, false, false, false], [false, false, false, false, false], [false, false, false, true, false], [true, false, false, false, false], [true, false, true, false, false]],
                    [[false, false, false, false, false], [false, true, false, false, false], [false, false, false, false, false], [true, false, false, false, false], [true, false, false, true, true]],
                    [[false, false, false, false, false], [false, false, true, false, false], [false, false, false, false, false], [false, true, false, false, false], [false, true, false, true, true]]
                ]
            ],
            board: [
                [true, false, true, false, true],
                [true, false, true, true, false],
                [false, false, false, false, false],
                [true, false, true, false, false],
                [false, false, true, false, false]
            ],
            route: [],
        };
        const solutions = solver.solutions(initialState);
        const first = solutions.next();
        (0, chai_1.expect)(first).to.exist;
        (0, chai_1.expect)(first.value).to.exist;
        // solver.display(first.value);
        const mapPos = ([i, j]) => `(${String.fromCharCode("A".charCodeAt(0) + j)}${i + 1})`;
        const formatted = first.value.route.map(mapPos).join(",");
        // console.log(formatted);
        // const route = first.value.route;
        // let state = initialState;
        // for (const [i, j] of route) {
        //     state = solver.applyRule(initialState.rules[i][j], state, i, j);
        //     console.log(mapPos([i, j]));
        //     solver.display(state)
        // }
        (0, chai_1.expect)(formatted).to.deep.equal("(A1),(C2),(E2),(B1),(A4),(B4),(A5)");
    });
});
//# sourceMappingURL=watchers.test.js.map
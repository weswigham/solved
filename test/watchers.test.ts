/// <reference types="mocha" />
import {expect} from "chai";
import {Watchers} from "../puzzles";

describe("the watchers solver", () => {
    it("can solve a watchers puzzle", () => {
        const solver = new Watchers.Solver(false);
        const initialState: Watchers.State = {
            rules: [
            [
                [
                    [true ,false,true ,false,false],
                    [false,false,false,false,false],
                    [true ,false,true ,false,true ],
                    [false,false,false,false,false],
                    [false,false,false,false,false]
                ],
                [
                    [false,true ,false,false,false],
                    [true ,false,false,false,true ],
                    [false,false,true ,false,false],
                    [false,false,false,false,false],
                    [false,false,true ,false,false]
                ],
                [
                    [true ,false,true ,false,false],
                    [true ,false,false,false,false],
                    [false,false,false,false,false],
                    [false,false,false,true ,true ],
                    [false,false,false,false,false]
                ],
                [
                    [false,false,false,true ,false],
                    [false,false,false,false,false],
                    [false,true ,false,false,false],
                    [false,false,true ,true ,false],
                    [false,true ,false,false,false]
                ],
                [
                    [false,false,false,false,true ],
                    [false,false,false,false,false],
                    [false,true ,false,true ,false],
                    [false,false,true ,false,false],
                    [true ,false,false,false,false]
                ]
            ],
            [
            [[false,true ,true ,false,false],[true ,false,false,true ,false],[false,false,false,true ,false],[false,false,false,false,false],[false,false,false,false,false]],
            [[false,false,false,false,false],[false,true ,false,false,false],[true ,true ,false,false,false],[false,false,false,false,false],[false,true ,false,true ,false]],
            [[false,false,false,false,false],[false,false,true ,false,true ],[false,false,false,false,false],[false,false,true ,false,false],[true ,false,false,false,true ]],
            [[false,false,false,false,false],[true ,false,false,true ,true ],[false,false,false,false,false],[false,false,true ,true ,false],[false,false,false,false,false]],
            [[false,true ,false,false,false],[false,false,true ,true ,true ],[false,false,false,false,false],[false,true ,false,false,false],[false,false,false,false,false]]
            ],
            [
            [[true ,false,false,false,false],[false,true ,false,false,false],[true ,false,false,false,false],[true ,false,false,false,true ],[false,false,false,false,false]],
            [[false,false,false,true ,true ],[false,true ,false,false,false],[false,true ,false,false,false],[false,false,false,false,true ],[false,false,false,false,false]],
            [[true ,true ,false,false,false],[false,false,false,false,false],[false,false,true ,false,false],[true ,true ,false,false,false],[false,false,false,false,false]],
            [[false,false,false,false,true ],[true ,false,false,false,false],[false,false,false,true ,false],[false,false,false,false,true ],[false,false,true ,false,false]],
            [[true ,false,false,false,false],[false,false,false,false,false],[false,false,false,false,true ],[false,true ,false,true ,false],[false,true ,false,false,false]]
            ],

            [
            [[false,false,false,false,false],[false,false,false,false,false],[true ,false,true ,false,false],[true ,false,false,false,false],[false,false,true ,true ,false]],
            [[false,false,false,false,false],[false,false,false,false,true ],[false,false,true ,false,true ],[false,true ,false,false,false],[false,false,false,false,true ]],
            [[false,false,false,true ,true ],[false,false,true ,true ,false],[false,false,false,false,false],[false,false,true ,false,false],[false,false,false,false,false]],
            [[false,false,true ,true ,false],[false,false,false,true ,false],[false,false,false,false,true ],[false,false,false,true ,false],[false,false,false,false,false]],
            [[false,false,true ,false,false],[false,false,false,false,false],[true ,true ,false,true ,false],[false,false,false,false,true ],[false,false,false,false,false]]
            ],

            [
            [[false,false,false,false,true ],[false,false,true ,false,false],[false,false,false,false,false],[false,false,false,false,false],[true ,false,true ,true ,false]],
            [[false,false,false,true ,false],[false,true ,false,false,false],[false,false,false,false,true ],[false,false,false,false,false],[false,true ,false,false,true ]],
            [[false,true ,false,false,false],[false,false,false,false,false],[false,false,false,true ,false],[true ,false,false,false,false],[true ,false,true ,false,false]],
            [[false,false,false,false,false],[false,true ,false,false,false],[false,false,false,false,false],[true ,false,false,false,false],[true ,false,false,true ,true ]],
            [[false,false,false,false,false],[false,false,true ,false,false],[false,false,false,false,false],[false,true ,false,false,false],[false,true ,false,true ,true ]]
            ]
        ],
            board: [
                [true , false, true , false, true ],
                [true , false, true , true , false],
                [false, false, false, false, false],
                [true , false, true , false, false],
                [false, false, true , false, false]
            ],

            route: [],
        };
        const solutions = solver.solutions(initialState);
        const first = solutions.next();
        expect(first).to.exist;
        expect(first.value).to.exist;
        // solver.display(first.value);
        const mapPos = ([i, j]: [number, number]) => `(${String.fromCharCode("A".charCodeAt(0) + j)}${i+1})`;
        const formatted = first.value.route.map(mapPos).join(",");
        // console.log(formatted);
        // const route = first.value.route;
        // let state = initialState;
        // for (const [i, j] of route) {
        //     state = solver.applyRule(initialState.rules[i][j], state, i, j);
        //     console.log(mapPos([i, j]));
        //     solver.display(state)
        // }
        expect(formatted).to.deep.equal("(A1),(C2),(E2),(B1),(A4),(B4),(A5)");
    });
});
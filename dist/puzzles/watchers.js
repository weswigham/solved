"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solver = void 0;
const solver_1 = require("../solver");
class Solver extends solver_1.AbstractSolver {
    constructor() {
        super(...arguments);
        this.bfs = true;
        this.visited = new Set;
    }
    stringify(state) {
        let output = "";
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                output += state.board[i][j] ? "x" : ".";
            }
            output += "\n";
        }
        return output;
    }
    display(state) {
        const output = this.stringify(state);
        console.log(output);
    }
    *enumerateNext(state) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (state.board[i][j]) {
                    const nextState = this.applyRule(state.rules[i][j], state, i, j);
                    const nextStateHash = this.stringify(nextState);
                    if (!this.visited.has(nextStateHash)) {
                        this.visited.add(nextStateHash);
                        yield nextState;
                    }
                }
            }
        }
    }
    isSolution(state) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (state.board[i][j])
                    return false;
            }
        }
        return true;
    }
    applyRule(rule, state, iRule, jRule) {
        const output = [[false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false], [false, false, false, false, false]];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (rule[i][j]) {
                    output[i][j] = !state.board[i][j];
                }
                else {
                    output[i][j] = state.board[i][j];
                }
            }
        }
        return { rules: state.rules, board: output, route: [...state.route, [iRule, jRule]] };
    }
}
exports.Solver = Solver;
//# sourceMappingURL=watchers.js.map
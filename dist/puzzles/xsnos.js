"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const solver_1 = require("../solver");
const util_1 = require("../util");
exports.CellState = util_1.Enum("X", "O");
function cloneState(state) {
    const ret = util_1.Array2D(state.length, state.length);
    for (let row = 0; row < state.length; row++) {
        for (let column = 0; column < state[row].length; column++) {
            ret[row][column] = state[row][column];
        }
    }
    return ret;
}
function isInvalid(state) {
    // TODO: Combine all of the follow checks into a single iteration pass
    // Check that no more than two consecutive identical elements exist in each row
    for (let row = 0; row < state.length; row++) {
        let priorOne = undefined;
        let priorTwo = undefined;
        for (let column = 0; column < state[row].length; column++) {
            if (priorOne && priorTwo && state[row][column] && priorOne === priorTwo && priorOne === state[row][column])
                return true;
            priorTwo = priorOne;
            priorOne = state[row][column];
        }
    }
    // Check that no more than two consecutive identical elements exist in each column
    for (let column = 0; column < state.length; column++) {
        let priorOne = undefined;
        let priorTwo = undefined;
        for (let row = 0; row < state[column].length; row++) {
            if (priorOne && priorTwo && state[row][column] && priorOne === priorTwo && priorOne === state[row][column])
                return true;
            priorTwo = priorOne;
            priorOne = state[row][column];
        }
    }
    // Check that the number of X's and O's in each row does not exceed half the row's length
    for (let row = 0; row < state.length; row++) {
        let xCount = 0;
        let oCount = 0;
        for (let column = 0; column < state[row].length; column++) {
            if (state[row][column] === "X")
                xCount++;
            if (state[row][column] === "O")
                oCount++;
        }
        if (xCount > (state.length / 2))
            return true;
        if (oCount > (state.length / 2))
            return true;
    }
    // Check that the number of X's and O's in each column does not exceed half the row's length
    for (let column = 0; column < state.length; column++) {
        let xCount = 0;
        let oCount = 0;
        for (let row = 0; row < state[column].length; row++) {
            if (state[row][column] === "X")
                xCount++;
            if (state[row][column] === "O")
                oCount++;
        }
        if (xCount > (state.length / 2))
            return true;
        if (oCount > (state.length / 2))
            return true;
    }
    return false;
}
class Solver extends solver_1.StrategicAbstractSolver {
    constructor(...strategies) {
        if (strategies.length === 0) {
            super(...Strategies.all().map(s => s.strategy));
        }
        else {
            super(...strategies);
        }
        this.isInvalid = isInvalid;
    }
    display(state) {
        for (let row = 0; row < state.length; row++) {
            let rowText = "";
            for (let column = 0; column < state[row].length; column++) {
                rowText += (state[row][column] || ".");
            }
            console.log(rowText);
        }
    }
    isSolution(state) {
        let xCount = 0;
        let oCount = 0;
        for (let row = 0; row < state.length; row++) {
            for (let column = 0; column < state[row].length; column++) {
                if (state[row][column] === "X")
                    xCount++;
                if (state[row][column] === "O")
                    oCount++;
            }
        }
        return xCount === oCount && xCount === (Math.pow(state.length, 2)) / 2;
    }
}
exports.Solver = Solver;
var Strategies;
(function (Strategies) {
    const _all = [];
    /**
     * Returns an array of all registered strategies in registration order
     */
    function all() {
        return _all;
    }
    Strategies.all = all;
    /**
     * Add a strategy to the list of all strategies which are automatically used and attach the function's name as the strategy name
     */
    function register(strat) {
        _all.push({ strategy: solver_1.strategy(strat), name: strat.name });
        return strat;
    }
    Strategies.register = register;
    // Finds the first open spot, then tries to place an X there. Then an O.
    // Brute force AF.
    Strategies.PlaceNextLetter = register(function* PlaceNextLetter(state) {
        for (let row = 0; row < state.length; row++) {
            for (let column = 0; column < state[row].length; column++) {
                if (!state[row][column]) {
                    const X = cloneState(state);
                    X[row][column] = "X";
                    yield X;
                    const O = cloneState(state);
                    O[row][column] = "O";
                    yield O;
                    return;
                }
            }
        }
    });
})(Strategies = exports.Strategies || (exports.Strategies = {}));
//# sourceMappingURL=xsnos.js.map
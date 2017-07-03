import {StrategicAbstractSolver, Strategy, strategy} from "../solver";
import {Enum, Array2D} from "../util";


export type CellState = "X" | "O" | undefined;
export const CellState = Enum("X", "O");

export type State = CellState[][];

function cloneState(state: State) {
    const ret = Array2D<CellState>(state.length, state.length);
    for (let row = 0; row < state.length; row++) {
        for (let column = 0; column < state[row].length; column++) {
            ret[row][column] = state[row][column];
        }
    }

    return ret;
}

function isInvalid(state: State) {
    // TODO: Combine all of the follow checks into a single iteration pass

    // Check that no more than two consecutive identical elements exist in each row
    for (let row = 0; row < state.length; row++) {
        let priorOne: CellState = undefined;
        let priorTwo: CellState = undefined;
        for (let column = 0; column < state[row].length; column++) {
            if (priorOne && priorTwo && state[row][column] && priorOne === priorTwo && priorOne === state[row][column]) return true;
            priorTwo = priorOne;
            priorOne = state[row][column];
        }
    }

    // Check that no more than two consecutive identical elements exist in each column
    for (let column = 0; column < state.length; column++) {
        let priorOne: CellState = undefined;
        let priorTwo: CellState = undefined;
        for (let row = 0; row < state[column].length; row++) {
            if (priorOne && priorTwo && state[row][column] && priorOne === priorTwo && priorOne === state[row][column]) return true;
            priorTwo = priorOne;
            priorOne = state[row][column];
        }
    }

    // Check that the number of X's and O's in each row does not exceed half the row's length
    for (let row = 0; row < state.length; row++) {
        let xCount: number = 0;
        let oCount: number = 0;
        for (let column = 0; column < state[row].length; column++) {
            if (state[row][column] === "X") xCount++;
            if (state[row][column] === "O") oCount++;
        }

        if (xCount > (state.length / 2)) return true;
        if (oCount > (state.length / 2)) return true;
    }

    // Check that the number of X's and O's in each column does not exceed half the row's length
    for (let column = 0; column < state.length; column++) {
        let xCount: number = 0;
        let oCount: number = 0;
        for (let row = 0; row < state[column].length; row++) {
            if (state[row][column] === "X") xCount++;
            if (state[row][column] === "O") oCount++;
        }

        if (xCount > (state.length / 2)) return true;
        if (oCount > (state.length / 2)) return true;
    }

    return false;
}

export class Solver extends StrategicAbstractSolver<State> {
    constructor(...strategies: Strategy<State>[]) {
        if (strategies.length === 0) {
            super(...Strategies.all().map(s => s.strategy));
        }
        else {
            super(...strategies);
        }
        this.isInvalid = isInvalid;
    }
    public display(state: State) {
        for (let row = 0; row < state.length; row++) {
            let rowText = "";
            for (let column = 0; column < state[row].length; column++) {
                rowText += (state[row][column] || ".");
            }
            console.log(rowText);
        }
    }

    public isSolution(state: State) {
        let xCount: number = 0;
        let oCount: number = 0;
        for (let row = 0; row < state.length; row++) {
            for (let column = 0; column < state[row].length; column++) {
                if (state[row][column] === "X") xCount++;
                if (state[row][column] === "O") oCount++;
            }
        }

        return xCount === oCount && xCount === (state.length**2)/2;
    }
}


export namespace Strategies {
    const _all: {strategy: Strategy<State>, name: string}[] = [];
    /**
     * Returns an array of all registered strategies in registration order
     */
    export function all(): {strategy: Strategy<State>, name: string}[] {
        return _all;
    }

    /**
     * Add a strategy to the list of all strategies which are automatically used and attach the function's name as the strategy name
     */
    export function register(strat: Strategy<State>): Strategy<State> {
        _all.push({strategy: strategy(strat), name: strat.name});
        return strat;
    }

    // Finds the first open spot, then tries to place an X there. Then an O.
    // Brute force AF.
    export const PlaceNextLetter = register(function* PlaceNextLetter(state: State) {
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
}
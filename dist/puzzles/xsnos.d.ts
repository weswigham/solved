import { StrategicAbstractSolver, Strategy } from "../solver";
export declare type CellState = "X" | "O" | undefined;
export declare const CellState: {
    X: "X";
    O: "O";
};
export declare type State = CellState[][];
export declare class Solver extends StrategicAbstractSolver<State> {
    constructor(...strategies: Strategy<State>[]);
    display(state: State): void;
    isSolution(state: State): boolean;
}
export declare namespace Strategies {
    /**
     * Returns an array of all registered strategies in registration order
     */
    function all(): {
        strategy: Strategy<State>;
        name: string;
    }[];
    /**
     * Add a strategy to the list of all strategies which are automatically used and attach the function's name as the strategy name
     */
    function register(strat: Strategy<State>): Strategy<State>;
    const PlaceNextLetter: Strategy<CellState[][]>;
}

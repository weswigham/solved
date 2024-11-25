import { AbstractSolver } from "../solver";
export type CellState = boolean;
export type RowState<T> = [T, T, T, T, T];
export type RowColumnState<T> = [RowState<T>, RowState<T>, RowState<T>, RowState<T>, RowState<T>];
export type RuleDescription = RowColumnState<CellState> | undefined;
export interface State {
    rules: RowColumnState<RuleDescription>;
    board: RowColumnState<CellState>;
    route: [number, number][];
}
export declare class Solver extends AbstractSolver<State> {
    bfs: boolean;
    visited: Set<string>;
    private stringify;
    display(state: State): void;
    enumerateNext(state: State): Generator<State, void, unknown>;
    isSolution(state: State): boolean;
    applyRule(rule: RuleDescription, state: State, iRule: number, jRule: number): State;
}

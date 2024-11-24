import { Point2D } from "../util";
import { AbstractSolver } from "../solver";
export interface Cloud {
    ul: Point2D;
    lr: Point2D;
}
export interface State {
    columns: number[];
    rows: number[];
    clouds: Cloud[];
}
export declare class Solver extends AbstractSolver<State> {
    display(state: State): void;
    enumerateNext(state: State): Generator<State, void, unknown>;
    isSolution(state: State): boolean;
    private validCloudToAdd;
    private cloudHasBoundaryViolations;
    private embiggen;
    private pairInterferes;
}

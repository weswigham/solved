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
    enumerateNext(state: State): IterableIterator<State>;
    isSolution(state: State): boolean;
    private validCloudToAdd(cloud, state);
    private cloudHasBoundaryViolations(cloud, clouds);
    private embiggen(c1);
    private pairInterferes(c1, c2);
}

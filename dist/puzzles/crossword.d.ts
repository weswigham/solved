import { AbstractSolver } from "../solver";
export declare type GridElement = "." | "?" | string;
export interface State {
    values: GridElement[][];
}
export interface WordRef {
    pattern: string;
    pos: {
        i: number;
        j: number;
    };
    reference: number;
    variant: "across" | "down";
}
export interface Dictionary {
    grep(against: string): string[];
    count(pattern: string): number;
}
export declare class BasicDictionary implements Dictionary {
    private dict;
    private cacheSize;
    private storedSearches;
    private storedResults;
    private cachedKeys;
    constructor(dict: string, cacheSize?: number);
    private get(pattern);
    private remember(pattern);
    grep(pattern: string): string[];
    count(pattern: string): number;
}
export declare class Solver extends AbstractSolver<State> {
    protected dict: Dictionary;
    protected randomize: boolean;
    constructor(dict: Dictionary, randomize?: boolean, printStates?: boolean);
    display(s: State): void;
    private fillState(s, ref, option);
    enumerateNext(s: State): IterableIterator<State>;
    private checkState(s);
    isSolution(s: State): boolean;
    private generateAcross(values);
    private generateDown(across, values);
}

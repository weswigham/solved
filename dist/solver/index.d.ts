export declare abstract class AbstractSolver<TState> {
    protected printStates: boolean;
    private statesExplored;
    constructor(printStates?: boolean);
    solutions(initial: TState): IterableIterator<TState>;
    abstract enumerateNext(state: TState): IterableIterator<TState>;
    abstract isSolution(state: TState): boolean;
    isInvalid?: (state: TState) => boolean;
    abstract display?(state: TState): void;
}
export interface Strategy<T> {
    (input: T): IterableIterator<T | undefined>;
}
export interface StrategicState {
    lastStrategyApplied?: string;
}
export declare function strategy<T extends StrategicState>(gen: (a: T) => IterableIterator<T | undefined>): (a: T) => IterableIterator<T | undefined>;
export declare abstract class StrategicAbstractSolver<TState> extends AbstractSolver<TState> {
    private strategies;
    constructor(...strats: Strategy<TState>[]);
    enumerateNext(state: TState): IterableIterator<TState>;
}

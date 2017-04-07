export abstract class AbstractSolver<TState> {
    private statesExplored = 0;
    constructor(protected printStates: boolean = false) {}
    *solutions(initial: TState): IterableIterator<TState> {
        this.statesExplored++;
        if (this.printStates && this.display) {
            console.log(`State number ${this.statesExplored}`);
            this.display(initial);
        }
        if (this.isInvalid && this.isInvalid(initial)) {
            return;
        }
        if (this.isSolution(initial)) {
            if (this.printStates) console.log(`State number ${this.statesExplored} is a solution.`);
            return yield initial;
        }
        for (const next of this.enumerateNext(initial)) {
            yield* this.solutions(next);
        }
    }
    abstract enumerateNext(state: TState): IterableIterator<TState>;
    abstract isSolution(state: TState): boolean;
    isInvalid?: (state: TState) => boolean; // Useful for early bails when an entire tree of options goes bad
    abstract display?(state: TState): void;
}

export interface Strategy<T> {
    (input: T): IterableIterator<T | undefined>;
}


export interface StrategicState {
    lastStrategyApplied?: string;
}

export function strategy<T extends StrategicState>(gen: (a: T) => IterableIterator<T | undefined>): (a: T) => IterableIterator<T | undefined> {
    return function*(state) {
        for (const next of gen(state)) {
            if (next) {
                next.lastStrategyApplied = gen.name;
            }
            yield next;
        }
    }
}

export abstract class StrategicAbstractSolver<TState> extends AbstractSolver<TState> {
    private strategies: Strategy<TState>[] = [];
    constructor(...strats: Strategy<TState>[]) {
        super();

        this.strategies = strats;
    }
    *enumerateNext(state: TState): IterableIterator<TState> {
        for (const strat of this.strategies) {
            const gen = strat(state);
            const result = gen.next();
            if (result && result.value) {
                yield result.value;
                yield* gen;
                break;
            }
        }
    }
}
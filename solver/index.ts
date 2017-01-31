export abstract class AbstractSolver<TState> {
    private statesExplored = 0;
    constructor(protected printStates: boolean = false) {}
    *solutions(initial: TState): IterableIterator<TState> {
        debugger;
        this.statesExplored++;
        if (this.printStates && this.display) {
            console.log(`State number ${this.statesExplored}`);
            this.display(initial); 
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
    abstract display?(state: TState): void;
}
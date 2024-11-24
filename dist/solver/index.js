"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategicAbstractSolver = exports.AbstractSolver = void 0;
exports.strategy = strategy;
class AbstractSolver {
    constructor(printStates = false) {
        this.printStates = printStates;
        this.statesExplored = 0;
        this.bfs = false;
    }
    *solutions(initial) {
        this.statesExplored++;
        if (this.printStates && this.display) {
            console.log(`State number ${this.statesExplored}`);
            this.display(initial);
        }
        if (this.isInvalid && this.isInvalid(initial)) {
            return;
        }
        if (this.isSolution(initial)) {
            if (this.printStates)
                console.log(`State number ${this.statesExplored} is a solution.`);
            return yield initial;
        }
        if (this.bfs) {
            const work = [this.enumerateNext(initial)];
            while (work.length) {
                const item = work.pop();
                for (const next of item) {
                    if (this.isSolution(next)) {
                        yield next;
                    }
                    else {
                        work.unshift(this.enumerateNext(next));
                    }
                }
            }
        }
        else {
            for (const next of this.enumerateNext(initial)) {
                yield* this.solutions(next);
            }
        }
    }
}
exports.AbstractSolver = AbstractSolver;
function strategy(gen) {
    return function* (state) {
        for (const next of gen(state)) {
            if (next) {
                next.lastStrategyApplied = gen.name;
            }
            yield next;
        }
    };
}
class StrategicAbstractSolver extends AbstractSolver {
    constructor(...strats) {
        super();
        this.strategies = [];
        this.strategies = strats;
    }
    *enumerateNext(state) {
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
exports.StrategicAbstractSolver = StrategicAbstractSolver;
//# sourceMappingURL=index.js.map
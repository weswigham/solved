import {AbstractSolver} from "../solver";

// `true` for deployed, `false` for underground
export type CellState = boolean;

export type RowState<T> = [T, T, T, T, T];

export type RowColumnState<T> = [RowState<T>, RowState<T>, RowState<T>, RowState<T>, RowState<T>];

export type RuleDescription = RowColumnState<CellState>;

export interface State {
    rules: RowColumnState<RuleDescription>;
    board: RowColumnState<CellState>;
    route: [number, number][];
}

export class Solver extends AbstractSolver<State> {
    bfs = true;
    visited = new Set<string>;
    private stringify(state: State) {
        let output = ""
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                output += state.board[i][j] ? "x" : ".";
            }
            output += "\n"
        }
        return output;
    }
    display(state: State) {
        const output = this.stringify(state);
        console.log(output);
    }
    *enumerateNext(state: State) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (state.board[i][j]) {
                    const nextState = this.applyRule(state.rules[i][j], state, i, j);
                    const nextStateHash = this.stringify(nextState);
                    if (!this.visited.has(nextStateHash)) {
                        this.visited.add(nextStateHash);
                        yield nextState;
                    }
                }
            }
        }
    }
    isSolution(state: State) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (state.board[i][j]) return false;
            }
        }
        return true;
    }

    applyRule(rule: RuleDescription, state: State, iRule: number, jRule: number): State {
        const output: RowColumnState<CellState> = [[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false],[false,false,false,false,false]];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (rule[i][j]) {
                    output[i][j] = !state.board[i][j]
                }
                else {
                    output[i][j] = state.board[i][j]
                }
            }
        }
        return { rules: state.rules, board: output, route: [...state.route, [iRule, jRule]] };

    }
}
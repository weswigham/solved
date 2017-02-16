import {Strategy, StrategicAbstractSolver, strategy, StrategicState} from "../solver";
import {Cardinal, Enum} from "../util";

export type EdgeState = "wall" | "notwall";
export const EdgeState = Enum("wall", "notwall");

export type RowColumn = "row" | "column";
export const RowColumn = Enum("row", "column");

export interface State extends StrategicState {
    grid: (number | undefined)[][];
    edges: {[x in RowColumn]: (EdgeState | undefined)[][]};
}

const directions = Object.keys(Cardinal);

/*
As far as edges are concerned, array lengths should be based on grid lengths:
    - rows: outer (x) length = grid.length;
            inner (y) length = grid[0].length + 1;
    - columns: outer (x) = grid.length + 1;
               inner (y) length = grid[0].length;

*/
function affectingGridSquares(state: State, which: RowColumn, x: number, y: number): IterableIterator<[number, number]>;
function affectingGridSquares(state: State, ...tuple: (RowColumn | number)[]): IterableIterator<[number, number]>;
function* affectingGridSquares(state: State, which: RowColumn, x: number, y: number): IterableIterator<[number, number]> {
    switch (which) {
        case RowColumn.row:
            if (y > 0) {
                // Above
                yield [x, y - 1];
            }
            if (y < (state.grid[0].length - 1)) {
                // Below
                yield [x, y];
            }
            break;
        case RowColumn.column:
            if (x > 0) {
                // Left
                yield [x - 1, y];
            }
            if (x < (state.grid.length - 1)) {
                // Right
                yield [x, y];
            }
    }
}

function lookupEdge(state: State, direction: Cardinal, x: number, y: number): [RowColumn, number, number] {
    switch(direction) {
        case Cardinal.north:
            return [RowColumn.row, x, y];
        case Cardinal.east:
            return [RowColumn.column, x + 1, y];
        case Cardinal.south:
            return [RowColumn.row, x, y + 1];
        case Cardinal.west:
            return [RowColumn.column, x, y];
    }
}

function* connectingEdges(state: State, type: RowColumn, x: number, y: number, side: Cardinal): IterableIterator<[RowColumn, number, number]> {
    if (type === "row") {
        if (side === Cardinal.north || side === Cardinal.south) throw new Error("Invalid arguments - can't get sides other than west or east for a row edge");
        if (side === Cardinal.west) {
            yield ["row", x - 1, y];
            yield ["column", x, y];
            yield ["column", x, y - 1];
        }
        else {
            yield ["row", x + 1, y];
            yield ["column", x + 1, y];
            yield ["column", x + 1, y - 1];
        }
    }
    else {
        if (side === Cardinal.west || side === Cardinal.east) throw new Error("Invalid arguments - can't get sides other than south or north for a column edge");
        if (side === Cardinal.north) {
            yield ["column", x, y - 1];
            yield ["row", x - 1, y];
            yield ["row", x, y];
        }
        else {
            yield ["column", x, y + 1];
            yield ["row", x - 1, y + 1];
            yield ["row", x, y + 1];
        }
    }
}


function getEdge(state: State, kind: RowColumn, x: number, y: number): EdgeState;
function getEdge(state: State, ...tuple: (RowColumn | number)[]): EdgeState;
function getEdge(state: State, kind: RowColumn, x: number, y: number): EdgeState {
    if (x < 0 || y < 0 || x >= state.edges[kind].length || y >= state.edges[kind][x].length) return "notwall";
    return state.edges[kind][x][y];
}

function setEdge(es: EdgeState, state: State, kind: RowColumn, x: number, y: number): EdgeState;
function setEdge(es: EdgeState, state: State, ...tuple: (RowColumn | number)[]): EdgeState;
function setEdge(es: EdgeState, state: State, kind: RowColumn, x: number, y: number): EdgeState {
    if (x < 0 || y < 0 || x >= state.edges[kind].length || y >= state.edges[kind][x].length) {
        if (es !== "notwall") throw new Error("Attempted to set edge outside map to a wall");
        return "notwall";
    }
    if (state.edges[kind][x][y] && state.edges[kind][x][y] !== es) throw new Error("Attempted to overwrite already set edge with differing value");
    return state.edges[kind][x][y] = es;
}

const dot = "·";

export class Solver extends StrategicAbstractSolver<State> {
    constructor(...strategies: Strategy<State>[]) {
        if (strategies.length === 0) {
            super(...Strategies.all());
        }
        else {
            super(...strategies);
        }
    }
    isSolution(state: State): boolean {
        // All number constraints must be satisfied
        for (let x = 0; x < state.grid.length; x++) {
            for (let y = 0; y < state.grid[0].length; y++) {
                const count = state.grid[x][y];
                if (typeof count === "number") {
                    const walls = getEdge(state, ...lookupEdge(state, Cardinal.north, x, y)) === "wall" ? 1 : 0 +
                    getEdge(state, ...lookupEdge(state, Cardinal.east, x, y)) === "wall" ? 1 : 0 +
                    getEdge(state, ...lookupEdge(state, Cardinal.south, x, y)) === "wall" ? 1 : 0 +
                    getEdge(state, ...lookupEdge(state, Cardinal.west, x, y)) === "wall" ? 1 : 0;
                    if (walls != count) {
                        return false;
                    }
                }
            }
        }

        // The loop must not contain intersections, and there must only be one continuous loop

        // Count edges before we walk a loop - if the loop we walk has fewwer edges than this, then
        // there must be multiple loops or edge chains.
        let totalEdges = 0;
        let startingEdge: [RowColumn, number, number] = undefined;
        for (const type of (Object.keys(EdgeState) as RowColumn[])) {
            // We can let x and y overflow beyond array bounds by one, since OOB array access just
            // returns `undefined` - same as an empty edge
            for (let x = 0; x < state.grid.length + 1; x++) {
                for (let y = 0; y < state.grid[0].length; y++) {
                    if (state.edges[type][x][y] === "wall") {
                        totalEdges++;
                        if (!startingEdge) {
                            startingEdge = [type, x, y];
                        }
                    }
                }
            }
        }
        if (!startingEdge) {
            // If there's no edges...yet all constraints are satisfied... Then this must be a puzzles with no 
            // constraints or only '0' grid constraints. We'll assume that even in this case, you have to place
            // edges to make a loop and there to be a solution.
            return false;
        }

        let startPainted = 0;
        let followed = 0;
        // If we follow a row, then follow it out the side we didn't come from
        const followRow = (x: number, y: number, from: Cardinal): boolean => {
            followed++;
            if (followed > totalEdges) {
                throw new Error("Somehow traversed more edges than exist in the graph"); // This should be impossible. Please send help.
            }
            if (from === Cardinal.north || from === Cardinal.south) throw new Error("Must specify which direction the edge is entered from.");
            if (startingEdge[0] === "row" && startingEdge[1] === x && startingEdge[2] === y) {
                startPainted++;
                if (startPainted > 1) {
                    return true;
                }
            }
            switch (from) {
                // From the west, exit on one of the three connections on the right edge
                case Cardinal.west: {
                    // First, verify that only one wall exits
                    const up = lookupEdge(state, Cardinal.east, x, y - 1);
                    const right = lookupEdge(state, Cardinal.north, x + 1, y);
                    const down = lookupEdge(state, Cardinal.east, x, y + 1);
                    const filtered = [up, down, right].filter(e => getEdge(state, ...e) === "wall");
                    if (filtered.length !== 1) {
                        return false;
                    }
                    // Then just walk to the next edge
                    const selected = filtered[0];
                    if (selected === up) {
                        return followColumn(selected[1], selected[2], Cardinal.south);
                    }
                    if (selected === down) {
                        return followColumn(selected[1], selected[2], Cardinal.north);
                    }
                    if (selected === right) {
                        return followRow(selected[1], selected[2], Cardinal.west);
                    }
                    break;
                }
                // From the east, ext from one of the three connections on the left edge
                case Cardinal.east: {
                    // First, verify that only one wall exits
                    const up = lookupEdge(state, Cardinal.east, x, y - 1);
                    const left = lookupEdge(state, Cardinal.north, x - 1, y);
                    const down = lookupEdge(state, Cardinal.east, x, y + 1);
                    const filtered = [up, down, left].filter(e => getEdge(state, ...e) === "wall");
                    if (filtered.length !== 1) {
                        return false;
                    }
                    // Then just walk to the next edge
                    const selected = filtered[0];
                    if (selected === up) {
                        return followColumn(selected[1], selected[2], Cardinal.south);
                    }
                    if (selected === down) {
                        return followColumn(selected[1], selected[2], Cardinal.north);
                    }
                    if (selected === left) {
                        return followRow(selected[1], selected[2], Cardinal.east);
                    }
                    break;
                }
            }
        }

        const followColumn = (x: number, y: number, from: Cardinal): boolean => {
            followed++;
            if (followed > totalEdges) {
                throw new Error("Somehow traversed more edges than exist in the graph"); // This should be impossible. Please send help.
            }
            if (from === Cardinal.west || from === Cardinal.east) throw new Error("Must specify which direction the edge is entered from.");
            if (startingEdge[0] === "column" && startingEdge[1] === x && startingEdge[2] === y) {
                startPainted++;
                if (startPainted > 1) {
                    return true;
                }
            }
            switch (from) {
                // From the north, exit on one of the three connections on the bottom edge
                case Cardinal.north: {
                    // First, verify that only one wall exits
                    const left = lookupEdge(state, Cardinal.north, x - 1, y);
                    const right = lookupEdge(state, Cardinal.north, x + 1, y);
                    const down = lookupEdge(state, Cardinal.east, x, y + 1);
                    const filtered = [left, down, right].filter(e => getEdge(state, ...e) === "wall");
                    if (filtered.length !== 1) {
                        return false;
                    }
                    // Then just walk to the next edge
                    const selected = filtered[0];
                    if (selected === left) {
                        return followColumn(selected[1], selected[2], Cardinal.east);
                    }
                    if (selected === down) {
                        return followColumn(selected[1], selected[2], Cardinal.north);
                    }
                    if (selected === right) {
                        return followRow(selected[1], selected[2], Cardinal.west);
                    }
                    break;
                }
                // From the south, exit from one of the three connections on the north edge
                case Cardinal.south: {
                    // First, verify that only one wall exits
                    const up = lookupEdge(state, Cardinal.east, x, y - 1);
                    const left = lookupEdge(state, Cardinal.north, x - 1, y);
                    const right = lookupEdge(state, Cardinal.north, x + 1, y);
                    const filtered = [up, right, left].filter(e => getEdge(state, ...e) === "wall");
                    if (filtered.length !== 1) {
                        return false;
                    }
                    // Then just walk to the next edge
                    const selected = filtered[0];
                    if (selected === up) {
                        return followColumn(selected[1], selected[2], Cardinal.south);
                    }
                    if (selected === right) {
                        return followColumn(selected[1], selected[2], Cardinal.west);
                    }
                    if (selected === left) {
                        return followRow(selected[1], selected[2], Cardinal.east);
                    }
                    break;
                }
            }
        }

        const looped = startingEdge[0] === "row" ?
            followRow(startingEdge[1], startingEdge[2], Cardinal.west) :
            followColumn(startingEdge[1], startingEdge[2], Cardinal.north);
        if (!looped) {
            return false; // Traversed a nonloop - must be a loop
        }
        if (followed > totalEdges) {
            throw new Error("Somehow followed a valid loop across more edges than the graph had!");
        }
        return followed === totalEdges;
    }
    display(state: State) {
        for (let y = 0; y < state.grid[0].length; y++) {
            // Draw line of dots/walls/constraints Above
            const top = state.edges.row.map(column => column[y]).map(edge => edge === "wall" ? "---" : edge === "notwall" ? " x " : "   ").join(dot);
            console.log(top);
            let gridrow = "";
            for (let x = 0; x < state.grid.length; x++) {
                const left = getEdge(state, ...lookupEdge(state, Cardinal.west, x, y));
                const num = state.grid[x][y];
                gridrow += (left === "wall" ? "|" : left === "notwall" ? "x" : " ") + num;
            }
            const right = getEdge(state, ...lookupEdge(state, Cardinal.east, state.grid.length, y));
            gridrow += right;
            console.log(gridrow);
        }
        const bottom = state.edges.row.map(column => column[state.grid[0].length]).map(edge => edge === "wall" ? "---" : edge === "notwall" ? " x " : "   ").join(dot);
        console.log(bottom);
        if (state.lastStrategyApplied) console.log(`Used strategy ${state.lastStrategyApplied}.`);
    }
}

function cloneState(state: State): State {
    return {
        grid: state.grid.map(c => [...c]),
        edges: {
            row: state.edges.row.map(r => [...r]),
            column: state.edges.column.map(c => [...c])
        }
    };
}


export namespace Strategies {
    const _all: Strategy<State>[] = [];
    /**
     * Returns an array of all registered strategies in registration order
     */
    export function all(): Strategy<State>[] {
        return _all;
    }

    /**
     * Add a strategy to the list of all strategies which are automatically used and attach the function's name as the strategy name
     */
    export function register(strat: Strategy<State>): Strategy<State> {
        _all.push(strategy(strat));
        return strat;
    }


    type ActionGetEdge = {
        (rowCol: RowColumn, x: number, y: number): EdgeState;
        (...tuple: (RowColumn | number)[]): EdgeState;
    }
    type ActionSetEdge = {
        (es: EdgeState, rowCol: RowColumn, x: number, y: number): EdgeState;
        (es: EdgeState, ...tuple: (RowColumn | number)[]): EdgeState;
    }
    type ForEachGridSquareAction = (
        x: number,
        y: number,
        getGridElement: (x: number, y: number) => (number | undefined),
        lookupEdge: (dir: Cardinal, x: number, y: number) => [RowColumn, number, number],
        getEdge: ActionGetEdge,
        setEdge: ActionSetEdge,
    ) => any
    function forEachGridSquare(state: State, action: ForEachGridSquareAction) {
        let changed: State | undefined = undefined;
        let violation = false;
        for (let x = 0; x < state.grid.length; x++) {
            for (let y = 0; y< state.grid[x].length; y++) {
                action(x, y, getGridElement, lookupEdgeInternal, getEdgeInternal, setEdgeInternal);
                if (violation) return undefined; // If the set edge function marks a constraint violation, return no new state
            }
        }
        return changed;

        function getGridElement(x: number, y: number) {
            return (changed || state).grid[x][y];
        }

        function lookupEdgeInternal(dir: Cardinal, x: number, y: number) {
            return lookupEdge(changed || state, dir, x, y);
        }

        function getEdgeInternal(...tuple: (RowColumn | number)[]): EdgeState {
            return getEdge(changed || state, ...tuple);
        }

        function setEdgeInternal(es: EdgeState, ...tuple: (RowColumn | number)[]): EdgeState {
            if (!changed && getEdge(state, ...tuple) !== es) changed = cloneState(state);
            const val = setEdge(es, changed || state, ...tuple);

            // Validate numeric constraints adjacent to the placed edge (save loop checking for elsewhere)
            for (const [x, y] of affectingGridSquares(changed || state, ...tuple)) {
                const num = getGridElement(x, y);
                if (num === undefined) continue;
                let found = directions.map(d => getEdgeInternal(...lookupEdgeInternal(d as Cardinal, x, y))).filter(k => k === "wall").length;
                if (found > num) {
                    violation = true;
                    break;
                }
            }

            return val;
        }
    }

    /**
     * Contrain 1,2,3 are all very similar - this shows how they are all similarly constraining
     */
    function constrain(n: number, state: State) {
        return forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 3) return;
            const edges = directions.map(dir => lookupEdge(dir as Cardinal, x, y));
            if (edges.filter(e => getEdge(...e) === "notwall").length === (4 - n)) {
                edges.forEach(e => {
                    if (getEdge(...e) !== "notwall") {
                        setEdge("wall", ...e);
                    }
                });
            }
            else if (edges.filter(e => getEdge(...e) === "wall").length === n) {
                edges.forEach(e => {
                    if (getEdge(...e) !== "wall") {
                        setEdge("notwall", ...e);
                    }
                });
            }
        });
    }

    /**
     * Marks all the edges around a zero as not a wall.
     */
    export const ConstrainZero = register(function* ConstrainZeros(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        return forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 0) return;
            for (const dir of directions) {
                const edge = lookupEdge(dir as Cardinal, x, y);
                const kind = getEdge(...edge);
                if (kind !== "notwall") {
                    setEdge("notwall", ...edge);
                }
            }
        });
    });

    /**
     * Find all threes with:
     *  - Three adjacent walls - last side is not a wall
     *  - One adjacent not a wall - all three other sides are walls
     */
    export const ConstrainThree = register(function* ConstrainThree(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        return constrain(3, state);
    });

    /**
     * Find all ones with:
     *  - Three adjacent not a walls - last side is a wall
     *  - One adjacent wall - other three sides are not a wall 
     */
    export const ConstrainOne = register(function* ConstrainOne(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        return constrain(1, state);
    });

    /**
     * Find all twos with:
     *  - Two adjacent sides as walls - other two are marked not a wall
     *  - Two adjacent sides as not walls - other two are marked as walls
     */
    export const ConstrainTwo = register(function* ConstrainTwo(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        let changed: State | undefined = undefined;
        return constrain(2, state);
    });

    /**
     * All adjacent threes must have a wall on their common edge, _and_ on the edges opposite those edges
     * Threes arranged like so:
     *   3 3
     *     3
     * 
     *   3 3
     *   3 3
     * Imply there is no valid solution to the puzzle (this is not explicitly checked for here, but is worth mentioning).
     */
    export const AdjacentThrees = register(function* AdjacentThrees(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        return forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 3) return;
            // Horizontal
            if (getGridElement(x + 1, y) === 3) {
                [
                    lookupEdge(Cardinal.west, x, y),
                    lookupEdge(Cardinal.west, x + 1, y),            
                    lookupEdge(Cardinal.east, x + 1, y),
                ].forEach(e => setEdge("wall", ...e));
            }
            // Vertical
            if (getGridElement(x, y + 1) === 3) {
                [
                    lookupEdge(Cardinal.north, x, y),
                    lookupEdge(Cardinal.north, x, y + 1),            
                    lookupEdge(Cardinal.south, x, y + 1),
                ].forEach(e => setEdge("wall", ...e));
            }
        });
    });

    /**
     * Given this pattern:
     *    x
     *  x . .
     *     1
     * This must follow:
     *    x
     *  x .x.
     *    x1
     * This can be applied to all corners of a 1.
     */
    export const OnesByNonWalls = register(function* OnesByNonWalls(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        return forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 1) return;
            // Upper left corner
            if (getEdge(...lookupEdge(Cardinal.south, x - 1, y - 1)) === "notwall" && getEdge(...lookupEdge(Cardinal.east, x - 1, y - 1)) === "notwall") {
                setEdge("notwall", ...lookupEdge(Cardinal.north, x, y));
                setEdge("notwall", ...lookupEdge(Cardinal.west, x, y));
            }

            // Upper right corner
            if (getEdge(...lookupEdge(Cardinal.south, x + 1, y + 1)) === "notwall" && getEdge(...lookupEdge(Cardinal.west, x + 1, y + 1)) === "notwall") {
                setEdge("notwall", ...lookupEdge(Cardinal.north, x, y));
                setEdge("notwall", ...lookupEdge(Cardinal.east, x, y));
            }

            // Lower left corner
            if (getEdge(...lookupEdge(Cardinal.north, x - 1, y + 1)) === "notwall" && getEdge(...lookupEdge(Cardinal.east, x - 1, y + 1)) === "notwall") {
                setEdge("notwall", ...lookupEdge(Cardinal.south, x, y));
                setEdge("notwall", ...lookupEdge(Cardinal.west, x, y));
            }

            // Lower right corner
            if (getEdge(...lookupEdge(Cardinal.north, x + 1, y - 1)) === "notwall" && getEdge(...lookupEdge(Cardinal.east, x + 1, y - 1)) === "notwall") {
                setEdge("notwall", ...lookupEdge(Cardinal.south, x, y));
                setEdge("notwall", ...lookupEdge(Cardinal.east, x, y));
            }
        });
    });

    /**
     * For all existing edges:
     *  - If a point has three not-a-wall going into it, the last edge going into the point must not be a wall
     *  - If there is not a connecting edge in one direction, if there is only one possible following edge, add it
     *  - If there is already an outgoing and incoming wall, ensure the other two possibilities are marked as not a wall
     */
    export const FollowedEdges = register(function* FollowedEdges(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        let changed: State | undefined = undefined;
        for (const kind of ["row", "column"] as RowColumn[]) {
            for (let x = 0; x < state.edges[kind].length; x++) {
                for (let y = 0; y< state.edges[kind][x].length; y++) {
                    // Only handle one side of each edge (east or south) to avoid processing any edge cluster twice
                    if (kind === "row") {
                        handleDirection(Cardinal.east, kind, x, y);
                    }
                    else {
                        handleDirection(Cardinal.south, kind, x, y);
                    }
                }
            }
        }
        return changed;

        function handleDirection(dir: Cardinal, kind: RowColumn, x: number, y: number) {
            const connectedEdges = [[kind, x, y], ...connectingEdges(changed || state, kind, x, y, dir)];
            const wallCount = connectedEdges.reduce((acc, val) => getEdge(changed || state, ...val) === "wall" ? 1 : 0, 0);
            const nonWallCount = connectedEdges.reduce((acc, val) => getEdge(changed || state, ...val) === "notwall" ? 1 : 0, 0);
            if (wallCount === 1 && nonWallCount === 2) {
                changed = changed || cloneState(state);
                connectedEdges.filter(e => getEdge(changed || state, ...e) === undefined).forEach(e => setEdge("wall", changed, ...e));
            }
            else if ((wallCount === 2 && nonWallCount !== 2) || nonWallCount === 3) {
                changed = changed || cloneState(state);
                connectedEdges.filter(e => getEdge(changed || state, ...e) === undefined).forEach(e => setEdge("notwall", changed, ...e));
            }
        }
    });

    /**
     * Enumerate all unconnected edges and all viable paths out of those edges
     */
    export const GuessContinuous = register(function* GuessContinuous(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference
        let changed: State | undefined = undefined;
        for (const kind of ["row", "column"] as RowColumn[]) {
            for (let x = 0; x < state.edges[kind].length; x++) {
                for (let y = 0; y < state.edges[kind][x].length; y++) {
                    if (state.edges[kind][x][y] !== "wall") continue;
                    for (const edge of connectingEdges(state, kind, x, y, kind === "row" ? Cardinal.east : Cardinal.south)) {
                        if (getEdge(state, ...edge) === undefined) {
                            const newState = cloneState(changed || state);
                            setEdge("wall", newState, ...edge);
                            yield newState;
                            changed = changed || cloneState(state);
                            setEdge("notwall", changed, ...edge);
                        }
                    }
                }
            }
        }
    });

    /**
     * Enumerate all partially or unconstrained numbers and the adjacent possible edges (skip edges connected to other edged - GuessContinuous should hit them)
     */
    export const GuessConstrained = register(function* GuessConstrained(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference

    });

    /**
     * Enumerate all unconstrained edges - Should only ever be hit on a board with only zeroes as constraints.
     */
    export const GuessBlank = register(function* GuessBlank(state: State) {
        if (!!false) yield state; // Somehow this is needed to fix TS type inference

    });
}
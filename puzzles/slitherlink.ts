import {Strategy, StrategicAbstractSolver} from "../solver";
import {Cardinal, Enum} from "../util";

export type EdgeState = "wall" | "notwall";
export const EdgeState = Enum("wall", "notwall");

export type RowColumn = "row" | "column";
export const RowColumn = Enum("row", "column");

export interface State {
    grid: (number | undefined)[][];
    edges: {[x in RowColumn]: (EdgeState | undefined)[][]};
}

/*
As far as edges are concerned, array lengths should be based on grid lengths:
    - rows: outer (x) length = grid.length;
            inner (y) length = grid[0].length + 1;
    - columns: outer (x) = grid.length + 1;
               inner (y) length = grid[0].length;

*/
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


function getEdge(state: State, kind: RowColumn, x: number, y: number): EdgeState;
function getEdge(state: State, ...tuple: (RowColumn | number)[]): EdgeState;
function getEdge(state: State, kind: RowColumn, x: number, y: number): EdgeState {
    return state.edges[kind][x][y];
}

function setEdge(es: EdgeState, state: State, kind: RowColumn, x: number, y: number): EdgeState;
function setEdge(es: EdgeState, state: State, ...tuple: (RowColumn | number)[]): EdgeState;
function setEdge(es: EdgeState, state: State, kind: RowColumn, x: number, y: number): EdgeState {
    return state.edges[kind][x][y] = es;
}

const dot = "·";

export class Solver extends StrategicAbstractSolver<State> {
    constructor() {
        super(BestGuess);
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
    }
}

export const BestGuess: Strategy<State> = function*(state): IterableIterator<State> {
    return state;
};
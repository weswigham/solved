"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategies = exports.Solver = exports.RowColumn = exports.EdgeState = void 0;
exports.newState = newState;
const solver_1 = require("../solver");
const util_1 = require("../util");
exports.EdgeState = (0, util_1.Enum)("wall", "notwall");
exports.RowColumn = (0, util_1.Enum)("row", "column");
const directions = Object.keys(util_1.Cardinal);
function* affectingGridSquares(state, which, x, y) {
    switch (which) {
        case exports.RowColumn.row:
            if (y > 0) {
                // Above
                yield [x, y - 1];
            }
            if (y < (state.grid[0].length - 1)) {
                // Below
                yield [x, y];
            }
            break;
        case exports.RowColumn.column:
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
function lookupEdge(state, direction, x, y) {
    switch (direction) {
        case util_1.Cardinal.north:
            return [exports.RowColumn.row, x, y];
        case util_1.Cardinal.east:
            return [exports.RowColumn.column, x + 1, y];
        case util_1.Cardinal.south:
            return [exports.RowColumn.row, x, y + 1];
        case util_1.Cardinal.west:
            return [exports.RowColumn.column, x, y];
    }
}
function* connectingEdges(state, type, x, y, side) {
    if (type === "row") {
        if (side === util_1.Cardinal.north || side === util_1.Cardinal.south)
            throw new Error("Invalid arguments - can't get sides other than west or east for a row edge");
        if (side === util_1.Cardinal.west) {
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
        if (side === util_1.Cardinal.west || side === util_1.Cardinal.east)
            throw new Error("Invalid arguments - can't get sides other than south or north for a column edge");
        if (side === util_1.Cardinal.north) {
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
function getEdge(state, kind, x, y) {
    if (x < 0 || y < 0 || x >= state.edges[kind].length || y >= state.edges[kind][x].length)
        return "notwall";
    return state.edges[kind][x][y];
}
function setEdge(es, state, kind, x, y) {
    if (x < 0 || y < 0 || x >= state.edges[kind].length || y >= state.edges[kind][x].length) {
        if (es !== "notwall")
            throw new Error("Attempted to set edge outside map to a wall");
        return "notwall";
    }
    if (state.edges[kind][x][y] && state.edges[kind][x][y] !== es)
        throw new Error("Attempted to overwrite already set edge with differing value");
    return state.edges[kind][x][y] = es;
}
function sameEdge(a, b) {
    if (!a || !b)
        return false;
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function traceLoop(state, startingEdge, totalEdges, onEdge, log) {
    let startPainted = 0;
    let followed = 0;
    // If we follow a row, then follow it out the side we didn't come from
    const follow = (to, from) => {
        if (sameEdge(startingEdge, to)) {
            startPainted++;
            if (startPainted > 1) {
                return true;
            }
        }
        if (onEdge) {
            if (onEdge(to) === false) {
                return false;
            }
        }
        followed++;
        if ((followed - 1) > totalEdges) { // -1 since we hit the start twice
            throw new Error("Somehow traversed more edges than exist in the graph"); // This should be impossible. Please send help.
        }
        const setOne = [...connectingEdges(state, to[0], to[1], to[2], to[0] === "row" ? util_1.Cardinal.west : util_1.Cardinal.north)];
        const setTwo = [...connectingEdges(state, to[0], to[1], to[2], to[0] === "row" ? util_1.Cardinal.east : util_1.Cardinal.south)];
        const activeSet = setOne.find(e => sameEdge(e, from)) ? setTwo : setOne;
        const walls = activeSet.filter(e => getEdge(state, ...e) === "wall");
        if (walls.length !== 1) {
            if (log)
                console.log(`Found ${walls.length} edges from edge (${to[0]}, ${to[1]}, ${to[2]}) but expected 1 - not a solution`);
            return false;
        }
        return follow(walls[0], to);
    };
    if (follow(startingEdge, undefined)) {
        return followed;
    }
    return false;
}
function isInvalid(state, startingEdge = undefined, log = false) {
    // All number constraints must not be exceeded
    for (let x = 0; x < state.grid.length; x++) {
        for (let y = 0; y < state.grid[0].length; y++) {
            const count = state.grid[x][y];
            if (typeof count === "number") {
                const edges = directions.map(d => lookupEdge(state, d, x, y));
                const walls = edges.reduce((acc, val) => (getEdge(state, ...val) === "wall" ? 1 : 0) + acc, 0);
                // Exceeded a constraint? invalid.
                if (walls > count) {
                    return true;
                }
            }
        }
    }
    // If a point is "full", it must have exactly 4 non-undefined elements, and there must be zero or two walls.
    for (const kind of ["row", "column"]) {
        for (let x = 0; x < state.edges[kind].length; x++) {
            for (let y = 0; y < state.edges[kind][x].length; y++) {
                if (handleDirection(kind === "row" ? util_1.Cardinal.east : util_1.Cardinal.south, kind, x, y)) {
                    return true;
                }
            }
        }
    }
    function handleDirection(dir, kind, x, y) {
        const connectedEdges = [[kind, x, y], ...connectingEdges(state, kind, x, y, dir)];
        const wallCount = connectedEdges.reduce((acc, val) => (getEdge(state, ...val) === "wall" ? 1 : 0) + acc, 0);
        const nonWallCount = connectedEdges.reduce((acc, val) => (getEdge(state, ...val) === "notwall" ? 1 : 0) + acc, 0);
        if (wallCount > 2) {
            return true;
        }
        if (wallCount === 1 && nonWallCount === 3) {
            return true;
        }
    }
    // Count edges before we walk a loop - if the loop we walk has fewwer edges than this, then
    // there must be multiple loops or edge chains.
    let totalEdges = 0;
    for (const type of ["row", "column"]) {
        for (let x = 0; x < state.edges[type].length; x++) {
            for (let y = 0; y < state.edges[type][x].length; y++) {
                if (state.edges[type][x][y] === "wall") {
                    totalEdges++;
                }
            }
        }
    }
    if (startingEdge) {
        // Only verify changes resulting from the given edge
        const looped = traceLoop(state, startingEdge, totalEdges, undefined, log);
        if (looped && looped < totalEdges) {
            return true;
        }
        return false;
    }
    let paintedEdges = {
        row: (0, util_1.Array2D)(state.edges.row.length, state.edges.row[0].length),
        column: (0, util_1.Array2D)(state.edges.column.length, state.edges.column[0].length)
    };
    let paintCount = 0;
    do {
        outermost: for (const type of ["row", "column"]) {
            for (let x = 0; x < state.edges[type].length; x++) {
                for (let y = 0; y < state.edges[type][x].length; y++) {
                    if (state.edges[type][x][y] === "wall") {
                        if (!paintedEdges[type][x][y]) {
                            startingEdge = [type, x, y];
                            break outermost;
                        }
                    }
                }
            }
        }
        // No starting edge? potentially valid.
        if (!startingEdge) {
            return false;
        }
        const looped = traceLoop(state, startingEdge, totalEdges, edge => {
            if (paintedEdges[edge[0]][edge[1]][edge[2]])
                return false;
            paintedEdges[edge[0]][edge[1]][edge[2]] = true;
            paintCount++;
        }, log);
        if (looped && looped < totalEdges) {
            return true;
        }
    } while (paintCount < totalEdges);
    return false;
}
const dot = "·";
class Solver extends solver_1.StrategicAbstractSolver {
    constructor(...strategies) {
        if (strategies.length === 0) {
            super(...Strategies.all().map(s => s.strategy));
        }
        else {
            super(...strategies);
        }
        this.isInvalid = function (state) {
            return isInvalid(state, undefined, this.printStates);
        };
    }
    isSolution(state) {
        // All number constraints must be satisfied
        for (let x = 0; x < state.grid.length; x++) {
            for (let y = 0; y < state.grid[0].length; y++) {
                const count = state.grid[x][y];
                if (typeof count === "number") {
                    const edges = directions.map(d => lookupEdge(state, d, x, y));
                    const walls = edges.reduce((acc, val) => (getEdge(state, ...val) === "wall" ? 1 : 0) + acc, 0);
                    if (walls != count) {
                        if (this.printStates)
                            console.log(`Constraints on state invalid - not a solution (expected ${count}, found ${walls} at (${x}, ${y}))`);
                        return false;
                    }
                }
            }
        }
        // The loop must not contain intersections, and there must only be one continuous loop
        // Count edges before we walk a loop - if the loop we walk has fewwer edges than this, then
        // there must be multiple loops or edge chains.
        let totalEdges = 0;
        let startingEdge = undefined;
        for (const type of ["row", "column"]) {
            for (let x = 0; x < state.edges[type].length; x++) {
                for (let y = 0; y < state.edges[type][x].length; y++) {
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
            if (this.printStates)
                console.log(`No edges - not a solution.`);
            return false;
        }
        const looped = traceLoop(state, startingEdge, totalEdges, undefined, this.printStates);
        if (!looped) {
            return false; // Traversed a nonloop - must be a loop
        }
        if (looped > totalEdges) {
            throw new Error("Somehow followed a valid loop across more edges than the graph had!");
        }
        if (this.printStates)
            console.log(`Followed around ${looped} out of ${totalEdges} edges`);
        return looped === totalEdges;
    }
    display(state) {
        for (let y = 0; y < state.grid[0].length; y++) {
            // Draw line of dots/walls/constraints Above
            const top = dot + state.edges.row.map(column => column[y]).map(edge => edge === "wall" ? "---" : edge === "notwall" ? " x " : "   ").join(dot) + dot;
            console.log(top);
            let gridrow = "";
            for (let x = 0; x < state.grid.length; x++) {
                const left = getEdge(state, ...lookupEdge(state, util_1.Cardinal.west, x, y));
                const num = state.grid[x][y] !== undefined ? state.grid[x][y] : " ";
                gridrow += (left === "wall" ? "|" : (left === "notwall" ? "x" : " ")) + ` ${num} `;
            }
            const right = getEdge(state, ...lookupEdge(state, util_1.Cardinal.east, state.grid.length - 1, y));
            gridrow += (right === "wall" ? "|" : (right === "notwall" ? "x" : " "));
            console.log(gridrow);
        }
        const bottom = dot + state.edges.row.map(column => column[state.grid[0].length]).map(edge => edge === "wall" ? "---" : edge === "notwall" ? " x " : "   ").join(dot) + dot;
        console.log(bottom);
        if (state.lastStrategyApplied)
            console.log(`Last used strategy: ${state.lastStrategyApplied}.`);
    }
}
exports.Solver = Solver;
function cloneState(state) {
    // WARING: Don't use `map` as it doesn't map holes in arrays
    const width = state.grid.length;
    const height = state.grid[0].length;
    const newState = { grid: (0, util_1.Array2D)(width, height), edges: { row: (0, util_1.Array2D)(width, height + 1), column: (0, util_1.Array2D)(width + 1, height) } };
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            newState.grid[x][y] = state.grid[x][y];
        }
    }
    for (const kind of [exports.RowColumn.row, exports.RowColumn.column]) {
        for (let x = 0; x < state.edges[kind].length; x++) {
            for (let y = 0; y < state.edges[kind][x].length; y++) {
                newState.edges[kind][x][y] = state.edges[kind][x][y];
            }
        }
    }
    return newState;
}
var Strategies;
(function (Strategies) {
    const _all = [];
    /**
     * Returns an array of all registered strategies in registration order
     */
    function all() {
        return _all;
    }
    Strategies.all = all;
    /**
     * Add a strategy to the list of all strategies which are automatically used and attach the function's name as the strategy name
     */
    function register(strat) {
        _all.push({ strategy: (0, solver_1.strategy)(strat), name: strat.name });
        return strat;
    }
    Strategies.register = register;
    function forEachGridSquare(state, action) {
        let changed = undefined;
        let violation = false;
        for (let x = 0; x < state.grid.length; x++) {
            for (let y = 0; y < state.grid[x].length; y++) {
                action(x, y, getGridElement, lookupEdgeInternal, getEdgeInternal, setEdgeInternal);
                if (violation)
                    return undefined; // If the set edge function marks a constraint violation, return no new state
            }
        }
        return changed;
        function getGridElement(x, y) {
            if (x < 0 || y < 0 || x >= state.grid.length || y >= state.grid[x].length)
                return undefined;
            return (changed || state).grid[x][y];
        }
        function lookupEdgeInternal(dir, x, y) {
            return lookupEdge(changed || state, dir, x, y);
        }
        function getEdgeInternal(kind, x, y) {
            return getEdge(changed || state, kind, x, y);
        }
        function setEdgeInternal(es, kind, x, y) {
            if (!changed && getEdge(state, kind, x, y) !== es)
                changed = cloneState(state);
            const cur = getEdge(changed || state, kind, x, y);
            if (cur === es)
                return es;
            if (cur !== undefined && cur !== es) {
                violation = true;
                return;
            }
            const val = setEdge(es, changed || state, kind, x, y);
            // Validate numeric constraints adjacent to the placed edge (save loop checking for elsewhere)
            for (const [x1, y1] of affectingGridSquares(changed || state, kind, x, y)) {
                const num = getGridElement(x1, y1);
                if (num === undefined)
                    continue;
                let found = directions.map(d => getEdgeInternal(...lookupEdgeInternal(d, x1, y1))).filter(k => k === "wall").length;
                if (found > num) {
                    violation = true;
                    break;
                }
            }
            if (isInvalid(changed || state, [kind, x, y])) {
                violation = true;
            }
            return val;
        }
    }
    /**
     * Contrain 1,2,3 are all very similar - this shows how they are all similarly constraining
     */
    function constrain(n, state) {
        return forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== n)
                return;
            const edges = directions.map(dir => lookupEdge(dir, x, y));
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
    Strategies.ConstrainZero = register(function* ConstrainZeros(state) {
        const next = forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 0)
                return;
            for (const dir of directions) {
                const edge = lookupEdge(dir, x, y);
                const kind = getEdge(...edge);
                if (kind !== "notwall") {
                    setEdge("notwall", ...edge);
                }
            }
        });
        if (next) {
            yield next;
        }
    });
    /**
     * Find all threes with:
     *  - Three adjacent walls - last side is not a wall
     *  - One adjacent not a wall - all three other sides are walls
     */
    Strategies.ConstrainThree = register(function* ConstrainThree(state) {
        const next = constrain(3, state);
        if (next)
            yield next;
    });
    /**
     * Find all ones with:
     *  - Three adjacent not a walls - last side is a wall
     *  - One adjacent wall - other three sides are not a wall
     */
    Strategies.ConstrainOne = register(function* ConstrainOne(state) {
        const next = constrain(1, state);
        if (next)
            yield next;
    });
    /**
     * Find all twos with:
     *  - Two adjacent sides as walls - other two are marked not a wall
     *  - Two adjacent sides as not walls - other two are marked as walls
     */
    Strategies.ConstrainTwo = register(function* ConstrainTwo(state) {
        let changed = undefined;
        const next = constrain(2, state);
        if (next)
            yield next;
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
    Strategies.AdjacentThrees = register(function* AdjacentThrees(state) {
        const next = forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 3)
                return;
            // Horizontal
            if (getGridElement(x + 1, y) === 3) {
                [
                    lookupEdge(util_1.Cardinal.west, x, y),
                    lookupEdge(util_1.Cardinal.west, x + 1, y),
                    lookupEdge(util_1.Cardinal.east, x + 1, y),
                ].forEach(e => setEdge("wall", ...e));
                [
                    lookupEdge(util_1.Cardinal.west, x + 1, y - 1),
                    lookupEdge(util_1.Cardinal.west, x + 1, y + 1),
                ].forEach(e => setEdge("notwall", ...e));
            }
            // Vertical
            if (getGridElement(x, y + 1) === 3) {
                [
                    lookupEdge(util_1.Cardinal.north, x, y),
                    lookupEdge(util_1.Cardinal.north, x, y + 1),
                    lookupEdge(util_1.Cardinal.south, x, y + 1),
                ].forEach(e => setEdge("wall", ...e));
                [
                    lookupEdge(util_1.Cardinal.north, x + 1, y + 1),
                    lookupEdge(util_1.Cardinal.north, x - 1, y + 1),
                ].forEach(e => setEdge("notwall", ...e));
            }
        });
        if (next)
            yield next;
    });
    /**
     * Threes like so
     * ·   ·   ·   ·
     *   3
     * ·   ·   ·   ·
     *       3
     * ·   ·   ·   ·
     *
     * ·   ·   ·   ·
     * must have their outer edges as walls.
     * ·---·   ·   ·
     * | 3
     * ·   ·   ·   ·
     *       3 |
     * ·   ·---· x ·
     *         x
     * ·   ·   ·   ·
     * The diagonal may go either direction.
     */
    Strategies.DiagonalThrees = register(function* DiagonalThrees(state) {
        const next = forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 3)
                return;
            // Bottom left diagonal
            if (getGridElement(x - 1, y + 1) === 3) {
                [
                    lookupEdge(util_1.Cardinal.north, x, y),
                    lookupEdge(util_1.Cardinal.east, x, y),
                    lookupEdge(util_1.Cardinal.south, x - 1, y + 1),
                    lookupEdge(util_1.Cardinal.west, x - 1, y + 1),
                ].forEach(e => setEdge("wall", ...e));
                [
                    lookupEdge(util_1.Cardinal.south, x + 1, y - 1),
                    lookupEdge(util_1.Cardinal.west, x + 1, y - 1),
                    lookupEdge(util_1.Cardinal.north, x - 2, y + 2),
                    lookupEdge(util_1.Cardinal.east, x - 2, y + 2),
                ].forEach(e => setEdge("notwall", ...e));
            }
            // Bottom right diagonal
            if (getGridElement(x + 1, y + 1) === 3) {
                [
                    lookupEdge(util_1.Cardinal.north, x, y),
                    lookupEdge(util_1.Cardinal.west, x, y),
                    lookupEdge(util_1.Cardinal.south, x + 1, y + 1),
                    lookupEdge(util_1.Cardinal.east, x + 1, y + 1),
                ].forEach(e => setEdge("wall", ...e));
                [
                    lookupEdge(util_1.Cardinal.south, x - 1, y - 1),
                    lookupEdge(util_1.Cardinal.east, x - 1, y - 1),
                    lookupEdge(util_1.Cardinal.north, x + 2, y + 2),
                    lookupEdge(util_1.Cardinal.west, x + 2, y + 2),
                ].forEach(e => setEdge("notwall", ...e));
            }
        });
        if (next)
            yield next;
    });
    /**
     * Threes have implied edges by their surrounding non-adjacent edges
     *  - If a corner has an incoming edge, both edges opposite that corner must be present
     * ·   ·   ·   ·
     *         x
     * ·   ·---· x ·
     *       3 |
     * ·---·   ·   ·
     *
     * ·   ·   ·   ·
     *  - If a corner has two incoming not a walls, both other connecting edges must be walls
     * ·   ·   ·   ·
     *
     * ·   ·   ·   ·
     *       3 |
     * ·   ·---· x ·
     *         x
     * ·   ·   ·   ·
     */
    Strategies.ThreeDeductions = register(function* ThreeDeductions(state) {
        const next = forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 3)
                return;
            // Incoming walls
            // Upper left
            if ([
                lookupEdge(util_1.Cardinal.south, x - 1, y - 1),
                lookupEdge(util_1.Cardinal.east, x - 1, y - 1)
            ].filter(e => getEdge(...e) === "wall").length === 1) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.south, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.east, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.west, x + 1, y + 1));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.north, x + 1, y + 1));
            }
            // Upper right
            if ([
                lookupEdge(util_1.Cardinal.south, x + 1, y - 1),
                lookupEdge(util_1.Cardinal.west, x + 1, y - 1)
            ].filter(e => getEdge(...e) === "wall").length === 1) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.south, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.west, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.east, x - 1, y + 1));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.north, x - 1, y + 1));
            }
            // Lower left
            if ([
                lookupEdge(util_1.Cardinal.north, x - 1, y + 1),
                lookupEdge(util_1.Cardinal.east, x - 1, y + 1)
            ].filter(e => getEdge(...e) === "wall").length === 1) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.north, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.east, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.west, x + 1, y - 1));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.south, x + 1, y - 1));
            }
            // Lower right
            if ([
                lookupEdge(util_1.Cardinal.north, x + 1, y + 1),
                lookupEdge(util_1.Cardinal.west, x + 1, y + 1)
            ].filter(e => getEdge(...e) === "wall").length === 1) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.north, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.west, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.east, x - 1, y - 1));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.south, x - 1, y - 1));
            }
            // Incoming not walls
            // Upper left
            if ([
                lookupEdge(util_1.Cardinal.south, x - 1, y - 1),
                lookupEdge(util_1.Cardinal.east, x - 1, y - 1)
            ].filter(e => getEdge(...e) === "notwall").length === 2) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.north, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.west, x, y));
            }
            // Upper right
            if ([
                lookupEdge(util_1.Cardinal.south, x + 1, y - 1),
                lookupEdge(util_1.Cardinal.west, x + 1, y - 1)
            ].filter(e => getEdge(...e) === "notwall").length === 2) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.north, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.east, x, y));
            }
            // Lower left
            if ([
                lookupEdge(util_1.Cardinal.north, x - 1, y + 1),
                lookupEdge(util_1.Cardinal.east, x - 1, y + 1)
            ].filter(e => getEdge(...e) === "notwall").length === 2) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.south, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.west, x, y));
            }
            // Lower right
            if ([
                lookupEdge(util_1.Cardinal.north, x + 1, y + 1),
                lookupEdge(util_1.Cardinal.west, x + 1, y + 1)
            ].filter(e => getEdge(...e) === "wall").length === 2) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.south, x, y));
                setEdge("wall", ...lookupEdge(util_1.Cardinal.east, x, y));
            }
        });
        if (next)
            yield next;
    });
    /**
     * If two parallel not a walls are ajacent with a two with another not a wall colinear with it,
     * it implies an wall opposite that not a wall. See charts of each case within the strategy if this
     *  sounds confusing.
     */
    Strategies.TwosSemicorner = register(function* TwosSemicorner(state) {
        const next = forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 2)
                return;
            /**
             * ·   ·   ·   ·
             *
             * ·   ·   ·   ·
             *       2
             * ·---·   · x ·
             *     x   x
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.west, x, y + 1),
                lookupEdge(util_1.Cardinal.east, x, y + 1),
                lookupEdge(util_1.Cardinal.south, x + 1, y),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.south, x - 1, y));
            }
            /**
             * ·   ·   ·   ·
             *
             * ·   ·   ·   ·
             *       2
             * · x ·   ·---·
             *     x   x
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.west, x, y + 1),
                lookupEdge(util_1.Cardinal.east, x, y + 1),
                lookupEdge(util_1.Cardinal.south, x - 1, y),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.south, x + 1, y));
            }
            /**
             * ·   ·   ·   ·
             *         |
             * ·   ·   · x ·
             *       2
             * ·   ·   · x ·
             *         x
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.north, x + 1, y),
                lookupEdge(util_1.Cardinal.south, x + 1, y),
                lookupEdge(util_1.Cardinal.east, x, y + 1),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.east, x, y - 1));
            }
            /**
             * ·   ·   ·   ·
             *         x
             * ·   ·   · x ·
             *       2
             * ·   ·   · x ·
             *         |
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.north, x + 1, y),
                lookupEdge(util_1.Cardinal.south, x + 1, y),
                lookupEdge(util_1.Cardinal.east, x, y - 1),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.east, x, y + 1));
            }
            /**
             * ·   ·   ·   ·
             *     x   x
             * ·---·   · x ·
             *       2
             * ·   ·   ·   ·
             *
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.west, x, y - 1),
                lookupEdge(util_1.Cardinal.east, x, y - 1),
                lookupEdge(util_1.Cardinal.north, x + 1, y),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.north, x - 1, y));
            }
            /**
             * ·   ·   ·   ·
             *     x   x
             * · x ·   ·---·
             *       2
             * ·   ·   ·   ·
             *
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.west, x, y - 1),
                lookupEdge(util_1.Cardinal.east, x, y - 1),
                lookupEdge(util_1.Cardinal.north, x - 1, y),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.north, x + 1, y));
            }
            /**
             * ·   ·   ·   ·
             *     x
             * · x ·   ·   ·
             *       2
             * · x ·   ·   ·
             *     |
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.north, x - 1, y),
                lookupEdge(util_1.Cardinal.south, x - 1, y),
                lookupEdge(util_1.Cardinal.west, x, y - 1),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.west, x, y + 1));
            }
            /**
             * ·   ·   ·   ·
             *     |
             * · x ·   ·   ·
             *       2
             * · x ·   ·   ·
             *     x
             * ·   ·   ·   ·
             */
            if ([
                lookupEdge(util_1.Cardinal.north, x - 1, y),
                lookupEdge(util_1.Cardinal.south, x - 1, y),
                lookupEdge(util_1.Cardinal.west, x, y + 1),
            ].filter(e => getEdge(...e) === "notwall").length === 3) {
                setEdge("wall", ...lookupEdge(util_1.Cardinal.west, x, y - 1));
            }
        });
        if (next)
            yield next;
    });
    /**
     * Given a one, if there are two incoming not-a-walls,
     * the connecting edges to those not-a-walls must also not be walls
     * ·   ·   ·   ·
     *         x
     * ·   · x · x ·
     *       1 x
     * ·   ·   ·   ·
     *
     * ·   ·   ·   ·
     */
    Strategies.NonWallsByOnes = register(function* NonWallsByOnes(state) {
        const next = forEachGridSquare(state, (x, y, getGridElement, lookupEdge, getEdge, setEdge) => {
            if (getGridElement(x, y) !== 1)
                return;
            // Incoming walls
            // Upper left
            if ([
                lookupEdge(util_1.Cardinal.south, x - 1, y - 1),
                lookupEdge(util_1.Cardinal.east, x - 1, y - 1)
            ].filter(e => getEdge(...e) === "notwall").length === 2) {
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.north, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.west, x, y));
            }
            // Upper right
            if ([
                lookupEdge(util_1.Cardinal.south, x + 1, y - 1),
                lookupEdge(util_1.Cardinal.west, x + 1, y - 1)
            ].filter(e => getEdge(...e) === "notwall").length === 2) {
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.north, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.east, x, y));
            }
            // Lower left
            if ([
                lookupEdge(util_1.Cardinal.north, x - 1, y + 1),
                lookupEdge(util_1.Cardinal.east, x - 1, y + 1)
            ].filter(e => getEdge(...e) === "notwall").length === 2) {
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.south, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.west, x, y));
            }
            // Lower right
            if ([
                lookupEdge(util_1.Cardinal.north, x + 1, y + 1),
                lookupEdge(util_1.Cardinal.west, x + 1, y + 1)
            ].filter(e => getEdge(...e) === "notwall").length === 2) {
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.south, x, y));
                setEdge("notwall", ...lookupEdge(util_1.Cardinal.east, x, y));
            }
        });
        if (next)
            yield next;
    });
    /**
     * For all existing edges:
     *  - If a point has three not-a-wall going into it, the last edge going into the point must not be a wall
     *  - If there is not a connecting edge in one direction, if there is only one possible following edge, add it
     *  - If there is already an outgoing and incoming wall, ensure the other two possibilities are marked as not a wall
     */
    Strategies.FollowedEdges = register(function* FollowedEdges(state) {
        let changed = undefined;
        handleDirection(util_1.Cardinal.west, "row", 0, 0);
        handleDirection(util_1.Cardinal.north, "column", 0, 0);
        for (const kind of ["row", "column"]) {
            for (let x = 0; x < state.edges[kind].length; x++) {
                for (let y = 0; y < state.edges[kind][x].length; y++) {
                    // Only handle one side of each edge (east or south) to avoid processing any edge cluster twice
                    if (kind === "row") {
                        handleDirection(util_1.Cardinal.east, kind, x, y);
                    }
                    else {
                        handleDirection(util_1.Cardinal.south, kind, x, y);
                    }
                }
            }
        }
        if (changed)
            yield changed;
        function handleDirection(dir, kind, x, y) {
            const connectedEdges = [[kind, x, y], ...connectingEdges(changed || state, kind, x, y, dir)];
            const wallCount = connectedEdges.reduce((acc, val) => (getEdge(changed || state, ...val) === "wall" ? 1 : 0) + acc, 0);
            const nonWallCount = connectedEdges.reduce((acc, val) => (getEdge(changed || state, ...val) === "notwall" ? 1 : 0) + acc, 0);
            if (wallCount === 1 && nonWallCount === 2) {
                connectedEdges.filter(e => getEdge(changed || state, ...e) === undefined).forEach(e => setEdgeInternal("wall", ...e));
            }
            else if ((wallCount === 2 && nonWallCount !== 2) || nonWallCount === 3) {
                connectedEdges.filter(e => getEdge(changed || state, ...e) === undefined).forEach(e => setEdgeInternal("notwall", ...e));
            }
        }
        function setEdgeInternal(es, ...tuple) {
            if (!changed && getEdge(state, ...tuple) !== es)
                changed = cloneState(state);
            return setEdge(es, changed || state, ...tuple);
        }
    });
    /**
     * Enumerate all unconnected edges and all viable paths out of those edges
     */
    Strategies.GuessContinuous = register(function* GuessContinuous(state) {
        let changed = undefined;
        for (const kind of ["row", "column"]) {
            for (let x = 0; x < state.edges[kind].length; x++) {
                for (let y = 0; y < state.edges[kind][x].length; y++) {
                    if (state.edges[kind][x][y] !== "wall")
                        continue;
                    for (const edge of connectingEdges(state, kind, x, y, kind === "row" ? util_1.Cardinal.east : util_1.Cardinal.south)) {
                        const originalState = getEdge(changed || state, ...edge);
                        if (originalState === undefined) {
                            const newState = cloneState(changed || state);
                            setEdge("wall", newState, ...edge);
                            yield newState;
                            // If we continue iteration, then that guess didn't pan out - it's therefore not a wall (or there's no solution)!
                            setEdgeInternal("notwall", ...edge);
                        }
                    }
                }
            }
        }
        function setEdgeInternal(es, ...tuple) {
            if (!changed && getEdge(state, ...tuple) !== es)
                changed = cloneState(state);
            return setEdge(es, changed || state, ...tuple);
        }
    });
    /**
     * Enumerate all partially or unconstrained numbers and the adjacent possible edges
     */
    Strategies.GuessConstrained = register(function* GuessConstrained(state) {
        let changed = undefined;
        for (let x = 0; x < state.grid.length; x++) {
            for (let y = 0; y < state.grid[x].length; y++) {
                if (state.grid[x][y] === undefined)
                    continue;
                // TODO: Only need to lookup North and West edges for all squares except the lower rightmost one - this is duplicating guesses
                for (const dir of directions) {
                    const edge = lookupEdge(changed || state, dir, x, y);
                    if (getEdge(changed || state, ...edge) === undefined) {
                        const newState = cloneState(changed || state);
                        setEdge("wall", newState, ...edge);
                        yield newState;
                        // If iteration continues, then it must not be a wall (or there's no solution)
                        changed = changed || cloneState(state);
                        setEdge("notwall", changed, ...edge);
                    }
                }
            }
        }
    });
    /**
     * Enumerate all unconstrained edges - Should only ever be hit on a board with only zeroes as constraints.
     */
    Strategies.GuessBlank = register(function* GuessBlank(state) {
        let changed = undefined;
        for (const kind of ["row", "column"]) {
            for (let x = 0; x < state.edges[kind].length; x++) {
                for (let y = 0; y < state.edges[kind][x].length; y++) {
                    if (state.edges[kind][x][y] === undefined) {
                        const newState = cloneState(changed || state);
                        setEdge("wall", newState, kind, x, y);
                        yield newState;
                        // If iteration continues, then the prior guess didn't pan out - mark it as not a wall
                        changed = changed || cloneState(state);
                        setEdge("notwall", changed, kind, x, y);
                    }
                }
            }
        }
    });
})(Strategies || (exports.Strategies = Strategies = {}));
/**
 * Call like so:
 * (sample problem 1 from http://www.nikoli.com/en/puzzles/slitherlink/)
 * const initial = newState([
 *  [ , , , ,0,2, , , , ,], //Trailing comma is required by JS syntax rules to got the correct number of empty elements
 *  [2,3,0, , , , ,2,2,3,],
 *  [ , , ,3, , ,3, , , ,],
 *  [3, , , ,2,2, , , ,1,],
 *  [ ,2, ,2, , ,0, ,2, ,],
 *  [ ,2, ,3, , ,3, ,3, ,],
 *  [3, , , ,1,0, , , ,2,],
 *  [ , , ,2, , ,3, , , ,],
 *  [3,0,3, , , , ,3,3,1,],
 *  [ , , , ,0,2, , , , ,],
 * ]);
 */
function newState(input) {
    const width = input[0].length;
    const height = input.length;
    const state = { grid: (0, util_1.Array2D)(width, height), edges: { row: (0, util_1.Array2D)(width, height + 1), column: (0, util_1.Array2D)(width + 1, height) } };
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            state.grid[x][y] = input[y][x];
        }
    }
    return state;
}
//# sourceMappingURL=slitherlink.js.map
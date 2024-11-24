import { Strategy, StrategicAbstractSolver, StrategicState } from "../solver";
export type EdgeState = "wall" | "notwall";
export declare const EdgeState: {
    wall: "wall";
    notwall: "notwall";
};
export type RowColumn = "row" | "column";
export declare const RowColumn: {
    row: "row";
    column: "column";
};
export interface State extends StrategicState {
    grid: (number | undefined)[][];
    edges: {
        [x in RowColumn]: (EdgeState | undefined)[][];
    };
}
export declare class Solver extends StrategicAbstractSolver<State> {
    constructor(...strategies: Strategy<State>[]);
    isSolution(state: State): boolean;
    display(state: State): void;
}
export declare namespace Strategies {
    /**
     * Returns an array of all registered strategies in registration order
     */
    function all(): {
        strategy: Strategy<State>;
        name: string;
    }[];
    /**
     * Add a strategy to the list of all strategies which are automatically used and attach the function's name as the strategy name
     */
    function register(strat: Strategy<State>): Strategy<State>;
    /**
     * Marks all the edges around a zero as not a wall.
     */
    const ConstrainZero: Strategy<State>;
    /**
     * Find all threes with:
     *  - Three adjacent walls - last side is not a wall
     *  - One adjacent not a wall - all three other sides are walls
     */
    const ConstrainThree: Strategy<State>;
    /**
     * Find all ones with:
     *  - Three adjacent not a walls - last side is a wall
     *  - One adjacent wall - other three sides are not a wall
     */
    const ConstrainOne: Strategy<State>;
    /**
     * Find all twos with:
     *  - Two adjacent sides as walls - other two are marked not a wall
     *  - Two adjacent sides as not walls - other two are marked as walls
     */
    const ConstrainTwo: Strategy<State>;
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
    const AdjacentThrees: Strategy<State>;
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
    const DiagonalThrees: Strategy<State>;
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
    const ThreeDeductions: Strategy<State>;
    /**
     * If two parallel not a walls are ajacent with a two with another not a wall colinear with it,
     * it implies an wall opposite that not a wall. See charts of each case within the strategy if this
     *  sounds confusing.
     */
    const TwosSemicorner: Strategy<State>;
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
    const NonWallsByOnes: Strategy<State>;
    /**
     * For all existing edges:
     *  - If a point has three not-a-wall going into it, the last edge going into the point must not be a wall
     *  - If there is not a connecting edge in one direction, if there is only one possible following edge, add it
     *  - If there is already an outgoing and incoming wall, ensure the other two possibilities are marked as not a wall
     */
    const FollowedEdges: Strategy<State>;
    /**
     * Enumerate all unconnected edges and all viable paths out of those edges
     */
    const GuessContinuous: Strategy<State>;
    /**
     * Enumerate all partially or unconstrained numbers and the adjacent possible edges
     */
    const GuessConstrained: Strategy<State>;
    /**
     * Enumerate all unconstrained edges - Should only ever be hit on a board with only zeroes as constraints.
     */
    const GuessBlank: Strategy<State>;
}
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
export declare function newState(input: number[][]): State;

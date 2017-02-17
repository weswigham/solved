# [solved](https://github.com/weswigham/solved) [![Build Status](https://travis*ci.org/weswigham/solved.svg?branch=master)](https://travis*ci.org/weswigham/solved)
A puzzle solver in TypeScript

Usage
=====
First run `npm install` in this directory to fetch the dependencies.
Then, run `npm test` in this directory with a node version between 6 and [6.4](https://nodejs.org/en/blog/release/v6.4.0/) installed. (Not any newer! The versions of v8 they use seems to have an optimizer bug which causes the slitherlink FollowedEdges strategy to behave erratically and cause solving to fail * I don't have time to look into this, but I imagine it's very interesting!)

What's Included
===============
A Rain Radar solver (and [sample puzzle generation script](https://github.com/weswigham/solved/blob/master/scripts/generate*rain*radar.ts))
* This solver is mostly brute force with a few simple heuristics such as not bothering with placements which would bring a constraint to 1.

A [Slitherlink](http://www.nikoli.co.jp/en/puzzles/slitherlink.html) solver which utilizes the following strategies:
* ConstainZero
    * Marks all sides of a zero as not a wall
* ConstrainThree
    * If one side of a three is marked as not a wall, marks the other three as walls
    * If three sides are walls, marks the last as not a wall
* ConstrainOne
    * If one side is marked as a wall, marks the other three as not walls
    * If three sides are marked as not walls, the remaining side is marked as not a wall
* ConstrainTwo
    * If two sides are marked as walls, the other two are marked as not walls and vice*versa
* AdjacentThrees
    * Adjacent threes must share walls on their shared edges and must have edges on the sides opposite that shared edge. Additionally, the shared edge must go towards one of the threes, and not out.
* DiagonalThrees
    * Diagonal threes must have walls opposite one another.
* ThreeDeductions
    * An edge leading towards a three implies edges on the opposite two corners.
    * Two sides marked not a wall leading towards the same corner of a three imply the other two sides connecting to that corner must be walls.
* TwosSemicorner
    * This one is complicated. Trust me. There are 8 cases of a pattern involving 3 not a wall markers around a two at each rotation, each of which implies a different wall.
* NonWallsByOnes
    * Ones with not a walls leading to them imply the connecting edges are also not walls.
* FollowedEdges
    * If three edges leading to a point are not walls, the last is not a wall.
    * If two walls are connected to a point, the last two are not walls.
    * If one wall and two not wall markers connect to a point, the last edge is a wall.
* GuessContinuous
    * Enumerates all potential continuations of existing walls. First and best fallback when applying a known pattern fails.
* GuessConstrained
    * Enumerates all potential walls alongside an existing constraint. Unlikely but theoretically possible to be used to guess a puzzle start.
* GuessBlank
    * Enumerates all completely unconstrained potential wall places. Literally only possible when a puzzle only has zeros for constraints.

Much credit to [@mooman219](https://github.com/mooman219) for helping me dream up and verify some of the more interesting strategies here!

API
===
While not packaged as a library, if included by a script, this package does provide a well-defined and typed public API. The top level members are the following:
* RainRadar
    * Namespace containing a RainRadar Solver and related types
* Slitherlink
    * Namespace containing a Slitherlink Solver, related types, and a Strategies namespace containing all strategies which have been implemented. The solver accepts a list of strategies as optional arguments if you wish to limit what it solves with (useful for verifying if a puzzle can only be solved using simple inductions!)

Writing Your Own
================
Solvers
-------

`./solver/index.ts` contains abstract base classes for both a generic backtracking solver and a solver which specifically attempts to utilize various strategies. Simply inherit from one of these and implement the required members.
I keep mine in the `./puzzles` subdirectory, and reexport the solvers and their associated types and machinery under a namespace via the `index.ts`.


Tests
-----

I use [`mocha`](https://www.npmjs.com/package/mocha) as a test runner alongside [`chai`](https://www.npmjs.com/package/chai) as an assertion library. I used exclusively expectation-style assertions within BDD-style `describe`/`it` blocks.
Adding a new test is accomplished simply by dropping a new `.ts` or `.js` file into the `./test` subdirectory. By my own convention, files are named `[puzzle].test.ts`, and test the named puzzle exclusively.


Scripts
-------

This repository is not packaged for individual resale - the solvers are not transpiled by a build step and are not immediately distributable as a library.
It is easiest to work with them (to, for example, actually solve a puzzle with one) by writing a short `.ts` file in the scripts folder which does what you
want (since different puzzles have different state construction requirements), which you then run with [`ts-node`](https://www.npmjs.com/package/ts-node).
For example, if I wanted to solve this simple slitherlink puzzle:
```
     ·   ·   ·   ·
       1   3   2     
     ·   ·   ·   ·
       0       2 
     ·   ·   ·   ·
       1   3   2 
     ·   ·   ·   ·
```
Failing adding it to the permanent tests in the `./test` dir, I would write the following out to a `./scripts/slither-1.ts`:
```ts
import {Slitherlink} from "../";
const initial = Slitherlink.newState([
    [1,3,2,],
    [0, ,2,],
    [1,3,2,],
]);
const solver = new Slitherlink.Solver();
console.log("Initial:");
solver.display(initial);
console.log("");
const gen = solver.solutions(initial);
const first = gen.next().value;
solver.display(first);
```
and execute it with `ts-node ./scripts/slither-1.ts` to see the result.
Having the entire library available to you also allows you do do nice things like check for more than one solution:
```ts
import {Slitherlink} from "../";
const initial = Slitherlink.newState([
    [1,3,2,],
    [0, ,2,],
    [1,3,2,],
]);
const solver = new Slitherlink.Solver();
const gen = solver.solutions(initial);
const first = gen.next().value;
const second = gen.next().value;
if (!first) {
    console.error("No solution!");
} else if (second) {
    console.error("More than one solution!");
} else {
    solver.display(first);
}
```
Or, as is done in the provided rain radar script, search for a puzzle fitting certain constraints.
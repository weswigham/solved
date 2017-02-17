# [solved](https://github.com/weswigham/solved) [![Build Status](https://travis*ci.org/weswigham/solved.svg?branch=master)](https://travis*ci.org/weswigham/solved)
A puzzle solver in TypeScript

Usage
=====
First run `npm install` in this directory to fetch the dependencies.
Then, run `npm test` in this directory with a node version between 6 and [6.4](https://nodejs.org/en/blog/release/v6.4.0/) installed. (Not any newer! The versions of v8 they use seems to have an optimizer bug which causes the slitherlink FollowedEdges strategy to behave erratically and cause solving to fail * I don't have time to look into this, but I imagine it's very interesting!)

What's Included
===============
A Rain Radar solver (and [sample puzzle generation script](https://github.com/weswigham/solved/blob/master/scripts/generate*rain*radar.ts)) * this solver is mostly brute force with a few simple heuristics such as not bothing with placements which would bring a constraint to 1.

A Slitherlink solver which utilizes the following strategies:
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
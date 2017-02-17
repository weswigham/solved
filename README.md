# solved [![Build Status](https://travis-ci.org/weswigham/solved.svg?branch=master)](https://travis-ci.org/weswigham/solved)
A puzzle solver in TypeScript

Usage
=====
Run `npm test` in this directory with a node version between 6 and [6.4](https://nodejs.org/en/blog/release/v6.4.0/) installed. (Not any newer! The versions of v8 they use seems to have an optimizer bug which causes the slitherlink FollowedEdges strategy to behave erratically and cause solving to fail.)

import solved = require("../");

const clouds: solved.RainRadar.Cloud[] = [
    { ul: { x: 1, y: 1 }, lr: { x: 3, y: 2 } },
    { ul: { x: 5, y: 0 }, lr: { x: 6, y: 3 } },
    { ul: { x: 0, y: 4 }, lr: { x: 3, y: 6 } },
    { ul: { x: 5, y: 5 }, lr: { x: 6, y: 6 } }
];
const columns = [3, 5, 5, 5, 0, 6, 6];
const rows = [2, 5, 5, 2, 4, 6, 6];

const state: solved.RainRadar.State = {clouds, rows, columns};

const solver = new solved.RainRadar.Solver();
let depth = 0;
console.log("Initial puzzle:");
solver.display(state);
const newState = deleteConstraints(state);
console.log("Minimally constrained puzzle:");
solver.display(newState);

function countConstraints(state: solved.RainRadar.State): number {
    return state.rows.reduce((prev, current) => current !== -1 ? prev + 1 : prev, 0) +
        state.columns.reduce((prev, current) => current !== -1 ? prev + 1 : prev, 0);
}


function deleteConstraints(state: solved.RainRadar.State): solved.RainRadar.State | undefined {
    depth++;
    const newRows = [...state.rows];
    const newColumns = [...state.columns];
    let newMinimumPuzzle = state;
    let minimumCount = countConstraints(newMinimumPuzzle);
    console.log(`${minimumCount} @ depth ${depth}`);
    for (let i=0; i<newRows.length; i++) {
        if (newRows[i] === -1) continue;
        const newPuzzle: solved.RainRadar.State = {clouds: [], rows: [...newRows.slice(0, i), -1, ...newRows.slice(i + 1)], columns: newColumns};
        const solver = new solved.RainRadar.Solver();
        const solutions = solver.solutions(newPuzzle);
        const firstSolution = solutions.next();
        const secondSolution = solutions.next();
        if (firstSolution && firstSolution.value && secondSolution.value === undefined) {
            console.log("Candidate puzzle:");
            solver.display(newPuzzle);
            const lesser = deleteConstraints(newPuzzle);
            const lesserSize = countConstraints(lesser);
            if (lesser !== newMinimumPuzzle && lesserSize < minimumCount) {
                newMinimumPuzzle = lesser;
                minimumCount = lesserSize;
            }
        }
    }
    for (let i=0; i<newColumns.length; i++) {
        if (newColumns[i] === -1) continue;
        const newPuzzle: solved.RainRadar.State = {clouds: [], rows: newRows, columns: [...newColumns.slice(0, i), -1, ...newColumns.slice(i + 1)]};
        const solver = new solved.RainRadar.Solver();
        const solutions = solver.solutions(newPuzzle);
        const firstSolution = solutions.next();
        const secondSolution = solutions.next();
        if (firstSolution && firstSolution.value && secondSolution.value === undefined) {
            console.log("Candidate puzzle:");
            solver.display(newPuzzle);
            const lesser = deleteConstraints(newPuzzle);
            const lesserSize = countConstraints(lesser);
            if (lesser !== newMinimumPuzzle && lesserSize < minimumCount) {
                newMinimumPuzzle = lesser;
                minimumCount = lesserSize;
            }
        }
    }
    depth--;
    return newMinimumPuzzle;
}
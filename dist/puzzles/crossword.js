"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const solver_1 = require("../solver");
const util_1 = require("../util");
class BasicDictionary {
    constructor(dict, cacheSize = 200) {
        this.dict = dict;
        this.cacheSize = cacheSize;
        this.storedSearches = {};
        this.storedResults = {};
        this.cachedKeys = [];
        dict = dict.replace(/\W/ig, ""); // Prune all punctuation
    }
    get(pattern) {
        return this.storedSearches[pattern] || (this.storedSearches[pattern] = new RegExp(`\\b${pattern.replace(/\?/g, ".")}\\b`, "ig"));
    }
    remember(pattern) {
        if (this.storedResults[pattern])
            return this.storedResults[pattern];
        this.cachedKeys.push(pattern);
        this.storedResults[pattern] = this.dict.match(this.get(pattern)) || [];
        if (this.cachedKeys.length > this.cacheSize) {
            this.storedResults[this.cachedKeys.shift()] = undefined;
        }
        return this.storedResults[pattern];
    }
    grep(pattern) {
        return this.remember(pattern);
    }
    count(pattern) {
        return this.remember(pattern).length;
    }
}
exports.BasicDictionary = BasicDictionary;
class Solver extends solver_1.AbstractSolver {
    constructor(dict, randomize = false, printStates) {
        super(printStates);
        this.dict = dict;
        this.randomize = randomize;
    }
    display(s) {
        let buf = "";
        for (let i = 0; i < s.values.length; i++) {
            for (let j = 0; j < s.values[i].length; j++) {
                buf += s.values[i][j];
            }
            buf += "\n";
        }
        console.log(buf);
    }
    fillState(s, ref, option) {
        const clone = s.map(q => [...q]);
        let { i, j } = ref.pos;
        for (let x = 0; x < ref.pattern.length; x++) {
            switch (ref.variant) {
                case "across": {
                    clone[i][j + x] = option.charAt(x).toUpperCase();
                    break;
                }
                case "down": {
                    clone[i + x][j] = option.charAt(x).toUpperCase();
                    break;
                }
            }
        }
        return {
            values: clone
        };
    }
    *enumerateNext(s) {
        const across = this.generateAcross(s.values);
        const down = this.generateDown(across, s.values);
        const combined = [...across, ...down];
        const unfinished = combined.filter(w => w.pattern.indexOf("?") >= 0);
        const presentWords = {};
        combined.filter(w => w.pattern.indexOf("?") === -1).forEach(e => presentWords[e.pattern] = true);
        const sorted = unfinished.sort((a, b) => {
            return this.dict.count(a.pattern) - this.dict.count(b.pattern);
        });
        const ref = sorted[0];
        const unfiltered = this.dict.grep(ref.pattern);
        const options = unfiltered.filter(w => !(presentWords[w.toUpperCase()]));
        if (!options.length) {
            // If any word has no options, then there is no solution at this point
            return;
        }
        if (this.randomize) {
            util_1.shuffle(options);
        }
        for (const option of options) {
            const potential = this.fillState(s.values, ref, option);
            if (this.checkState(potential))
                yield potential;
        }
    }
    checkState(s) {
        // This is piles more work than is required.
        // Check that all completed words are in the dictionary
        const across = this.generateAcross(s.values);
        const down = this.generateDown(across, s.values);
        const combined = [...across, ...down].filter(f => f.pattern.indexOf("?") === -1);
        for (const complete of combined) {
            if (!(this.dict.grep(complete.pattern)).length)
                return false;
        }
        return true;
    }
    isSolution(s) {
        for (let i = 0; i < s.values.length; i++) {
            for (let j = 0; j < s.values[i].length; j++) {
                if (s.values[i][j] === "?")
                    return false;
            }
        }
        return true;
    }
    generateAcross(values) {
        const words = [];
        let buf = "";
        let inWordState = false;
        let bufStart = { i: 0, j: 0 };
        for (let i = 0; i < values.length; i++) {
            for (let j = 0; j < values[i].length; j++) {
                const val = values[i][j];
                if (!inWordState && val !== ".") {
                    inWordState = true;
                    buf += val;
                    bufStart = { i, j };
                }
                else if (inWordState && val !== ".") {
                    buf += val;
                }
                else if (inWordState && val === ".") {
                    finishWord();
                }
            }
            finishWord();
        }
        return words;
        function finishWord() {
            inWordState = false;
            if (buf.length === 0) {
                return;
            }
            words.push({
                pos: bufStart,
                reference: words.length + 1,
                pattern: buf,
                variant: "across"
            });
            buf = "";
        }
    }
    generateDown(across, values) {
        const words = [];
        let prevIndex = across.length + 1;
        let buf = "";
        let inWordState = false;
        let bufStart = { i: 0, j: 0 };
        for (let j = 0; j < values[0].length; j++) {
            for (let i = 0; i < values.length; i++) {
                const val = values[i][j];
                if (!inWordState && val !== ".") {
                    inWordState = true;
                    buf += val;
                    bufStart = { i, j };
                }
                else if (inWordState && val !== ".") {
                    buf += val;
                }
                else if (inWordState && val === ".") {
                    finishWord();
                }
            }
            finishWord();
        }
        words.sort((a, b) => a.reference - b.reference);
        return words;
        function finishWord() {
            inWordState = false;
            if (buf.length === 0) {
                return;
            }
            const matching = across.find(w => w.pos.i === bufStart.i && w.pos.j === bufStart.j);
            words.push({ pos: bufStart, pattern: buf, reference: matching ? matching.reference : prevIndex++, variant: "down" });
            buf = "";
        }
    }
}
exports.Solver = Solver;
//# sourceMappingURL=crossword.js.map
import {AbstractSolver} from "../solver";
import {shuffle} from "../util";

export type GridElement = 
    | "." // Black square
    | "?" // Unknown square
    | string;

export interface State {
    values: GridElement[][];
}

export interface WordRef {
    pattern: string;
    pos: {i: number, j: number};
    reference: number;
    variant: "across" | "down";
}

export interface Dictionary {
    grep(against: string): string[];
    count(pattern: string): number;
}

export class BasicDictionary implements Dictionary {
    private storedSearches: {[index: string]: RegExp} = {};
    private storedResults: {[index: string]: string[]} = {};
    private cachedKeys: string[] = [];
    constructor(private dict: string, private cacheSize = 200) {
        this.dict = dict.replace(/[^a-z0-9\n]/igm, ""); // Prune all punctuation?
    }
    private get(pattern: string): RegExp {
        return this.storedSearches[pattern] || (this.storedSearches[pattern] = new RegExp(`\\b${pattern.replace(/\?/g, ".")}\\b`, "ig"));
    }
    private remember(pattern: string): string[] {
        if (this.storedResults[pattern]) return this.storedResults[pattern];
        this.cachedKeys.push(pattern);
        this.storedResults[pattern] = this.dict.match(this.get(pattern)) || [];
        if (this.cachedKeys.length > this.cacheSize) {
            // @ts-ignore
            this.storedResults[this.cachedKeys.shift()] = undefined;
        }
        return this.storedResults[pattern];
    }
    grep(pattern: string): string[] {
        return this.remember(pattern);
    }
    count(pattern: string): number {
        return this.remember(pattern).length;
    }
}

export class Solver extends AbstractSolver<State> {
    constructor(protected dict: Dictionary, protected randomize = false, printStates?: boolean) {
        super(printStates);
    }
    display(s: State) {
        let buf = "";
        for (let i = 0; i < s.values.length; i++) {
            for (let j = 0; j < s.values[i].length; j++) {
                buf += s.values[i][j];
            }
            buf += "\n";
        }
        console.log(buf);
    }
    private fillState(s: GridElement[][], ref: WordRef, option: string): State {
        const clone = s.map(q => [...q]);
        let {i, j} = ref.pos;
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
    *enumerateNext(s: State): IterableIterator<State> {
        const across = this.generateAcross(s.values);
        const down = this.generateDown(across, s.values);
        const combined = [...across, ...down];
        const unfinished = combined.filter(w => w.pattern.indexOf("?") >= 0);
        const presentWords: {[key: string]: boolean} = {};
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
            shuffle(options);
        }
        for (const option of options) {
            const potential = this.fillState(s.values, ref, option);
            if (this.checkState(potential)) yield potential;
        }
    }
    private checkState(s: State) {
        // This is piles more work than is required.
        // Check that all completed words are in the dictionary
        const across = this.generateAcross(s.values);
        const down = this.generateDown(across, s.values);
        const combined = [...across, ...down].filter(f => f.pattern.indexOf("?") === -1);
        for (const complete of combined) {
            if (!(this.dict.grep(complete.pattern)).length) return false;
        }
        return true;
    }
    isSolution(s: State) {
        for (let i = 0; i < s.values.length; i++) {
            for (let j = 0; j < s.values[i].length; j++) {
                if (s.values[i][j] === "?") return false;
            }
        }
        return true;
    }


  private generateAcross(values: GridElement[][]) {
    const words: WordRef[] = [];
    let buf = "";
    let inWordState = false;
    let bufStart: {i: number, j: number} = {i: 0, j: 0};
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        const val = values[i][j];
        if (!inWordState && val !== ".") {
          inWordState = true;
          buf += val;
          bufStart = {i, j};
        } else if (inWordState && val !== ".") {
          buf += val;
        } else if (inWordState && val === ".") {
          finishWord();
        }
      }
      finishWord();
    }
    return words;

    function finishWord() {
      inWordState = false;
      if (buf.length === 0) { return; } 
      words.push({
        pos: bufStart,
        reference: words.length + 1,
        pattern: buf,
        variant: "across"
      });
      buf = "";
    }
  }
  private generateDown(across: WordRef[], values: GridElement[][]): WordRef[] {
    const words: WordRef[] = [];
    let prevIndex = across.length + 1;
    let buf = "";
    let inWordState = false;
    let bufStart: {i: number, j: number} = {i: 0, j: 0};
    for (let j = 0; j < values[0].length; j++) {
      for (let i = 0; i < values.length; i++) {
        const val = values[i][j];
        if (!inWordState && val !== ".") {
          inWordState = true;
          buf += val;
          bufStart = {i, j};
        } else if (inWordState && val !== ".") {
          buf += val;
        } else if (inWordState && val === ".") {
          finishWord();
        }
      }
      finishWord();
    }
    words.sort((a, b) => a.reference - b.reference);
    return words;

    function finishWord() {
      inWordState = false;
      if (buf.length === 0) { return; }
      const matching = across.find(w => w.pos.i === bufStart.i && w.pos.j === bufStart.j);
      words.push({pos: bufStart, pattern: buf, reference: matching ? matching.reference : prevIndex++, variant: "down"});
      buf = "";
    }
  }
}
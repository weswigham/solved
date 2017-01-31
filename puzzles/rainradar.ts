import {Point2D} from "../util";
import {AbstractSolver} from "../solver";

export interface RainRadarCloud {
    ul: Point2D;
    lr: Point2D;
}

export interface RainRadarState {
    columns: number[];
    rows: number[];
    clouds: RainRadarCloud[];
}

export class RainRadarSolver extends AbstractSolver<RainRadarState> {
    display(state: RainRadarState) {
        const horizontalSeperator = "-".repeat((state.columns.length*2)+1);
        console.log(horizontalSeperator);
        for (let y = 0; y < state.columns.length; y++) {
            let str = "|";
            for (let x = 0; x < state.rows.length; x++) {
                let count = 0;
                for (const cloud of state.clouds) {
                    if (x >= cloud.ul.x && y >= cloud.ul.y && x <= cloud.lr.x && y <= cloud.lr.y) {
                        str += (String.fromCharCode(97 + count).toUpperCase() + "|");
                        count = -1;
                        break;
                    }
                    count++;
                }
                if (count !== -1) {
                    str += " |";
                }
            }
            str += ((state.rows[y] === -1) ? " " : state.rows[y]);
            console.log(str);
            console.log(horizontalSeperator);
        }
        console.log(` ${state.columns.map(c => c === -1 ? " " : c).join(" ")} `);
    }
    *enumerateNext(state: RainRadarState) {
        let minx = 0, miny = 0;
        if (state.clouds.length) {
            minx = state.clouds[state.clouds.length - 1].ul.x;
            miny = state.clouds[state.clouds.length - 1].ul.y;
        }
        for (let x = minx; x < state.columns.length - 1; x++) {
            for (let y = miny; y < state.rows.length - 1; y++) {
                miny = 0;
                for (let x2 = state.columns.length + 1; x2 >= x + 1; x2--) {
                    for (let y2 = state.rows.length - 1; y2 >= y + 1; y2--) {
                        const cloud: RainRadarCloud = {ul: {x, y}, lr: {x: x2, y: y2}};
                        const newStateOrFalse = this.validCloudToAdd(cloud, state);
                        if (newStateOrFalse) {
                            yield newStateOrFalse;
                        }
                    }
                }
            }
        }
    }
    isSolution(state: RainRadarState) {
        return state.columns.every(x => ((x === -1) || (x === 0))) && state.rows.every(x => ((x === -1) || (x === 0)));
    }
    private validCloudToAdd(cloud: RainRadarCloud, state: RainRadarState): false | RainRadarState {
        const columns = [...state.columns];
        const height = cloud.lr.y - cloud.ul.y + 1;
        for (let x = cloud.ul.x; x <= cloud.lr.x; x++) {
            if (columns[x] === -1) continue;
            columns[x] -= height;
            if (columns[x] < 0) return false;
        }
        const rows = [...state.rows];
        const width = cloud.lr.x - cloud.ul.x + 1;
        for (let y = cloud.ul.y; y <= cloud.lr.y; y++) {
            if (rows[y] === -1) continue;
            rows[y] -= width;
            if (rows[y] < 0) return false;
        }
        if (this.cloudHasBoundaryViolations(cloud, state.clouds)) return false;

        return {columns, rows, clouds: [...state.clouds, cloud]};
    }
    private cloudHasBoundaryViolations(cloud: RainRadarCloud, clouds: RainRadarCloud[]) {
        const embiggened = this.embiggen(cloud);
        return !!clouds.find(c => this.pairInterferes(embiggened, c));
    }
    private embiggen(c1: RainRadarCloud) {
        return {ul: {x: c1.ul.x - 1, y: c1.ul.y - 1}, lr: {x: c1.lr.x + 1, y: c1.lr.y + 1}};
    }
    private pairInterferes(c1: RainRadarCloud, c2: RainRadarCloud) {
        return c1.ul.x <= c2.lr.x &&
          c2.ul.x <= c1.lr.x &&
          c1.ul.y <= c2.lr.y &&
          c2.ul.y <= c1.lr.y;
    }
}
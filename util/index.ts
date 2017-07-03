export interface Point2D {
    x: number;
    y: number;
}

export function Enum<X extends string>(...x: X[]): {[K in X]: K } {
    const o: any = {};
    for (const k in x) {
        o[x[k]] = x[k];
    }
    return o;
}

export type Cardinal = "north" | "east" | "south" | "west";
export const Cardinal = Enum("north", "east", "south", "west");

export function shuffle<T>(a: T[]) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

export function Array2D<T>(width: number, height: number): T[][] {
    const a = new Array(width)
    for (let i = 0; i < width; i++) {
        a[i] = new Array(height);
    }
    return a;
}
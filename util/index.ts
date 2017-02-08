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
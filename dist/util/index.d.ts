export interface Point2D {
    x: number;
    y: number;
}
export declare function Enum<X extends string>(...x: X[]): {
    [K in X]: K;
};
export declare type Cardinal = "north" | "east" | "south" | "west";
export declare const Cardinal: {
    north: "north";
    east: "east";
    south: "south";
    west: "west";
};
export declare function shuffle<T>(a: T[]): void;
export declare function Array2D<T>(width: number, height: number): T[][];

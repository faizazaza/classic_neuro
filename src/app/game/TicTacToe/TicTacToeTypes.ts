//X = player 1
//O = player 2
export type CellVals = "X" | "O" | null

export type RowVals = "A" | "B" | "C";

export const rowLetterConvertMap: Record<RowVals, number> = {
    A: -1,
    B: 2,
    C: 5
}
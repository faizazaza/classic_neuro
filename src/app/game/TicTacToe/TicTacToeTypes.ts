//X = player 1
//O = player 2
export type CellVals = "X" | "O" | null

export type RowVals = "A" | "B" | "C";

export const rowLetterConvertMap: Record<RowVals, number> = {
    A: -1,
    B: 2,
    C: 5
}

//should only get 1 or 2
export const getPlayerCellVal = (playerId: number): CellVals => {
    if (playerId == 1) return "X"
    return "O"
}
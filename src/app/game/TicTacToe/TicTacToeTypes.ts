//X = player 1
//O = player 2
export type CellVals = "X" | "O" | null

export const RowVals = ["A", "B", "C"];

//should only get 1 or 2
export const getPlayerCellVal = (playerId: number): CellVals => {
    if (playerId == 1) return "X"
    return "O"
}
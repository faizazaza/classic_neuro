import { ActionType } from "../../types/ActionTypes";
import { z } from "zod";
import { removeSchemaTag } from "../gameUtils/actionUtil";
import { CellVals } from "./TicTacToeTypes";


export const TTTSocketTexts = {
    start: (playerCell: CellVals, oppCell: CellVals, boardState: string) => 
        `To play Tic Tac Toe, you must take turns placing an X or an O in a 3x3 cell grid.
            To win, players must have 3 of their cells in a row, either vertically, horizontally, or diagonally.
            Your cells will be represented by ${playerCell}s on your cells.
            Your opponent's cells will be represented by ${oppCell}s on their cells.
            Here is the current state of the board: 
            ${boardState}`,
    pick_cell: () => 
        `Select a cell to claim on the board.
            Cells must be given as Row A/B/C and Column 1/2/3, for example A1 will be row: A, column: 1`,
    turn: (playerCell: CellVals) => 
        `It is your turn, use the pick_cell action to place a ${playerCell}`,
    errorInvalidSchema: (actionName: string) => `Action rejected: The data given does not match the schema for action ${actionName}`,
    errorInvalidAction: () => `Action rejected: The given action is not for TicTacToe.`,
    errorOOB: (row: string, column: number) => `Action rejected: The given cell row: ${row} column: ${column} is outside bounds. Permitted rows are A/B/C and columns are 1/2/3`,
    errorOccupied: (row: string, column: number) => `Action rejected: The given cell row: ${row} column: ${column} is already occupied.`,
    resultPlayer: (playerCell: CellVals, cellChosen: string, boardState: string) => 
        `You placed a ${playerCell} at ${cellChosen}
            Here is the current state of the board:
            ${boardState}`,
    resultOpponent: (oppCell: CellVals, cellChosen: string, boardState: string) => 
        `Your opponent placed a ${oppCell} at ${cellChosen}
            Here is the current state of the board:
            ${boardState}`,
    win: (boardState: string) =>  
        `You have won the game!
            Here is the final state of the board:
            ${boardState}`,
    lose: (boardState: string) =>  
        `You have lost the game.
            Here is the final state of the board:
            ${boardState}`,
    draw: (boardState: string) =>  
        `The game has ended in a draw.
            Here is the final state of the board:
            ${boardState}`,
}


export enum TTTActions {
    pick_cell = "pick_cell"
}

export const pickCellResponseSchema = z.object({
    row: z.string(),
    column: z.number()
})

export const pickCellAction: ActionType = {
    name: TTTActions.pick_cell,
    description: TTTSocketTexts.pick_cell(),
    schema: removeSchemaTag(z.toJSONSchema(pickCellResponseSchema))
}
import { ActionType } from "../../types/ActionTypes";
import { z } from "zod";
import { removeSchemaTag } from "../gameUtils/actionUtil";
import { CellVals } from "./TicTacToeTypes";


export const TTTSocketTexts = {
    start: (playerCell: CellVals, boardState: string) => `start text, introduction to the game, rules and game state`,
    pick_cell: () => `Message with information about an action, what it does, and how to use it`,
    turn: () => `Message to inform player when its their turn to make an action`,
    errorInvalidSchema: (actionName: string) => `Action rejected: The data given does not match the schema for action ${actionName}`,
    errorInvalidAction: () => `Action rejected: The given action is not for {GAME NAME}.`,
    errorTurn: () => `Action rejected: It is not your turn yet.`,
    resultPlayer: () => `Message to inform socket player of their action result, should come with game state`,
    resultOpponent: () => `Message to inform socket player of opponent's action, should come with a game state`,
    win: () =>  `You have won the game!`,
    lose: () =>  `You have lost.`
}

//need to make sure the key = value here
//is there a better way??????? probably
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
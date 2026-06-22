import { ActionType } from "../../types/ActionTypes";
import { z } from "zod";
import { removeSchemaTag } from "../../utils/actionUtil";


//these are exported as its a template but should not be used anywhere as they are

export const templateSocketTexts = {
    start: () => `start text, introduction to the game, rules and game state`,
    action: () => `Message with information about an action, what it does, and how to use it`,
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
export enum TemplateActions {
    action = "action"
}

export const templateResponseSchema = z.object({
    value: z.number()
})

export const templateAction: ActionType = {
    name: TemplateActions.action,
    description: templateSocketTexts.action(),
    schema: removeSchemaTag(z.toJSONSchema(templateResponseSchema))
}
import z from "zod"
import { ActionType } from "../types/ActionTypes"

export const customisationSocketTexts = {
    change_name: () => 
        `Enter a name you would like be known as. This name will be visible in game`,
    change_colour: () =>
        `Enter a hexadecimal string you like as your player colour. 
            This colour will be visible in game
            An example input would be "AE2448"`,
    errNotHex: () =>
        `The value sent was not a valid hexdecimal colour string. Change was not applied.`,
    errorInvalidSchema: (actionName: string) => 
        `Action rejected: The data given does not match the schema for action ${actionName}`,
}


export enum CustomisationActions {
    change_name = "change_name",
    change_colour = "change_colour",
}

export const nameResponseSchema = z.object({
    name: z.string()
})

export const changeNameAction: ActionType = {
    name: CustomisationActions.change_name,
    description: customisationSocketTexts.change_name(),
    schema: nameResponseSchema
}

export const colourResponseSchema = z.object({
    colour: z.string()
})

export const changeColourAction: ActionType = {
    name: CustomisationActions.change_colour,
    description: customisationSocketTexts.change_colour(),
    schema: colourResponseSchema
}
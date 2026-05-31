




import z from "zod"
import { ActionType } from "../../types/ActionTypes"
import { GameList, GameListEnum } from "../GameList"


export const menuActionSocketTexts = {
    go_to_menu: () => `Return to the Games Menu, this will exit the current game`,  //make sure to unregister all actions after this
    retry_game: () => `Retry the current game`,
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
    game_list: (gameList: string) => 
        `The current games available are: ${gameList}`,
    choose_game: () => 
        `Enter the name of the game you would like to play.`
}

//actions right after a game ends
export enum OutMenuActions {
    go_to_menu = "go_to_menu",  //no payload for both
    retry_game = "retry_game"
}

//actions once in the game menu
export enum InMenuActions {
    choose_game = "choose_game",
    change_name = "change_name",
    change_colour = "change_colour",
}

export const chooseGameSchema = z.object({
    game: z.enum(GameList)  //check if i need to use GameListEnum instead, if not, remove that one
})

export const chooseGameAction: ActionType = {
    name: InMenuActions.choose_game,
    description: menuActionSocketTexts.choose_game(),
    schema: chooseGameSchema
}


export const nameResponseSchema = z.object({
    name: z.string()
})

export const changeNameAction: ActionType = {
    name: InMenuActions.change_name,
    description: menuActionSocketTexts.change_name(),
    schema: nameResponseSchema
}

export const colourResponseSchema = z.object({
    colour: z.string()
})

export const changeColourAction: ActionType = {
    name: InMenuActions.change_colour,
    description: menuActionSocketTexts.change_colour(),
    schema: colourResponseSchema
}
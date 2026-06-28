import { ActionType } from "../../types/ActionTypes";
import { z } from "zod";
import { removeSchemaTag } from "../gameUtils/actionUtil";


export const mancalaSocketTexts = {
    start: (storeNum: number, boardState: string) => 
        `To play Mancala, you must take turns selecting one of your pits and distributing its seeds one by one into the following pits around the board.
            If your last seed lands in your store, you get another turn.
            If your last seed lands in an empty pit on your side, you capture the seeds opposite it.
            The game ends when all pits on one side are empty. The player with the most seeds in their store wins.
            Your pits are ${storeNum-6} to ${storeNum-1} inclusive.
            Your store is ${storeNum}.
            Here is the current state of the board: ${boardState}`,
    pick_pit: () => `Select a pit to move all seeds from it. The seeds will be placed one at a time into each following pit around the board.`,
    turn: (storeNum: number, storedSeeds: number) => 
        `It is your turn, use the pick_pit action to move the seeds from any of the pits ${storeNum-6} to ${storeNum-1} inclusive. 
            Your store is ${storeNum} and holds ${storedSeeds} 
            You cannot select a pit with no seeds.`,
    errorInvalidSchema: (actionName: string) => `Action rejected: The data given does not match the schema for action ${actionName}`,
    errorInvalidAction: () => `Action rejected: The given action is not for Mancala.`,
    errorInvalidPit: (chosenPit: number) => `Action rejected: The given pit ${chosenPit} is not a valid pit, please try again.`,
    errorOOB: (chosenPit: number) => `Action rejected: The given pit ${chosenPit} does not belong to you, please try again.`,
    errorEmpty: (chosenPit: number) => `Action rejected: The given pit ${chosenPit} does not contain any seeds, please try again.`,
    resultPlayer: (chosenPit: number, boardState: string) => 
        `The seeds in your selected pit ${chosenPit} were moved successfully. 
            New board state is: ${boardState}`,
    resultOpponent: (chosenPit: number, boardState: string) => 
        `Your opponent moved the seeds in pit ${chosenPit}.
            New board state is: ${boardState}`,
    win: (storedSeeds: number, opponentSeeds: number) => 
        `You have won the game! Your store contains ${storedSeeds} seeds and your opponent has ${opponentSeeds} seeds.`,
    lose: (storedSeeds: number, opponentSeeds: number) => 
        `You have lost. Your store contains ${storedSeeds} seeds and your opponent has ${opponentSeeds} seeds.`
}

//need to make sure the key = value here
//is there a better way??????? probably
export enum MancalaActions {
    pick_pit = "pick_pit"
}

export const pickResponseSchema = z.object({
    pit: z.number()
})

export const pickPitAction: ActionType = {
    name: MancalaActions.pick_pit,
    description: mancalaSocketTexts.pick_pit(),
    schema: removeSchemaTag(z.toJSONSchema(pickResponseSchema))
}
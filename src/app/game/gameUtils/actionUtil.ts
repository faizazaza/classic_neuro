import { GameList } from "../GameList";
import { CommandEnum, GameMsg } from "../../types/ActionTypes";

//should probably type this better :))))
/* eslint-disable @typescript-eslint/no-explicit-any */
export const removeSchemaTag = (schema: any) => {
    try {
        delete schema["$schema"]
        return schema;
    } catch (error) {
        console.error("ERROR: Failed to remove $schema tag")
        console.log(error)
    }
}

export const buildResultMsg = (game: GameList | "Menu", actionId: string, success: boolean, message?: string): GameMsg => {
    const gameMsg: GameMsg = {
        command: CommandEnum.result,
        game: game, //hmm? or just project name in general?
        data: {
            id: actionId,
            success: success,
            message: message
        }
    }
    return gameMsg;
}
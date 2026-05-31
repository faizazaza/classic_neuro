import { Container } from "pixi.js";
import { GameList } from "../GameList";
import { GameArray } from "./GameArray";
import { GameState } from "../../screens/main/GameState";
import { colourResponseSchema, InMenuActions, menuActionSocketTexts, nameResponseSchema } from "./MenuActions";
import { CommandEnum, GameMsg, ServerMsg } from "../../types/ActionTypes";

export class GameMenu extends Container {

    private gameState: GameState;
    private gameArray: GameArray;

    public onGameSelect: (game: GameList) => void

    constructor(
        gameState: GameState,
        onGameSelect: (game: GameList) => void
    ){
        super()
        this.gameState = gameState;
        this.onGameSelect = onGameSelect;
        this.gameArray = new GameArray(this.onGameSelect);

        this.drawMenu()
    }

    private drawMenu() {
        this.removeChildren();
        this.addChild(this.gameArray);
    }

    //to be called by the gameState i think?? when a game is chosen and exited
    public registerActions(){}

    public unregisterActions(){}

    private handleAction(msg: ServerMsg, playerId: number, playerName: string): GameMsg{
        if (msg.data.name in InMenuActions){    //not a valid action handle?? is that even possible?
            switch (msg.data.name) {
                case InMenuActions.change_colour:
                    return this.updatePlayerColour(playerId, msg);
                case InMenuActions.change_name:
                    return this.updatePlayerName(playerId, msg);
            
                default:
                    break;
            }
        }
    }

    //customisation functions
    private updatePlayerName(playerId: number, msg: ServerMsg): GameMsg {
        const parseResult = nameResponseSchema.safeParse(msg.data.data);
        if (!parseResult.success){
            return this.buildResultMsg(
                msg.data.id, 
                false, 
                menuActionSocketTexts.errorInvalidSchema(msg.data.name)
            )
        }

        this.gameState.setPlayerName(playerId, parseResult.data.name)


        return this.buildResultMsg(
            msg.data.id, 
            true
        )
    }

    public updatePlayerColour(playerId: number, msg: ServerMsg): GameMsg {
        //check if an actual hex value was returned, if it then send back an error
        const parseResult = colourResponseSchema.safeParse(msg.data.data);
        if (!parseResult.success){
            return this.buildResultMsg(
                msg.data.id, 
                false, 
                menuActionSocketTexts.errorInvalidSchema(msg.data.name)
            )
        }
        try {
            const res = parseInt(parseResult.data.colour, 16);
            if (isNaN(res) || res > 16777215){
                return this.buildResultMsg(
                    msg.data.id, 
                    false, 
                    menuActionSocketTexts.errNotHex()
                )
            }

            //finally apply the colour to player
            this.gameState.setPlayerColour(playerId, parseResult.data.colour);

            return this.buildResultMsg(
                msg.data.id, 
                true
            )

        } catch (error) {
            return this.buildResultMsg(
                msg.data.id, 
                false, 
                menuActionSocketTexts.errNotHex()
            )
        }
    }

    private buildResultMsg(actionId: string, success: boolean, message?: string): GameMsg {
        const gameMsg: GameMsg = {
            command: CommandEnum.result,
            game: "Menu",    //????
            data: {
                id: actionId,
                success: success,
                message: message
            }
        }
        return gameMsg;
    }
    
}
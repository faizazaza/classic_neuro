import { Container } from "pixi.js";
import { GameList } from "../game/GameList";
import { GameArray } from "./GameArray";
import { GameState } from "../screens/main/GameState";
import { changeColourAction, changeNameAction, chooseGameAction, chooseGameSchema, colourResponseSchema, InMenuActions, menuActionSocketTexts, nameResponseSchema } from "./MenuActions";
import { GameMsg, ServerMsg } from "../types/ActionTypes";
import { buildResultMsg } from "../game/gameUtils/actionUtil";

export class GameMenu extends Container {

    private gameState: GameState;
    private gameArray: GameArray;

    public onGameSelect: (game: GameList) => void
    public onPlayerAttrChange: () => void;

    constructor(
        gameState: GameState,
        onGameSelect: (game: GameList) => void,
        onPlayerAttrChange: () => void
    ){
        super()
        this.gameState = gameState;
        this.onGameSelect = onGameSelect;
        this.onPlayerAttrChange = onPlayerAttrChange;
        this.gameArray = new GameArray(this.onGameSelect);

        this.drawMenu()
    }

    private drawMenu() {
        this.removeChildren();
        this.addChild(this.gameArray);
    }

    //to be called by the socketGameInterface when a game is started and ended and exited
    public getInMenuActionList(){
        return [chooseGameAction, changeNameAction, changeColourAction];
    }

    public unregisterActions(){}

    public handleAction(msg: ServerMsg, playerId: number, playerName: string): GameMsg{
        console.log("in GameMenu with" + msg.data.name)
        if (msg.data.name in InMenuActions){    
            switch (msg.data.name) {
                case InMenuActions.change_colour:
                    return this.updatePlayerColour(playerId, msg);
                case InMenuActions.change_name:
                    return this.updatePlayerName(playerId, msg);
                case InMenuActions.choose_game:
                    return this.socketChooseGame(playerId, msg);
                default:
                    break;
            }
        }
        return buildResultMsg(
            "Menu", //not a valid action sent?? is that even possible?
            msg.data.id,
            false,
            //msg?
        )
    }

    private socketChooseGame(playerId: number, msg: ServerMsg): GameMsg {
        const parseResult = chooseGameSchema.safeParse(JSON.parse(msg.data.data ?? ""));
        if (!parseResult.success){
            return buildResultMsg(
                "Menu",
                msg.data.id, 
                false, 
                menuActionSocketTexts.errInvalidSchema(msg.data.name)
            )
        }
        const selectedGame = parseResult.data.game;

        if (selectedGame in GameList){
            this.onGameSelect(selectedGame)
            return buildResultMsg(
                "Menu",
                msg.data.id, 
                true
            )
        }
        else {
            return buildResultMsg(
                "Menu",
                msg.data.id, 
                false, 
                menuActionSocketTexts.errInvalidGame(selectedGame)
            )
        }
    }


    //customisation functions
    private updatePlayerName(playerId: number, msg: ServerMsg): GameMsg {
        const parseResult = nameResponseSchema.safeParse(JSON.parse(msg.data.data ?? ""));
        if (!parseResult.success){
            return buildResultMsg(
                "Menu",
                msg.data.id, 
                false, 
                menuActionSocketTexts.errInvalidSchema(msg.data.name)
            )
        }

        this.gameState.setPlayerName(playerId, parseResult.data.name)

        console.log(this.gameState.getPlayerName(playerId))

        this.onPlayerAttrChange()

        return buildResultMsg(
            "Menu",
            msg.data.id, 
            true
        )
    }

    private updatePlayerColour(playerId: number, msg: ServerMsg): GameMsg {
        //check if an actual hex value was returned, if it then send back an error
        const parseResult = colourResponseSchema.safeParse(JSON.parse(msg.data.data ?? ""));
        if (!parseResult.success){
            return buildResultMsg(
                "Menu",
                msg.data.id, 
                false, 
                menuActionSocketTexts.errInvalidSchema(msg.data.name)
            )
        }
        try {
            const res = parseInt(parseResult.data.colour, 16);
            if (isNaN(res) || res > 16777215){
                return buildResultMsg(
                    "Menu",
                    msg.data.id, 
                    false, 
                    menuActionSocketTexts.errNotHex()
                )
            }

            //finally apply the colour to player
            this.gameState.setPlayerColour(playerId, parseResult.data.colour);

            this.onPlayerAttrChange()

            return buildResultMsg(
                "Menu",
                msg.data.id, 
                true
            )

        } catch (error) {
            return buildResultMsg(
                "Menu",
                msg.data.id, 
                false, 
                menuActionSocketTexts.errNotHex()
            )
        }
    }
    
}
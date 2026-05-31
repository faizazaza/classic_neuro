
import { Game } from "../game/GameAbstract";
import { colourResponseSchema, InMenuActions, menuActionSocketTexts, nameResponseSchema } from "../game/Menu/MenuActions";
import { GameState } from "../screens/main/GameState";
import { ActionType, CommandEnum, GameMsg, priorityEnum, ServerMsg } from "../types/ActionTypes";

//sends messages to and from socket players
//socket players call commands from here
//is passed the game when it is init

export class SocketGameInterface{

    public gameState: GameState;    
    private currGame!: Game;

    constructor(state: GameState){
        this.gameState = state;
        console.log(this.gameState);
        //add one mouse player and one socket player
        this.gameState.addPlayer("mouse", "AE2448", false);
        this.gameState.addPlayer("socket", "72BAA9", true, (msg: ServerMsg, playerId: number, playerName: string) => this.handleSocketMsg(msg, playerId, playerName));
        
    }

    public startGame(newGame: Game) {
        this.currGame = newGame;
        //assign override functions
        this.currGame.sendGameContext = this.sendGameContext;
        this.currGame.sendActionList = this.sendActionList;
        this.currGame.sendActionForce = this.sendActionForce;
        this.currGame.sendActionResult = this.sendActionResult;
        this.currGame.unregisterAction = this.unregisterAction;

        //send startup messages to socket players
        //maybe a bit overkill for like 2 players
        for (const player of this.gameState.players){
            if (player.isSocketPlayer){
                const msg: GameMsg = {
                    command: CommandEnum.startup,
                    game: this.gameState.getGameName()
                }
                console.log(msg)
                //no reason for this to be undefined really
                player.socket?.sendGameMsg(msg);
            }
        }

        this.currGame.startGame();
    }

    public endGame() {
        //destroy game and unregister all game related actions
        this.currGame.destroy();
    }

    public updatePlayerName(playerId: number, msg: ServerMsg){
        const parseResult = nameResponseSchema.safeParse(msg.data.data);
        if (!parseResult.success){
            this.sendActionResult(
                playerId, 
                msg.data.id, 
                false, 
                menuActionSocketTexts.errorInvalidSchema(msg.data.name)
            )
            return;
        }

        this.sendActionResult(
            playerId, 
            msg.data.id, 
            true
        )
        this.gameState.setPlayerName(playerId, parseResult.data.name)

    }

    //customisation functions
    public updatePlayerColour(playerId: number, msg: ServerMsg){
        //check if an actual hex value was returned, if it then send back an error
        const parseResult = colourResponseSchema.safeParse(msg.data.data);
        if (!parseResult.success){
            this.sendActionResult(
                playerId, 
                msg.data.id, 
                false, 
                menuActionSocketTexts.errorInvalidSchema(msg.data.name)
            )
            return;
        }
        try {
            const res = parseInt(parseResult.data.colour, 16);
            if (isNaN(res) || res > 16777215){
                this.sendActionResult(
                    playerId, 
                    msg.data.id, 
                    false, 
                    menuActionSocketTexts.errNotHex()
                )
                return;
            }

            this.sendActionResult(
                playerId, 
                msg.data.id, 
                true
            )
            //finally apply the colour to player
            this.gameState.setPlayerColour(playerId, parseResult.data.colour);

        } catch (error) {
            this.sendActionResult(
                playerId, 
                msg.data.id, 
                false, 
                menuActionSocketTexts.errNotHex()
            )
            return;
        }
    }

    //methods to be called from the games

    //get game status from a Game
    public sendGameContext(playerId: number, message: string, isSilent: boolean = false) {
        console.log(`test sendGameContext ${message}`)
        const msg: GameMsg = {
            command: CommandEnum.context,
            game: this.gameState.getGameName(),
            data: {
                message: message,
                silent: isSilent
            }
        }
        this.gameState.players[playerId-1].socket?.sendGameMsg(msg);
    }

    public sendActionList(playerId: number, actionList: ActionType[]) {
        console.log(`test sendActionList ${actionList[0].schema?.toString()}`)
        const msg: GameMsg = {
            command: CommandEnum.register,
            game: this.gameState.getGameName(),
            data: {
                actions: actionList
            }
        }
        this.gameState.players[playerId-1].socket?.sendGameMsg(msg);
    }

    public sendActionForce(playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) {
        console.log(`test sendActionForce ${stateVal} ------ ${queryVal} ------ ${actionList}`)
        const msg: GameMsg = {
            command: CommandEnum.force,
            game: this.gameState.getGameName(),
            data: {
                state: stateVal,
                query: queryVal,
                priority: priorityVal,
                action_names: actionList
            }
        }
        this.gameState.players[playerId-1].socket?.sendGameMsg(msg);
    }

    public sendActionResult(playerId: number, actionId: string, successVal: boolean, messageVal?: string) {
        console.log(`test sendActionResult ${successVal} - ${messageVal}`)
        const msg: GameMsg = {
            command: CommandEnum.result,
            game: this.gameState.getGameName(),
            data: {
                id: actionId,
                success: successVal,
                message: messageVal
            }
        }
        this.gameState.players[playerId-1].socket?.sendGameMsg(msg);
    }

    public unregisterAction(playerId: number, actionList: string[]) {
         console.log(`test sendActionResult ${actionList}`)
        const msg: GameMsg = {
            command: CommandEnum.unregister,
            game: this.gameState.getGameName(),
            data: {
                action_names: actionList
            }
        }
        this.gameState.players[playerId-1].socket?.sendGameMsg(msg);
    }

    //game-based types? maybe just let the game return the error
    public handleSocketMsg(msg: ServerMsg, playerId: number, playerName: string) {

        console.log(msg);
        //check if its a customisation action
        if (msg.data.name in InMenuActions){
            switch (msg.data.name) {
                case InMenuActions.change_colour:
                    this.updatePlayerColour(playerId, msg);
                    break;
            
                default:
                    break;
            }
            return;
        }
        else {
            //check if message is from the right player - use gamestate here
            if (playerId != this.gameState.getCurrentPlayer()){
                //send error to websocket
                this.gameState.players[playerId-1].socket?.sendGameMsg(this.currGame.getWrongPlayerErr(msg));
                return;
            }

            //pass msg to the game
            const actionRes = this.currGame.handleAction(msg, playerId, playerName)
            if (actionRes){ //if there was an error, send that back
                this.gameState.players[playerId-1].socket?.sendGameMsg(actionRes);
            }
        }
    }

}

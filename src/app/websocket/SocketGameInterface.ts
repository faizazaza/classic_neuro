import { Game } from "../game/GameAbstract";
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
        //add one mouse player and one socket player
        this.gameState.addPlayer("mouse", "0xAE2448", false);
        this.gameState.addPlayer("socket", "0x72BAA9", true, this.handleSocketMsg);
        
    }

    public startGame(newGame: Game) {
        this.currGame = newGame;
        //assign override functions
        this.currGame.sendActionList = this.sendActionList;
        this.currGame.sendActionForce = this.sendActionForce;
        this.currGame.sendActionResult = this.sendActionResult;
        this.currGame.unregisterAction = this.unregisterAction;

        this.currGame.startGame();

        //send startup messages to socket players
        //maybe a bit overkill for like 2 players
        for (const player of this.gameState.players){
            if (player.isSocketPlayer){
                const msg: GameMsg = {
                    command: CommandEnum.startup,
                    game: this.gameState.getGameName()
                }
                player.socket?.sendGameMsg(msg);
            }
        }
    }

    //TODO: needs to query socket players that need these messages and then send it over

    public endGame() {
        //destroy game and unregister all game related actions
        this.currGame.destroy();
    }

    //methods to be called from the games

    //get game status from a Game
    public sendGameContext(playerId: number, message: string, isSilent: boolean = false) {
        const msg: GameMsg = {
            command: CommandEnum.context,
            game: this.gameState.getGameName(),
            data: {
                message: message,
                silent: isSilent
            }
        }
        this.sendToAPlayer(playerId, msg);
    }

    public sendActionList(playerId: number, actionList: ActionType[]) {
        console.log("test sendActionList")
        const msg: GameMsg = {
            command: CommandEnum.register,
            game: this.gameState.getGameName(),
            data: {
                actions: actionList
            }
        }
        this.sendToAPlayer(playerId, msg);
    }

    public sendActionForce(playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) {
        console.log("test sendActionForce")
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
        this.sendToAPlayer(playerId, msg);
    }

    public sendActionResult(playerId: number, actionId: string, successVal: boolean, messageVal?: string) {
        console.log("test sendActionResult")
        const msg: GameMsg = {
            command: CommandEnum.result,
            game: this.gameState.getGameName(),
            data: {
                id: actionId,
                success: successVal,
                message: messageVal
            }
        }
        this.sendToAPlayer(playerId, msg);
    }

    public unregisterAction(playerId: number, actionList: string[]) {
        console.log("test unregisterAction")
        const msg: GameMsg = {
            command: CommandEnum.unregister,
            game: this.gameState.getGameName(),
            data: {
                action_names: actionList
            }
        }
        this.sendToAPlayer(playerId, msg);
    }

    //TODO: parse msgs from socket players and handle incorrect schemas
    //game-based types? maybe just let the game return the error
    public handleSocketMsg(msg: ServerMsg, playerId: number, playerName: string) {
        //check if message is from the right player - use gamestate here
        if (playerId != this.gameState.getCurrentPlayer()){
            //TODO: SEND ERROR TO THE PLAYER WEBSOCKET
        }

        //pass msg to the game
        this.currGame.handleAction(msg, playerId, playerName)

    }

    //given a playerId (base 1), send a message to the socket
    private sendToAPlayer(playerId: number, sendMsg: GameMsg){
        //do we definitely know if this is a socket player at this point?
        this.gameState.players[playerId-1].socket?.sendGameMsg(sendMsg);
    }

}

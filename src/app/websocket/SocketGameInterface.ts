import { Game } from "../game/GameAbstract";
import { GameState } from "../screens/main/GameState";
import { ActionType, CommandEnum, GameMsg, priorityEnum } from "../types/ActionTypes";

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
                return msg;
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
    public sendGameContext(message: string, isSilent: boolean = false): GameMsg {
        const msg: GameMsg = {
            command: CommandEnum.context,
            game: this.gameState.getGameName(),
            data: {
                message: message,
                silent: isSilent
            }
        }
        return msg;
    }

    public sendActionList(actionList: ActionType[]): GameMsg {
        console.log("test sendActionList")
        const msg: GameMsg = {
            command: CommandEnum.register,
            game: this.gameState.getGameName(),
            data: {
                actions: actionList
            }
        }
        return msg
    }

    public sendActionForce(stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum): GameMsg {
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
        return msg
    }

    public sendActionResult(actionId: string, successVal: boolean, messageVal?: string): GameMsg {
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
        return msg
    }

    public unregisterAction(actionList: string[]): GameMsg {
        console.log("test unregisterAction")
        const msg: GameMsg = {
            command: CommandEnum.unregister,
            game: this.gameState.getGameName(),
            data: {
                action_names: actionList
            }
        }
        return msg
    }

    //TODO: parse msgs from socket players and handle incorrect schemas
    //game-based types? maybe just let the game return the error
    public handleSocketMsg(socketMsg: string) {
        //typing needed here for response probably
        const msg = JSON.parse(socketMsg);

        switch (msg) {
            case "something":
            break;

            case "something else":
            break;
        
            default:
                //return unhandled exeption
                console.log("fell to default")
                //probably not safe to do this,,,, remove
                console.log(msg)
            break;
        }
    }

}

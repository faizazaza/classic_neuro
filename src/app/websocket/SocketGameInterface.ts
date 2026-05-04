import { Game } from "../game/GameAbstract";
import { GameState } from "../screens/main/GameState";
import { ActionType, CommandEnum, GameMsg } from "../types/ActionTypes";

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
        this.currGame.startGame();
        //send startup messages to socket players

        for (const player of this.gameState.players){
            if (player.isSocketPlayer){
                const msg: GameMsg = {
                    command: CommandEnum.startup,
                    game: this.gameState.currentGame?.toString() ?? "name not found"
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


    //get game status from a Game
    public sendGameContext(message: string): GameMsg {
        const msg: GameMsg = {
            command: CommandEnum.context,
            game: this.gameState.currentGame?.toString() ?? "name not found",
            data: {
                message: message,
                silent: false   //should make this a variable
            }
        }
        return msg;
    }

    public sendActionList(actionList: ActionType[]): GameMsg {
        const msg: GameMsg = {
            command: CommandEnum.register,
            game: this.gameState.currentGame?.toString() ?? "name not found",
            data: {
                actions: actionList
            }
        }
        return msg
    }

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

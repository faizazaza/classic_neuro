
import { Game } from "../game/GameAbstract";
import { EndGameMenu } from "../game/Menu/endGameMenu";
import { GameMenu } from "../game/Menu/GameMenu";
import { InMenuActions } from "../game/Menu/MenuActions";
import { GameState } from "../screens/main/GameState";
import { ActionType, CommandEnum, GameMsg, priorityEnum, ServerMsg } from "../types/ActionTypes";

//sends messages to and from socket players
//socket players call commands from here
//is passed the game when it is init

//should really be renamed since its not specific to socket players anymore

export class SocketGameInterface{

    public gameState: GameState;  
    private gameMenu: GameMenu;  
    private endGameMenu: EndGameMenu;
    private currGame!: Game;

    constructor(state: GameState, gameMenu: GameMenu, endGameMenu: EndGameMenu){
        this.gameState = state;
        this.gameMenu = gameMenu;
        this.endGameMenu = endGameMenu;
        this.endGameMenu.setButtonFuctions(this.exitGame, this.restartGame)
        //add one mouse player and one socket player
        this.gameState.addPlayer("mouse", "AE2448", false);
        //this.gameState.addPlayer("mouse", "72BAA9", false);
        this.gameState.addPlayer(
            "socket", 
            "72BAA9", 
            true, 
            (msg: ServerMsg, playerId: number, playerName: string) => this.handleSocketMsg(msg, playerId, playerName),
            () => this.onSocketConnection()
        );
    }

    //any actions to run after a socket connects
    private onSocketConnection(){
        this.handleMenuActions(true, true)
    }

    public startGame(newGame: Game) {

        //unregister all MenuActions
        this.handleMenuActions(true, false);
        this.handleMenuActions(false, false);

        this.currGame = newGame;
        //assign override functions
        this.currGame.cascadeGameEnd = this.endGame;
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

    private handleMenuActions(inMenu: boolean, register: boolean){
        console.log("in handleMenuActions")
        const menuActions = inMenu ? this.gameMenu.getInMenuActionList() : this.gameMenu.getOutMenuActionList()
        console.log(menuActions)

        for (const player of this.gameState.players){
            if (player.isSocketPlayer){
                if (register){
                    this.sendActionList(player.playerIndex, menuActions)
                }
                else {
                    this.unregisterAction(player.playerIndex, menuActions.map((a) => a.name))
                }
            }
        }
    }

    //called by this.currGame, triggers this.endGameMenu to show
    private endGame() {
        //register out-menu actions
        console.log(this.handleMenuActions)
        this.handleMenuActions(false, true);

        this.endGameMenu.showMenu();
    }

    //called by this.endGameMenu
    public exitGame() {
        //destroy game and unregister all game related actions
        this.currGame.destroy();
        
        //unregister out-menu actions
        this.handleMenuActions(false, false);
        //register in-menu action
        this.handleMenuActions(true, true);
    }

    //called by this.endGameMenu
    private restartGame() {
        this.handleMenuActions(false, false);

        //do i send startup messages here???
        //or should i send a new context message?
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


    //first check if a game is active!! if its not then we need to use the menu
    //game-based types? maybe just let the game return the error
    public handleSocketMsg(msg: ServerMsg, playerId: number, playerName: string) {

        if (!this.gameState.isGameActive()){
            this.gameState.players[playerId-1].socket?.sendGameMsg(this.gameMenu.handleAction(msg, playerId, playerName))
        }

        console.log(msg);
        //check if its a customisation action
        if (msg.data.name in InMenuActions){
            switch (msg.data.name) {
                case InMenuActions.change_colour:
                    
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


import { Game } from "../game/GameAbstract";
import { EndGameMenu } from "../Menu/EndGameMenu";
import { GameMenu } from "../Menu/GameMenu";
import { GameState } from "../screens/main/GameState";
import { ActionType, CommandEnum, GameMsg, priorityEnum, ServerMsg } from "../types/ActionTypes";

//holds the current game and handles communication between it and other components
//most notably the socket player functions 
//there used to be a structure i swear

//should really be renamed since its not specific to socket players anymore

export class SocketGameInterface{

    public gameState: GameState;  
    private gameMenu: GameMenu;  
    private endGameMenu: EndGameMenu;
    private currGame!: Game;

    public onPlayerAttrChange: () => void;

    constructor(state: GameState, gameMenu: GameMenu, endGameMenu: EndGameMenu, onPlayerAttrChange: () => void){
        this.gameState = state;
        this.gameMenu = gameMenu;
        this.endGameMenu = endGameMenu;
        this.endGameMenu.setButtonFuctions(
            this.exitGame,
            this.restartGame
        );
        this.onPlayerAttrChange = onPlayerAttrChange;
        //add one mouse player and one socket player
        this.gameState.addPlayer("mouse", "AE2448", null);
        
        // this.gameState.addPlayer(
        //     "socket", 
        //     "AE2448", 
        //     "ws://localhost:8000", 
        //     (msg: ServerMsg, playerId: number, playerName: string) => this.handleSocketMsg(msg, playerId, playerName),
        //     (id: number) => this.onSocketConnection(id)
        // );
        // this.gameState.addPlayer(
        //     "socket", 
        //     "72BAA9", 
        //     "ws://localhost:8001", 
        //     (msg: ServerMsg, playerId: number, playerName: string) => this.handleSocketMsg(msg, playerId, playerName),
        //     (id: number) => this.onSocketConnection(id)
        // );
        this.gameState.addPlayer("mouse", "72BAA9", null);

    }

    //any actions to run after a socket connects
    private onSocketConnection = (id: number) => {
        this.handleMenuActionsSingle(id, true, true)
    }

    public startGame(newGame: Game) {
        //unregister all MenuActions
        this.handleMenuActions(true, false);
        this.handleMenuActions(false, false);

        this.currGame = newGame;
        //assign override functions
        this.currGame.cascadeGameEnd = this.triggerEndMenu;
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
        //console.log("in handleMenuActions")
        const menuActions = inMenu ? this.gameMenu.getInMenuActionList() : this.endGameMenu.getOutMenuActionList()

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

    private handleMenuActionsSingle(id: number, inMenu: boolean, register: boolean){
        //console.log("in handleMenuActionsSingle")
        const menuActions = inMenu ? this.gameMenu.getInMenuActionList() : this.endGameMenu.getOutMenuActionList()
        const player = this.gameState.players[id-1]

        if (player.isSocketPlayer){
            if (register){
                this.sendActionList(player.playerIndex, menuActions)
            }
            else {
                this.unregisterAction(player.playerIndex, menuActions.map((a) => a.name))
            }
        }
        else {
            console.error(`Error: handleMenuActionsSingle called for non-socket player Id:${id}`)
        }

    }

    //called by this.currGame, triggers this.endGameMenu to show
    private triggerEndMenu = () => {
        //update score header
        this.onPlayerAttrChange();
        //register out-menu actions
        this.handleMenuActions(false, true);

        this.endGameMenu.showMenu();
    }

    //called by this.endGameMenu
    public exitGame = () => {
        this.gameState.gameEnd();
        //destroy game and unregister all game related actions
        this.currGame.destroy();
        
        //unregister out-menu actions
        this.handleMenuActions(false, false);
        //register in-menu action
        this.handleMenuActions(true, true);
    }

    //called by this.endGameMenu
    private restartGame = () => {
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
    public sendGameContext = (playerId: number, message: string, isSilent: boolean = false) => {
        //console.log(`test sendGameContext ${message}`)
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

    public sendActionList = (playerId: number, actionList: ActionType[]) => {
        //console.log(`test sendActionList ${actionList[0].schema?.toString()}`)
        const msg: GameMsg = {
            command: CommandEnum.register,
            game: this.gameState.getGameName(),
            data: {
                actions: actionList
            }
        }
        this.gameState.players[playerId-1].socket?.sendGameMsg(msg);
    }

    public sendActionForce = (playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => {
        //console.log(`test sendActionForce ${stateVal} ------ ${queryVal} ------ ${actionList}`)
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

    public sendActionResult = (playerId: number, actionId: string, successVal: boolean, messageVal?: string) => {
        //console.log(`test sendActionResult ${successVal} - ${messageVal}`)
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

    public unregisterAction = (playerId: number, actionList: string[]) => {
        //console.log(`test sendActionResult ${actionList}`)
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

        //in menu actions
        if (!this.gameState.isGameActive()){
            if (this.currGame){ //at the start this is undefined
                if (this.currGame.gameOver){
                this.gameState.players[playerId-1].socket?.sendGameMsg(this.endGameMenu.handleAction(playerId, msg, playerName));
                return;
                }
            }
            this.gameState.players[playerId-1].socket?.sendGameMsg(this.gameMenu.handleAction(msg, playerId, playerName))
            return;
        }


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

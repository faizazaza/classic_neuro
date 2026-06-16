import { ServerMsg } from "../../types/ActionTypes";
import { GameList } from "../../game/GameList";
import { SocketPlayer } from "../../websocket/SocketPlayer";
import { randomBool } from "../../../engine/utils/random";

export class GameState {
    private currentGame: GameList | null = null;
    private currentPlayer = 1;
    private turns = 0;
    private gameActive = false; //what is this used for huh
    private winnerPlayer = -1;

    public players: PlayerState[] = [];

    public addPlayer(
        name: string, 
        colour: string, 
        socketUrl: string | null, 
        onSocketMsg: (msg: ServerMsg, playerId: number, playerName: string) => void = () => {},
        onSocketConnection: () => void = () => {}
    ) {
        const playersLength = this.players.length;
        this.players[playersLength] = {
            playerName: name,
            playerIndex: playersLength + 1,
            playerColour: colour,
            playerWins: 0,
            isSocketPlayer: socketUrl != null,
            socket: socketUrl ? new SocketPlayer(
                socketUrl, 
                name, 
                playersLength + 1, 
                onSocketMsg,
                onSocketConnection
            ) : undefined
        }
    }

    public newGame(currentGame: GameList) {
        this.currentGame = currentGame;
        this.turns = 0;
        this.gameActive = true;
        this.winnerPlayer = -1;
    }

    public gameEnd(){   //call this when leaving a game!
        this.currentGame = null;
        this.gameActive = false;
    }

    public getGameName(){return this.currentGame?.toString() ?? "Menu"}

    public isGameActive(){return this.gameActive}

    public updateTurn(){
        this.currentPlayer = this.currentPlayer == 1 ? 2 : 1
        this.turns ++;
    }

    public updateWinner(playerId: number){
        this.winnerPlayer = playerId;
        this.players[playerId-1].playerWins += 1;
    }

    public randomPlayerAssign(){
        this.currentPlayer = randomBool() ? 1 : 2;
    }

    //validation is done BEFORE this point
    public setPlayerColour(playerNum: number, colour: string){
        this.players[playerNum-1].playerColour = colour;
    }

    public setPlayerName(playerNum: number, name: string){
        this.players[playerNum-1].playerName = name;
    }

    //holy methods????
    public getCurrentPlayerName(){
        return this.players[this.currentPlayer-1].playerName;
    }

    public getCurrentPlayer(){
        return this.currentPlayer;
    }

    public getWinnerPlayer(){
        return this.winnerPlayer;
    }

    public getCurrentPlayerColour(){
        return this.players[this.currentPlayer-1].playerColour;
    }

    public getCurrentPlayerWins(){
        return this.players[this.currentPlayer-1].playerWins;
    }

    public getCurrentIsSocketPlayer(){
        return this.players[this.currentPlayer-1].isSocketPlayer;
    }

    //out of bounds errors???????
    public getPlayerName(playerNum: number){
        return this.players[playerNum-1].playerName;
    }

    public getPlayerColour(playerNum: number){
        return this.players[playerNum-1].playerColour;
    }

    public getPlayerWins(playerNum: number){
        return this.players[playerNum-1].playerWins;
    }

    public getIsSocketPlayer(playerNum: number){
        return this.players[playerNum-1].isSocketPlayer;
    }
}

export type PlayerState = {
    playerName: string,
    playerIndex: number,
    playerColour: string,
    playerWins: number,
    isSocketPlayer: boolean,
    socket?: SocketPlayer,
}
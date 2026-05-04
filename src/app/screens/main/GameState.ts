import { GameList } from "../../ui/GameList";
import { SocketPlayer } from "../../websocket/SocketPlayer";

export class GameState {
    public currentGame: GameList | null = null;
    public currentPlayer = 1;
    public turns = 0;
    public gameActive = true;
    public winnerPlayer = 0;

    public players: PlayerState[] = [];

    public addPlayer(name: string, colour: string, isSocket: boolean, onSocketMsg: (socketMsg: string) => void = () => {}) {
        const playersLength = this.players.length;
        this.players[playersLength] = {
            playerName: name,
            playerIndex: playersLength + 1,
            playerColour: colour,
            playerWins: 0,
            isSocketPlayer: isSocket,
            socket: isSocket ? new SocketPlayer("...", name, playersLength + 1, onSocketMsg) : undefined
        }
    }

    //holy methods????
    public updateWins(winnerIndex: number){
        this.players[winnerIndex-1].playerWins += 1;
    }

    public getCurrentPlayerName(){
        return this.players[this.currentPlayer-1].playerName;
    }

    public getCurrentPlayerIndex(){
        return this.players[this.currentPlayer-1].playerIndex;
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
    public getPlayerName(index: number){
        return this.players[index].playerName;
    }

    public getPlayerIndex(index: number){
        return this.players[index].playerIndex;
    }

    public getPlayerColour(index: number){
        return this.players[index].playerColour;
    }

    public getPlayerWins(index: number){
        return this.players[index].playerWins;
    }

    public getIsSocketPlayer(index: number){
        return this.players[index].isSocketPlayer;
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
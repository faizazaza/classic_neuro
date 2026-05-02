import { GameState } from "../screens/main/GameState";
import { SocketPlayer } from "./SocketPlayer";

//sends messages to and from socket players
//passed to Games from MainScreen

export class SocketActionHandler{

    public gameState: GameState;    //this proabably doesnt work like i want it to
    private player_1: SocketPlayer | null = null;
    private player_2: SocketPlayer | null = null;

    constructor(state: GameState){
        this.gameState = state;
    }

    //this is ugly
    public addSocketPlayer(index: number, player: SocketPlayer){
        if (index == 1){
            this.player_1 = player;
        }
        else {
            this.player_2 = player;
        }
    }

    //get game status from a Game
    public sendGameStatus(){

    }

}

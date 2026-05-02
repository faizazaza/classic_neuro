import { Container } from "pixi.js";

//abstract for all games to inherit from
//define the functions all games should have from here
//send actions
//send game status
//end game
//start game
export abstract class Game extends Container {

    constructor(){
        super()
    }

    public abstract startGame(): void;
    public abstract endGame(winner: number): void;
    public abstract sendGameStatus(): string;
    public abstract sendActions(): string;  //TODO - probably should type this

}

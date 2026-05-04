import { Container } from "pixi.js";
import { ActionType, ForceDataType } from "../types/ActionTypes";

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
    public abstract sendActionList(): ActionType[];
    public abstract sendActionForce(): ForceDataType;
    public abstract unregisterAction(): string[];

}

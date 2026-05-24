import { Container } from "pixi.js";
import { ActionType, GameMsg, priorityEnum, ServerMsg } from "../types/ActionTypes";

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

    //i could just have one method,, i dont really like it,, but i guess its a nice reminder of what actions needs to be made for each game?
    public abstract sendGameContext(playerId: number, message: string, isSilent: boolean): void
    public abstract sendActionList(playerId: number, actionList: ActionType[]):  void;
    public abstract sendActionForce(playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum): void;
    public abstract sendActionResult(playerId: number, actionId: string, successVal: boolean, messageVal?: string): void;
    public abstract unregisterAction(playerId: number, actionList: string[]): void;

    public abstract handleAction(msg: ServerMsg, playerId: number, playerName: string): GameMsg | null;

    public abstract getWrongPlayerErr(msg: ServerMsg): GameMsg;

}

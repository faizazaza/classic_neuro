import { Container } from "pixi.js";
import { ActionType, GameMsg, priorityEnum } from "../types/ActionTypes";

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

    public abstract collectGameStatus(): string;
    public abstract collectActionList(): ActionType[];

    public abstract sendActionList(actionList: ActionType[]):  GameMsg;
    public abstract sendActionForce(stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum): GameMsg;
    public abstract sendActionResult(actionId: string, successVal: boolean, messageVal?: string): GameMsg;
    public abstract unregisterAction(actionList: string[]): GameMsg;

    public abstract handleAction(playerId: number, actionId: number, actionName: string, data: string): void;

}

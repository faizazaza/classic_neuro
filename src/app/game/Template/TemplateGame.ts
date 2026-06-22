import { GameState } from "../../screens/main/GameState";
import { ActionType, priorityEnum, ServerMsg, GameMsg } from "../../types/ActionTypes";
import { engine } from "../../getEngine";
import { Game } from "../GameAbstract";

//this is exported as its a template but should not be used anywhere as it is

export class TemplateGame extends Game {

    private gameState: GameState;

    public cascadeGameEnd: () => void;
    public sendGameContext: (playerId: number, message: string, isSilent: boolean) => void;
    public sendActionList: (playerId: number, actionList: ActionType[]) => void;
    public sendActionForce: (playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => void;
    public sendActionResult: (playerId: number, actionId: string, successVal: boolean, messageVal?: string) => void
    public unregisterAction: (playerId: number, actionList: string[]) => void

    constructor(state: GameState){
        super();
        this.gameState = state;
        engine().ticker.autoStart = true;

        //temp functions to start in(n)it,,,, these functions are overridden in SocketGameInterface
        this.cascadeGameEnd = () => {throw new Error("Method not implemented.");}
        this.sendGameContext = () => {throw new Error("Method not implemented.");}
        this.sendActionList = () => {throw new Error("Method not implemented.");}
        this.sendActionForce = () => {throw new Error("Method not implemented.");}
        this.sendActionResult = () => {throw new Error("Method not implemented.");}
        this.unregisterAction = () => {throw new Error("Method not implemented.");}

    }

    public startGame(): void {
        throw new Error("Method not implemented.");
    }
    public endGame(winner: number): void {
        throw new Error("Method not implemented.");
    }

    public handleAction(msg: ServerMsg, playerId: number, playerName: string): GameMsg | null {
        throw new Error("Method not implemented.");
    }
    public getWrongPlayerErr(msg: ServerMsg): GameMsg {
        throw new Error("Method not implemented.");
    }

}
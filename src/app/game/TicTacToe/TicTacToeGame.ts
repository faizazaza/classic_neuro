import { Text } from "pixi.js";
import { GameState } from "../../screens/main/GameState";
import { ActionType, priorityEnum, ServerMsg, GameMsg } from "../../types/ActionTypes";
import { engine } from "../../getEngine";
import { Game } from "../GameAbstract";
import { TicTacToeBoard } from "./TicTacToeBoard";
import { pickCellAction, TTTSocketTexts } from "./TicTacToeActions";

export class TicTacToeGame extends Game {

    private gameState: GameState;
    private board: TicTacToeBoard;
    private topText: Text;

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

        this.board = new TicTacToeBoard();
        this.topText = new Text();

        //temp functions to start in(n)it,,,, these functions are overridden in SocketGameInterface
        this.cascadeGameEnd = () => {throw new Error("Method not implemented.");}
        this.sendGameContext = () => {throw new Error("Method not implemented.");}
        this.sendActionList = () => {throw new Error("Method not implemented.");}
        this.sendActionForce = () => {throw new Error("Method not implemented.");}
        this.sendActionResult = () => {throw new Error("Method not implemented.");}
        this.unregisterAction = () => {throw new Error("Method not implemented.");}

    }

    public startGame(): void {
        this.removeChildren();
        this.gameOver = false;

        for (let i = 1; i < 3; i++) {
            if (this.gameState.getIsSocketPlayer(i)){
                this.sendGameContext(
                    i,
                    TTTSocketTexts.start(i == 1 ? "X" : "O", this.getBoardState()),
                    true
                )
                //send action list for socket players
                this.sendActionList(
                    i,
                    [pickCellAction]
                )
            } 
        }

        this.gameState.randomPlayerAssign();

        this.topText = new Text({
            text: `${this.gameState.getCurrentPlayerName()}'s Turn`,
            style: {
            fontSize: 50,
            fill: this.gameState.getCurrentPlayerColour(),
            padding: 0,
            fontWeight: '800',
            },
                x: 0,
                y: -300,
            anchor: 0.5,
        });

        this.drawGame();

    }

    private drawGame(){
        this.addChild(this.board);
        //topText
        this.addChild(this.topText);
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

    private getBoardState(): string{
        return "TODO"
    }

}
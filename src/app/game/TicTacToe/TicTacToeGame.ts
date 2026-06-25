import { Text } from "pixi.js";
import { GameState } from "../../screens/main/GameState";
import { ActionType, priorityEnum, ServerMsg, GameMsg } from "../../types/ActionTypes";
import { engine } from "../../getEngine";
import { Game } from "../GameAbstract";
import { TicTacToeBoard } from "./TicTacToeBoard";
import { pickCellAction, TTTActions, TTTSocketTexts } from "./TicTacToeActions";
import { getPlayerCellVal } from "./TicTacToeTypes";


export class TicTacToeGame extends Game {

    private gameState: GameState;
    private board!: TicTacToeBoard;
    private topText: Text;

    public cascadeGameEnd: (winner: number) => void;
    public sendGameContext: (playerId: number, message: string, isSilent: boolean) => void;
    public sendActionList: (playerId: number, actionList: ActionType[]) => void;
    public sendActionForce: (playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => void;
    public sendActionResult: (playerId: number, actionId: string, successVal: boolean, messageVal?: string) => void
    public unregisterAction: (playerId: number, actionList: string[]) => void

    constructor(state: GameState){
        super();
        this.gameState = state;
        engine().ticker.autoStart = true;

        this.topText = new Text();

        //temp functions to start in(n)it,,,, these functions are overridden in SocketGameInterface
        this.cascadeGameEnd = () => {throw new Error("Method not implemented.");}
        this.sendGameContext = () => {throw new Error("Method not implemented.");}
        this.sendActionList = () => {throw new Error("Method not implemented.");}
        this.sendActionForce = () => {throw new Error("Method not implemented.");}
        this.sendActionResult = () => {throw new Error("Method not implemented.");}
        this.unregisterAction = () => {throw new Error("Method not implemented.");}

    }

    public startGame = (): void => {
        this.board = new TicTacToeBoard(
            this.gameState, 
            this.updateTurnText,
            this.endGame,
            this.sendGameContext, 
            this.sendActionForce, 
            this.sendActionResult
        );
        this.removeChildren();
        this.gameOver = false;

        for (let i = 1; i < 3; i++) {
            if (this.gameState.getIsSocketPlayer(i)){
                this.sendGameContext(
                    i,
                    TTTSocketTexts.start(getPlayerCellVal(i), getPlayerCellVal(3 - i), this.board.getBoardState()),
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
                x: 10,  //idk it looked weird
                y: -300,
            anchor: 0.5,
        });

        this.drawGame();

    }

    private drawGame = () => {
        this.addChild(this.board);
        //topText
        this.addChild(this.topText);
    }

    updateTurnText = () => {
        this.topText.text = `${this.gameState.getCurrentPlayerName()}'s Turn`;
        this.topText.style.fill = this.gameState.getCurrentPlayerColour();
    }

    public endGame = (winner: number): void => {
        this.gameOver = true;
        if (winner == 0){
            this.topText.style.fill = 0xffffff;
            this.topText.text = `Its a Draw!`;
        }
        else {
            this.topText.style.fill = this.gameState.getPlayerColour(winner);
            this.topText.text = `Winner is ${this.gameState.getPlayerName(winner)}!`;
        }


        for (let i = 1; i < 3; i++) {
            if (this.gameState.getIsSocketPlayer(i)){

                if (winner == 0){
                    this.sendGameContext(
                        i, 
                        TTTSocketTexts.draw(this.board.getBoardState()),
                        false
                    )
                }
                else if (i == winner){
                    this.sendGameContext(
                        i, 
                        TTTSocketTexts.win(this.board.getBoardState()),
                        false
                    )
                }
                else {
                    this.sendGameContext(
                        i, 
                        TTTSocketTexts.lose(this.board.getBoardState()),
                        false
                    )
                }

                this.unregisterAction(i, [TTTActions.pick_cell])
            } 
        }

        //call function assigned from Game Interface for game menu actions
        this.cascadeGameEnd(winner);
    }

    public handleAction = (msg: ServerMsg, playerId: number, playerName: string): GameMsg | null => {
        throw new Error("Method not implemented.");
    }
    public getWrongPlayerErr = (msg: ServerMsg): GameMsg => {
        throw new Error("Method not implemented.");
    }

}
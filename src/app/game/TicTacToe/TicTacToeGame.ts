import { Text } from "pixi.js";
import { GameState } from "../../screens/main/GameState";
import { ActionType, priorityEnum, ServerMsg, GameMsg } from "../../types/ActionTypes";
import { engine } from "../../getEngine";
import { Game } from "../GameAbstract";
import { TicTacToeBoard } from "./TicTacToeBoard";
import { pickCellAction, pickCellResponseSchema, TTTActions, TTTSocketTexts } from "./TicTacToeActions";
import { RowVals} from "./TicTacToeTypes";
import { buildResultMsg } from "../gameUtils/actionUtil";
import { GameList } from "../GameList";


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

    constructor(gameType: GameList, state: GameState){
        super(gameType);
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

        if (this.gameState.getCurrentIsSocketPlayer()){
            this.board.sendInitForce()
        }

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

    //return errors here, action result handling will be in the board as it is after action is done
    public handleAction = (msg: ServerMsg, playerId: number, playerName: string): GameMsg | null => {
        if (msg.data.name in TTTActions){
            const parseResult = pickCellResponseSchema.safeParse(JSON.parse(msg.data.data ?? ""))
            //validation steps
            if (!parseResult.success){
                return buildResultMsg(GameList.TicTacToe, msg.data.id, false, TTTSocketTexts.errorInvalidSchema(msg.data.name))
            }
            //check if row/column are in bounds
            const rowString = parseResult.data.row;
            const column = parseResult.data.column - 1; //socket will send base 1, but we need base 0
            if (!(RowVals.includes(rowString)) || (column < 0 || column > 2)){
                return buildResultMsg(GameList.TicTacToe, msg.data.id, false, TTTSocketTexts.errorOOB(rowString, column))
            }
            //check if cell is already filled
            const row = RowVals.indexOf(rowString);
            if (!(this.board.isCellEmpty(row, column))){
                return buildResultMsg(GameList.TicTacToe, msg.data.id, false, TTTSocketTexts.errorOccupied(rowString, column))
            }
            //validation passed, place mark in cell
            this.board.onCellSelectSocket(playerId, row, column, msg.data.id);
            return null

        }
        else {
            //non-existant action / not a mancala action
            return buildResultMsg(GameList.TicTacToe, msg.data.id, false, TTTSocketTexts.errorInvalidAction());
        }
    }

}
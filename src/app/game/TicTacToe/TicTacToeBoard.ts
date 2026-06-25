import { Container } from "pixi.js";
import { List } from "@pixi/ui";
import { getPlayerCellVal, rowLetterConvertMap, RowVals } from "./TicTacToeTypes";
import { TicTacToeCell } from "./TicTacToeCell";
import { GameState } from "../../screens/main/GameState";
import { priorityEnum } from "../../types/ActionTypes";
import { TTTActions, TTTSocketTexts } from "./TicTacToeActions";

export class TicTacToeBoard extends Container {

    private gameState: GameState;
    private board: TicTacToeCell[];
    private filledCells = 0;

    private updateTurnText: () => void;
    private endGame: (winner: number) => void;

    private sendGameContext: (playerId: number, message: string, isSilent: boolean) => void;
    private sendActionForce: (playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => void;
    public sendActionResult: (playerId: number, actionId: string, successVal: boolean, messageVal?: string) => void

    private layout: List;

    private readonly cellSide: number = 150;
    

    constructor(
        gameState: GameState, 
        updateTurnText: () => void,
        endGame: (winner: number) => void,
        sendGameContext: (playerId: number, message: string, isSilent: boolean) => void,
        sendActionForce: (playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => void,
        sendActionResult: (playerId: number, actionId: string, successVal: boolean, messageVal?: string) => void
    ){
        super()
        this.gameState = gameState;
        this.updateTurnText = updateTurnText;
        this.endGame = endGame;
        this.sendGameContext = sendGameContext;
        this.sendActionForce = sendActionForce;
        this.sendActionResult = sendActionResult;

        this.board = []

        this.layout = new List({ 
            maxWidth: (this.cellSide * 4),
            maxHeight: (this.cellSide * 4),
        });

        this.layout.x = - (this.cellSide * 1.5);
        this.layout.y = - (this.cellSide * 1.5);

        for (let i = 0; i < 9; i++){
            const cell = new TicTacToeCell(i, this.cellSide, this.onCellSelect);
            this.board[i] = cell;
            this.layout.addChild(cell);
        }

        this.addChild(this.layout);
    }

    public isCellEmpty = (row: RowVals, column: number) => {
        const cell = rowLetterConvertMap[row] + column;
        return this.board[cell] == null
    }

    //should be called for socket responses
    private rowColToIndex = (row: RowVals, column: number): number => {
        return rowLetterConvertMap[row] + column;
    }

    //when cell is selected by a mouse player
    //passed to the cell objects, should call the below function
    private onCellSelect = (cellIndex: number) => {
        this.pickCell(this.gameState.getCurrentPlayer(), cellIndex);
    }

    public pickCell = (playerId: number, cellIndex: number) => {
        this.board[cellIndex].selectCell(getPlayerCellVal(playerId), this.gameState.getPlayerColour(playerId))
        this.filledCells++
        //TODO: SEND CONTEXT HERE

        //check for winner / if game should end
        const winner = this.calculateWinner();
        if (winner) this.startEndGame(winner);
        else if (this.filledCells == 9) this.startEndGame(0) //draw - no winner
        else this.nextTurn()
    }

    private nextTurn = () => {
        //change to next player
        this.gameState.updateTurn()

        const nextPlayer = this.gameState.getCurrentPlayer();
        this.updateTurnText()

        //send action force to next player - if socket player
        if (this.gameState.getIsSocketPlayer(nextPlayer)){
            this.sendActionForce(
                nextPlayer, 
                this.getBoardState(), 
                TTTSocketTexts.turn(getPlayerCellVal(nextPlayer)),
                [TTTActions.pick_cell],
                priorityEnum.low
            )
        }
    }

    private calculateWinner = () => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            const cellVal = this.board[a].getCellVal();
            if (cellVal != null && cellVal === this.board[b].getCellVal() && cellVal === this.board[c].getCellVal()) {
                return cellVal == "X" ? 1 : 2;
            }
        }
        return null;
    }

    //function to cleanup things before calling endGame()
    //disabling buttons
    private startEndGame(winner: number){
        for (let i = 0; i < 9; i++){
            this.board[i].disableCell()
        }
        this.endGame(winner);
    }

    public getBoardState = (): string => {
        return "TODO"
    }

}
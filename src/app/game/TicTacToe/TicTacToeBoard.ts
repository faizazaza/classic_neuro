import { Container } from "pixi.js";
import { List } from "@pixi/ui";
import { getPlayerCellVal, RowVals } from "./TicTacToeTypes";
import { TicTacToeCell } from "./TicTacToeCell";
import { GameState } from "../../screens/main/GameState";
import { priorityEnum } from "../../types/ActionTypes";
import { TTTActions, TTTSocketTexts } from "./TicTacToeActions";

export class TicTacToeBoard extends Container {

    private gameState: GameState;
    private board: TicTacToeCell[][];
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

        this.board = [];

        this.layout = new List({ 
            maxWidth: (this.cellSide * 4),
            maxHeight: (this.cellSide * 4),
        });

        this.layout.x = - (this.cellSide * 1.5);
        this.layout.y = - (this.cellSide * 1.5);

        for (let i = 0; i < 3; i++){
            this.board[i] = [];
            for (let j = 0; j < 3; j++) {
                const cell = new TicTacToeCell(i, this.cellSide, () => {this.onCellSelect(i,j)});
                this.board[i][j] = cell;
                this.layout.addChild(cell);
            }
        }

        this.addChild(this.layout);


    }

    public sendInitForce(){
        for (let i = 1; i < 3; i++) {
            if (this.gameState.getIsSocketPlayer(i)){
                this.sendGameContext(
                    i,
                    TTTSocketTexts.start(
                        getPlayerCellVal(i),
                        getPlayerCellVal(3-i),
                        this.getBoardState()
                    ),
                    false
                )
            }
            if (i == this.gameState.getCurrentPlayer()){
                this.sendActionForce(
                    i, 
                    this.getBoardState(), 
                    TTTSocketTexts.turn(getPlayerCellVal(i)),
                    [TTTActions.pick_cell],
                    priorityEnum.low
                )
            }
            
        }
    }

    public isCellEmpty = (row: number, column: number) => {
        return this.board[row][column].getCellVal() == null
    }

    //when selected by a socket player - use sendActionResult
    public onCellSelectSocket = (playerId: number, row: number, column: number, msgId: string) => {
        this.pickCell(playerId, row, column);
        this.sendActionResult(
            playerId, 
            msgId, 
            true, 
            TTTSocketTexts.resultPlayer(
                getPlayerCellVal(playerId), 
                `${RowVals[row]}${column+1}`,  
                this.getBoardState()
            )
        )
        this.sendContextAfterTurn(playerId, `${RowVals[row]}${column+1}`);
        this.progressTurn();
    }

    //when cell is selected by a mouse player
    //passed to the cell objects, should call the below function
    private onCellSelect = (row: number, column: number) => {
        this.pickCell(this.gameState.getCurrentPlayer(), row, column);
        this.sendContextAfterTurn(this.gameState.getCurrentPlayer(), `${RowVals[row]}${column+1}`)
        this.progressTurn();
    }

    private pickCell = (playerId: number, row: number, column: number) => {
        this.board[row][column].selectCell(getPlayerCellVal(playerId), this.gameState.getPlayerColour(playerId))
        this.filledCells++
    }

    private sendContextAfterTurn = (currPlayer: number, rowColumn: string) => {
        const opponentId = currPlayer == 1 ? 2 : 1;
        if (this.gameState.getIsSocketPlayer(opponentId)){
            this.sendGameContext(
                opponentId, 
                TTTSocketTexts.resultOpponent(
                    getPlayerCellVal(currPlayer),
                    rowColumn,
                    this.getBoardState()
                ), 
                true
            )
        }
    }

    private progressTurn = () => {
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
            [[0,0], [0,1], [0,2]],
            [[1,0], [1,1], [1,2]],
            [[2,0], [2,1], [2,2]],
            [[0,0], [1,0], [2,0]],
            [[0,1], [1,1], [2,1]],
            [[0,2], [1,2], [2,2]],
            [[0,0], [1,1], [2,2]],
            [[0,2], [1,1], [2,0]],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            const cellVal = this.board[a[0]][a[1]].getCellVal();
            if (cellVal != null && cellVal === this.board[b[0]][b[1]].getCellVal() && cellVal === this.board[c[0]][c[1]].getCellVal()) {
                return cellVal == "X" ? 1 : 2;
            }
        }
        return null;
    }

    //function to cleanup things before calling endGame()
    //disabling buttons
    private startEndGame(winner: number){
        for (let i = 0; i < 3; i++){
            for (let j = 0; j < 3; j++) {
                this.board[i][j].disableCell()
            }
        }
        this.endGame(winner);
    }

    //??? HARDCODED??
    public getBoardState = (): string => {
        return `
                1   2   3
        A | ${this.board[0][0].getCellVal()} | ${this.board[0][1].getCellVal()} | ${this.board[0][2].getCellVal()} |
        B | ${this.board[1][0].getCellVal()} | ${this.board[1][1].getCellVal()} | ${this.board[1][2].getCellVal()} |
        C | ${this.board[2][0].getCellVal()} | ${this.board[2][1].getCellVal()} | ${this.board[2][2].getCellVal()} |
        `
    }

}
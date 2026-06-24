import { Container } from "pixi.js";
import { CellVals, rowLetterConvertMap, RowVals } from "./TicTacToeTypes";


export class TicTacToeBoard extends Container {

    private board: CellVals[];
    private filledCells = 0;

    constructor(){
        super()
        this.board = []

        for (let i = 0; i < 9; i++){
            this.board[i] = null
        }
    }

    public isCellEmpty(row: RowVals, column: number) {
        const cell = rowLetterConvertMap[row] + column;
        return this.board[cell] == null
    }

    public pickCell(playerId: number, row: RowVals, column: number): number{
        const cell = rowLetterConvertMap[row] + column;
        this.board[cell] = playerId == 1 ? "X" : "O";
        this.filledCells++
        //check for winner and if game ends
        const winner = this.calculateWinner();
        if (winner) return winner;
        else if (this.filledCells == 9) return 0 //draw - no winner
        return -1
    }


    private calculateWinner() {
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
            if (this.board[a] != null && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a] == "X" ? 1 : 2
            }
        }
        return null;
    }
}
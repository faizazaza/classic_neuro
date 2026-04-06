import { Container, Graphics } from "pixi.js";
import { MancalaPit } from "./MancalaPit";
import { waitFor } from "../../../engine/utils/waitFor";
import { GameState } from "../GameState";


export class MancalaBoard extends Container {
    //board of 6 x 2 pits and 2 capture pits
    private static readonly WAIT_DURATION = 0.25;

    private static readonly boardSize = 14;
    public board: MancalaPit[] = [];
    private gameState: GameState;

    public onTurnChange?: (player: number) => void;
    public onGameEnd?: (winner: number) => void;

    //TODO: should make it scale on screen size
    private boardWidth: number = 900;
    private boardVerticalBuffer: number = 50;
    private boardHorizontalBuffer: number = 20;
    private boardLength: number = this.boardWidth / 2;

    private pitSize = (this.boardWidth - (9 * this.boardHorizontalBuffer))/8;
    private storeLength = this.boardLength - (2 * this.boardVerticalBuffer);

    constructor(state: GameState){
        super();
        this.gameState = state;
        this.addChild(new Graphics().roundRect(
            -this.boardWidth/2,
            -this.boardLength/2,
            this.boardWidth,
            this.boardLength,
            15)
            .fill({ color: 0x693927 })
        )
        //init the board
        //stores will be at 6 and 13
        //player 1 is 0-6 
        //player 2 is 7-13
        //starts from bottom row to top row
        // const wBound = -this.boardWidth/2
        // const lBound = -this.boardLength/2
        let cumulPitWidth = (-this.boardWidth/2) + (2 * this.boardHorizontalBuffer) + this.pitSize;
        const row1Length = (this.boardLength/2) - this.boardVerticalBuffer - this.pitSize;
        const row2Length = -(this.boardLength/2) + this.boardVerticalBuffer;
        for (let i = 0; i < MancalaBoard.boardSize; i++) {
            const isStore = (i+1) % 7 == 0;
            const player = i < 7 ? 1: 2;

            const pit = new MancalaPit(
                i,
                player,
                this.pitSize,
                isStore ? this.storeLength : this.pitSize,
                cumulPitWidth,
                i < 6 ? row1Length : row2Length,
                isStore
            )

            this.board[i] = pit

            if (!isStore){
                pit.onTurnChange = (i) => {
                    this.buttonFunc(i)
                }

                if (player != this.gameState.currentPlayer) pit.disableButton();
            }

            this.addChild(pit)
           
            const movePos = this.pitSize + this.boardHorizontalBuffer;
            cumulPitWidth += i < 6 ? movePos : -movePos;
            
        }
    }

    buttonFunc = async (index: number) => {
        const playerGoAgain = await this.moveSeeds(index, this.gameState.currentPlayer)
        console.log(playerGoAgain);
        if (!this.checkEnd()){
            if (!playerGoAgain){
                this.nextTurn();
                this.onTurnChange?.(this.gameState.currentPlayer);
            }
            else {
                this.refreshButtons()
            }
        }
        else {
            this.onGameEnd?.(this.gameState.winnerPlayer);
        }
    }



    public getStoreStatus(player: number): number {
        return this.board[(player * 7) - 1].getSeedHeld();
    }

    private placeSeedInStore(player: number, seeds: number){
        this.board[(player * 7) - 1].addSeed(seeds);
    }

    //when a pit is selected, fill in the next pits by the number of seeds in the selected pit
    //wrap round to 0 after 13
    // player 1 skips 13th pit player 2 skips 6th pit
    public async moveSeeds(pitChosen: number, player: number): Promise<boolean> {
        let seeds = this.board[pitChosen].removeSeeds();
        let pitIndex = pitChosen;
        for (let i = 1; i < seeds+1; i++) {
            pitIndex += 1;
            if ((pitIndex == 13 && player == 1) || (pitIndex == 6 && player == 2)) pitIndex ++;
            pitIndex = pitIndex % MancalaBoard.boardSize;
            await waitFor(MancalaBoard.WAIT_DURATION);
            this.board[pitIndex].addSeed();
        }
       //check if player gets an extra turn
        if (this.board[pitIndex].isStore()){
            return true;
        }
       //check if last seed fell in empty pit
        //and if it belongs to the opponent
        const adjacentPitIndex = (-pitIndex + 12) % MancalaBoard.boardSize
        if (this.board[pitIndex].getSeedHeld() == 1 && this.board[adjacentPitIndex].player != player){
            //take all seeds in adjacent pit and put in player's store
            seeds = this.board[adjacentPitIndex].removeSeeds();
            if (seeds != 0) this.placeSeedInStore(player, seeds);   
        }
        return false;
    }

    //check if the pits on either end are empty
    //winner keeps all their seeds
    private checkEnd(): boolean {
        let player1PitScore = 0;
        let player2PitScore = 0;

        for (let i = 0; i < MancalaBoard.boardSize; i++) {
            if (i < 6) {player1PitScore += this.board[i].getSeedHeld()}
            else if (i > 6 && i < 13) {player2PitScore += this.board[i].getSeedHeld()} 
        }

        if (player1PitScore == 0){
            this.placeSeedInStore(2, player2PitScore);
            this.finishUpGame();
            return true;
        }
        if (player2PitScore == 0){
            this.placeSeedInStore(1, player1PitScore);
            this.finishUpGame();
            return true;
        }
        return false;
    }

    private finishUpGame() {
        //find winner
        const player1Score = this.board[6].getSeedHeld();
        const player2Score = this.board[13].getSeedHeld();
        if (player1Score > player2Score) this.gameState.winnerPlayer = 1;
        else if (player2Score > player1Score) this.gameState.winnerPlayer = 2;
        //else tie
        //remove all seeds so it makes sense visually
        this.board.forEach((pit) => {
            if (!pit.isStore()){pit.removeSeeds();}
        })
        this.disableAllButtons();
        this.gameState.gameActive = false;
        
    }

    private nextTurn(): void {
        //change to next player
        this.gameState.currentPlayer = this.gameState.currentPlayer == 1 ? 2 : 1;
        //handle buttons
        this.refreshButtons();
        this.gameState.turns++;
    }

    private refreshButtons(): void {
        for (let i = 0; i < MancalaBoard.boardSize; i++) {
            if (!this.board[i].isStore()){
                if (this.board[i].player == this.gameState.currentPlayer && this.board[i].getSeedHeld() != 0){
                    this.board[i].enableButton()
                }
                else {
                    this.board[i].disableButton()
                }
            }
        }
    }

    private disableAllButtons(): void {
        for (let i = 0; i < MancalaBoard.boardSize; i++) {
            if (!this.board[i].isStore){
                this.board[i].disableButton()
            }
        }
    }
}
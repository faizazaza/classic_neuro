import { MancalaPit } from "./MancalaPit";


export class MancalaBoard {
    //board of 6 x 2 pits and 2 capture pits
    private static readonly boardSize = 14;
    public board: MancalaPit[] = [];

    constructor(){
        //init the board
        //stores will be at 6 and 13
        //player 1 is 0-6 
        //player 2 is 7-13
        for (let i = 0; i < MancalaBoard.boardSize; i++) {
            this.board[i] = new MancalaPit(i < 7 ? 1: 2, (i+1) % 7 == 0)
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
    //
    public moveSeeds(pitChosen: number, player: number) {
       let seeds = this.board[pitChosen].removeSeeds();
       for (let i = 1; i < seeds+1; i++) {
            this.board[(pitChosen + 1) % MancalaBoard.boardSize].addSeed();
       }
       //check if last seed fell in empty pit
       const lastPit = (pitChosen + seeds) % MancalaBoard.boardSize;
       if (this.board[lastPit].getSeedHeld() == 1){
            //take all seeds in adjacent pit and put in player's store
            seeds = this.board[(-lastPit + 12) % MancalaBoard.boardSize].removeSeeds();
            this.placeSeedInStore(player, seeds)
       }
    }

    //check if the pits on either end are empty
    //winner keeps all their seeds
    public checkEnd(): number {
        let player1PitScore = 0;
        let player2PitScore = 0;

        for (let i = 0; i < MancalaBoard.boardSize; i++) {
            if (i < 6) {player1PitScore += this.board[i].getSeedHeld()}
            else if (i > 6 && i < 13) {player2PitScore += this.board[i].getSeedHeld()} 
        }

        if (player1PitScore == 0){
            this.placeSeedInStore(2, player2PitScore)
            return 1;
        }
        if (player2PitScore == 0){
            this.placeSeedInStore(1, player1PitScore)
            return 2;
        }
        return 0;
    }
}
import { Container, Graphics, GraphicsContext } from "pixi.js";
import { MancalaPit } from "./MancalaPit";
import { FancyButton } from "@pixi/ui";
import { waitFor } from "../../../engine/utils/waitFor";


export class MancalaBoard extends Container {
    //board of 6 x 2 pits and 2 capture pits
    private static readonly WAIT_DURATION = 0.25;

    private static readonly boardSize = 14;
    public board: MancalaPit[] = [];

    //TODO: should make it scale on screen size
    private boardWidth: number = 900;
    private boardVerticalBuffer: number = 50;
    private boardHorizontalBuffer: number = 20;
    private boardLength: number = this.boardWidth / 2;

    private pitSize = (this.boardWidth - (9 * this.boardHorizontalBuffer))/8;
    private storeLength = this.boardLength - (2 * this.boardVerticalBuffer);

    constructor(){
        super();
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
                player,
                this.pitSize,
                isStore ? this.storeLength : this.pitSize,
                isStore
            )

            this.board[i] = pit

            //button holds pitContainer
            const pitButton = new FancyButton({
                defaultView: (pit),
                animations: this.buttonAnimations,
            })
            pitButton.x = cumulPitWidth;
            pitButton.y = i < 6 ? row1Length : row2Length;

            pitButton.onPress.connect(async () => {
                await this.moveSeeds(i, 1)
            });

            this.addChild(pitButton);

            const movePos = this.pitSize + this.boardHorizontalBuffer;
            cumulPitWidth += i < 6 ? movePos : -movePos;
            
        }
    }

    private buttonAnimations = {
        hover: {
            props: { scale: { x: 1.04, y: 1.04 } },
            duration: 80,
        },
        pressed: {
            props: { scale: { x: 0.96, y: 0.96 } },
            duration: 80,
        },
    };

    public getStoreStatus(player: number): number {
        return this.board[(player * 7) - 1].getSeedHeld();
    }

    private placeSeedInStore(player: number, seeds: number){
        this.board[(player * 7) - 1].addSeed(seeds);
    }

    //when a pit is selected, fill in the next pits by the number of seeds in the selected pit
    //wrap round to 0 after 13
    //
    public async moveSeeds(pitChosen: number, player: number) {
       let seeds = this.board[pitChosen].removeSeeds();
       for (let i = 1; i < seeds+1; i++) {
            await waitFor(MancalaBoard.WAIT_DURATION);
            this.board[(pitChosen + i) % MancalaBoard.boardSize].addSeed();
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
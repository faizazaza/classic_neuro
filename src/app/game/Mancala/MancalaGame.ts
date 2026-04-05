import { MainScreen } from "../../screens/main/MainScreen";
import { MancalaBoard } from "./MancalaBoard";

export class MancalaGame {
    //handle turns and game loop
    public board: MancalaBoard;
    private gameActive = true;
    public turn = 0;

    public screen!: MainScreen;

    constructor(){
        this.board = new MancalaBoard;
        //might need a start button instead of making it instant
        //this.gameLoop();
    }

    //take turns with players
    //wait for ui input and then pass prompts to the board to move seeds
    //check completion after every action and then contine/end

    private gameLoop() {
        let playerTurn = 1;
        while (this.gameActive) {
            //
        }
    }

    public async show(screen: MainScreen): Promise<void> {
        this.screen = screen;
        this.screen.mainContainer.addChild(...this.board.getGraphic());
      }

}
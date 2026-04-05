import { Text } from "pixi.js";
import { randomBool } from "../../../engine/utils/random";
import { MainScreen } from "../../screens/main/MainScreen";
import { GameState } from "../GameState";
import { MancalaBoard } from "./MancalaBoard";
import { engine } from "../../getEngine";
import { ConfettiEmitter } from "../ConfettiEmitter";

export class MancalaGame {
    //handle turns and game loop
    private board: MancalaBoard;
    public screen!: MainScreen;
    private topText!: Text;
    private gameState: GameState;
    private confetti: ConfettiEmitter;

    constructor(){
        engine().ticker.autoStart = true;
        this.gameState = new GameState;
        this.gameState.currentPlayer = randomBool() ? 1 : 2;
        this.board = new MancalaBoard(this.gameState);

        this.board.onTurnChange = (player) => {
            this.updateTurnText(player);
        };

        this.board.onGameEnd = (winner) => {
            this.endGame(winner);
        };

        this.topText = new Text({
            text: `Player ${this.gameState.currentPlayer}'s Turn`,
            style: {
            fontSize: 50,
            fill: 0xffffff,
            padding: 0,
            fontWeight: '800',
            },
                x: 0,
                y: -300,
            anchor: 0.5,
        });

        this.confetti = new ConfettiEmitter();
    }

    updateTurnText = (player: number) => {
        this.topText.text = `Player ${player}'s Turn`;
    }

    endGame = (winner: number) => {
        this.topText.text = `Winner is Player ${winner}!`;
        for (let i = 0; i <= 5; i++) {
            const xVal = (-this.screen.width/2) + ((this.screen.width) / 5 * i)
            this.confetti.burst(xVal, -this.screen.height/2, 120);
        }
    }

    public async show(screen: MainScreen): Promise<void> {
        this.screen = screen;

        this.screen.mainContainer.addChild(this.board);

        //topText
        this.screen.mainContainer.addChild(this.topText);

        this.screen.mainContainer.addChild(this.confetti);
    }

}
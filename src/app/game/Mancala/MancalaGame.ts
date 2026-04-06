import { Text } from "pixi.js";
import { randomBool } from "../../../engine/utils/random";
import { MainScreen } from "../../screens/main/MainScreen";
import { GameState } from "../GameState";
import { MancalaBoard } from "./MancalaBoard";
import { engine } from "../../getEngine";
import { ConfettiEmitter } from "../ConfettiEmitter";
import { FancyButton } from "@pixi/ui";

export class MancalaGame {
    /** Assets bundles required by this screen */
    public static assetBundles = ["main"];
    //handle turns and game loop
    private board!: MancalaBoard;
    public screen!: MainScreen;
    private topText!: Text;
    private gameState!: GameState;
    private confetti: ConfettiEmitter;
    private restartButton: FancyButton;

    constructor(){
        engine().ticker.autoStart = true;
        this.initGame();

        this.confetti = new ConfettiEmitter();

        this.restartButton = new FancyButton({
            defaultView: "icon-replay.png",
            anchor: 0.5,
            scale: 1,
            animations: {
                hover: {
                    props: {
                        scale: { x: 1.1, y: 1.1 },
                    },
                    duration: 100,
                },
            },
        })
        this.restartButton.x = 0;
        this.restartButton.y = 300;

        this.restartButton.onPress.connect(() => {
            this.screen.mainContainer.removeChildren();
            this.initGame();
            this.drawGame();
        });
        // this.restartButton.visible = false;
        // this.restartButton.enabled = false;
    }

    private drawGame(){
        this.screen.mainContainer.addChild(this.board);
        //topText
        this.screen.mainContainer.addChild(this.topText);

        this.screen.mainContainer.addChild(this.restartButton);

        this.screen.mainContainer.addChild(this.confetti);
    }

    private initGame() {
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
        this.restartButton.visible = true;
        this.restartButton.enabled = true;
    }

    public async show(screen: MainScreen): Promise<void> {
        this.screen = screen;
        this.drawGame();
    }

}
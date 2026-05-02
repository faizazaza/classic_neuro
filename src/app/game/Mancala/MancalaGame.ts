import { Text } from "pixi.js";
import { randomBool } from "../../../engine/utils/random";
import { GameState } from "../../screens/main/GameState";
import { MancalaBoard } from "./MancalaBoard";
import { engine } from "../../getEngine";
import { ConfettiEmitter } from "../ConfettiEmitter";
import { FancyButton } from "@pixi/ui";
import { Game } from "../GameAbstract";

export class MancalaGame extends Game {

    public sendGameStatus(): string {
        throw new Error("Method not implemented.");
    }
    public sendActions(): string {
        throw new Error("Method not implemented.");
    }

    /** Assets bundles required by this screen */
    public static assetBundles = ["main"];
    //handle turns and game loop
    private board!: MancalaBoard;
    private topText!: Text;
    private gameState!: GameState;
    private confetti: ConfettiEmitter;
    private restartButton: FancyButton;
    private homeButton: FancyButton;

    private screenWidth: number;
    private screenHeight: number;

    public onHomePressed?: () => void;

    constructor(state: GameState, screenWidth: number, screenHeight: number){
        super();
        this.gameState = state;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        engine().ticker.autoStart = true;
        this.startGame();

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
        this.restartButton.x = 100;
        this.restartButton.y = 300;

        this.restartButton.onPress.connect(() => {
            this.removeChildren();
            this.startGame();
            this.drawGame();
        });

        this.homeButton = new FancyButton({
            defaultView: "icon-home.png",
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
        this.homeButton.x = -100;
        this.homeButton.y = 300;

        this.homeButton.onPress.connect(() => {
            this.onHomePressed?.()
        });

        this.drawGame();
    }

    private drawGame(){
        this.addChild(this.board);
        //topText
        this.addChild(this.topText);

        this.addChild(this.restartButton);

        this.restartButton.visible = false;
        this.restartButton.enabled = false;

        this.addChild(this.homeButton);

        this.homeButton.visible = false;
        this.homeButton.enabled = false;

        this.addChild(this.confetti);
    }

    public startGame() {
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
            fill: this.gameState.getCurrentPlayerColour(),
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
        this.topText.style.fill = this.gameState.getCurrentPlayerColour();
    }

    endGame = (winner: number) => {
        this.topText.style.fill = this.gameState.getPlayerColour(winner-1);
        this.topText.text = `Winner is Player ${winner}!`;
        for (let i = 0; i <= 5; i++) {
            const xVal = (-this.screenWidth/2) + ((this.screenWidth) / 5 * i)
            this.confetti.burst(xVal, -this.screenHeight/2, 120);
        }
        this.restartButton.visible = true;
        this.restartButton.enabled = true;

        this.homeButton.visible = true;
        this.homeButton.enabled = true;

        this.gameState.updateWins(winner)
    }

}
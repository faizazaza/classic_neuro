import { Container, Text } from "pixi.js";
import { randomBool } from "../../../engine/utils/random";
import { GameState } from "../GameState";
import { MancalaBoard } from "./MancalaBoard";
import { engine } from "../../getEngine";
import { ConfettiEmitter } from "../ConfettiEmitter";
import { FancyButton } from "@pixi/ui";

export class MancalaGame extends Container {
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

    constructor(screenWidth: number, screenHeight: number){
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
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
        this.restartButton.x = 100;
        this.restartButton.y = 300;

        this.restartButton.onPress.connect(() => {
            this.removeChildren();
            this.initGame();
            this.drawGame();
        });
        
        this.restartButton.visible = false;
        this.restartButton.enabled = false;

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
        
        this.homeButton.visible = false;
        this.homeButton.enabled = false;

        this.drawGame();
    }

    private drawGame(){
        this.addChild(this.board);
        //topText
        this.addChild(this.topText);

        this.addChild(this.restartButton);

        this.addChild(this.homeButton);

        this.addChild(this.confetti);
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
            const xVal = (-this.screenWidth/2) + ((this.screenWidth) / 5 * i)
            this.confetti.burst(xVal, -this.screenHeight/2, 120);
        }
        this.restartButton.visible = true;
        this.restartButton.enabled = true;

        this.homeButton.visible = true;
        this.homeButton.enabled = true;
    }

}
import { Text } from "pixi.js";
import { randomBool } from "../../../engine/utils/random";
import { GameState } from "../../screens/main/GameState";
import { MancalaBoard } from "./MancalaBoard";
import { engine } from "../../getEngine";
import { ConfettiEmitter } from "../ConfettiEmitter";
import { FancyButton } from "@pixi/ui";
import { Game } from "../GameAbstract";
import { ActionType, GameMsg, priorityEnum } from "../../types/ActionTypes";

export class MancalaGame extends Game {

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

    //should be overriden with method in SocketGameInterface
    public sendActionList: (actionList: ActionType[]) => GameMsg;
    public sendActionForce: (stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => GameMsg;
    public sendActionResult: (actionId: string, successVal: boolean, messageVal?: string) => GameMsg
    public unregisterAction: (actionList: string[]) => GameMsg

    constructor(state: GameState, screenWidth: number, screenHeight: number){
        super();
        this.gameState = state;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        engine().ticker.autoStart = true;

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

        //temp functions to start init <- these functions need to be overriden!
        this.sendActionList = () => {throw new Error("Method not implemented.");}
        this.sendActionForce = () => {throw new Error("Method not implemented.");}
        this.sendActionResult = () => {throw new Error("Method not implemented.");}
        this.unregisterAction = () => {throw new Error("Method not implemented.");}

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

        this.drawGame();

        //test overrides
        // this.sendActionList([]);
        // this.sendActionForce("", "", [], priorityEnum.low);
        // this.sendActionResult("", false);
        // this.unregisterAction([]);
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


    public collectGameStatus(): string {
        //send a string of board status, how the game works, which pits belong to the player, what player number they are
        throw new Error("Method not implemented.");
    }

    public collectActionList(): ActionType[] {
        //1 action with payload of pit index/ 6 actions for each pit and then unregister when empty?
        throw new Error("Method not implemented.");
    }

    //parse data sent by socketPlayer
    // if correct, run the action
    //if correct, throw error ? or just call sendActionResult with success = false
    public handleAction(playerId: number, actionId: number, actionName: string, data: string): void {
        throw new Error("Method not implemented.");
    }

}
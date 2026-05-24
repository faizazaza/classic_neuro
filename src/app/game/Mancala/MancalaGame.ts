import { Text } from "pixi.js";
import { GameState } from "../../screens/main/GameState";
import { MancalaBoard } from "./MancalaBoard";
import { engine } from "../../getEngine";
import { ConfettiEmitter } from "../ConfettiEmitter";
import { FancyButton } from "@pixi/ui";
import { Game } from "../GameAbstract";
import { ActionType, CommandEnum, GameMsg, priorityEnum, ServerMsg } from "../../types/ActionTypes";
import { MancalaActions, mancalaSocketTexts, pickPitAction, pickResponseSchema } from "./MancalaActions";
import { GameList } from "../../ui/GameList";

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
    public sendGameContext: (playerId: number, message: string, isSilent: boolean) => void;
    public sendActionList: (playerId: number, actionList: ActionType[]) => void;
    public sendActionForce: (playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => void;
    public sendActionResult: (playerId: number, actionId: string, successVal: boolean, messageVal?: string) => void
    public unregisterAction: (playerId: number, actionList: string[]) => void

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
            this.gameState.gameEnd();
            this.onHomePressed?.()
        });

        //temp functions to start init <- these functions need to be overriden!
        this.sendGameContext = () => {throw new Error("Method not implemented.");}
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
        this.gameState.randomPlayerAssign();

        //send action list for socket players first
        for (let i = 1; i < 3; i++) {
            if (this.gameState.getIsSocketPlayer(i)){
                this.sendActionList(
                    i,
                    [pickPitAction]
                )
            } 
        }

        this.board = new MancalaBoard(this.gameState, this.sendActionForce, this.sendGameContext);

        this.board.onTurnChange = (player) => {
            this.updateTurnText(player);
        };

        this.board.onGameEnd = (winner) => {
            this.endGame(winner);
        };

        this.board.sendActionResult = this.sendActionResult;

        this.topText = new Text({
            text: `Player ${this.gameState.getCurrentPlayer()}'s Turn`,
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

        this.gameState.updateWinner(winner)

        for (let i = 1; i < 3; i++) {
            if (this.gameState.getIsSocketPlayer(i)){
                this.unregisterAction(1, [MancalaActions.pick_pit])
            } 
        }

    }

    //parse data sent by socketPlayer
    // if correct, run the action
    //if theres an issue, return an error
    public handleAction(msg: ServerMsg, playerId: number, playerName: string): GameMsg | null {
        //should be right player action here, check if it is an actual action, 
        //return a returnType <- also needs to update opponent with context if an update is made (in this function??)
        if (msg.data.name in MancalaActions){   //theres like only one but it sets precedent or whatever
            //should have a switch case here, but theres only one action in this game
            //check if inavlid schema, oob/not a number, or if pit is empty
            const parseResult = pickResponseSchema.safeParse(JSON.parse(msg.data.data ?? ""));
                        
            if (!parseResult.success){
                return this.buildResultMsg(msg.data.id, false, mancalaSocketTexts.errorInvalidSchema(msg.data.name))
            }
            const pit = parseResult.data.pit
            if (pit > 13 || pit < 0){
                return this.buildResultMsg(msg.data.id, false, mancalaSocketTexts.errorInvalidPit(pit))
            }
            const pitOwner = pit < 7 ? 1 : 2;
            if (pitOwner != this.gameState.getCurrentPlayer()){
                return this.buildResultMsg(msg.data.id, false, mancalaSocketTexts.errorOOB(pit))
            }
            if (this.board.isPitEmpty(pit)){
                return this.buildResultMsg(msg.data.id, false, mancalaSocketTexts.errorEmpty(pit))
            }
            //when the player needs to do another turn, both an action result success and action force needs to be sent
            //i could just send a failed action to force another try but that seems mean
            this.board.socketMoveSeeds(pit, msg, playerId)
            return null;
        }
        else {
            //non-existant action / not a mancala action
            return this.buildResultMsg(msg.data.id, false, mancalaSocketTexts.errorInvalidAction());
        }
    }

    public getWrongPlayerErr(msg: ServerMsg): GameMsg {
        return this.buildResultMsg(msg.data.id, false, mancalaSocketTexts.errorTurn());
    }

    private buildResultMsg(actionId: string, success: boolean, message: string): GameMsg {
        const gameMsg: GameMsg = {
            command: CommandEnum.result,
            game: GameList.Mancala, //hmm? or just project name in general?
            data: {
                id: actionId,
                success: success,
                message: message
            }
        }
        return gameMsg;
    }

}
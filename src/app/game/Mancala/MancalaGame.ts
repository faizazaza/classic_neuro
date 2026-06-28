import { Text } from "pixi.js";
import { GameState } from "../../screens/main/GameState";
import { MancalaBoard } from "./MancalaBoard";
import { engine } from "../../getEngine";
import { Game } from "../GameAbstract";
import { ActionType, GameMsg, priorityEnum, ServerMsg } from "../../types/ActionTypes";
import { MancalaActions, mancalaSocketTexts, pickPitAction, pickResponseSchema } from "./MancalaActions";
import { GameList } from "../GameList";
import { buildResultMsg } from "../gameUtils/actionUtil";

export class MancalaGame extends Game {

    /** Assets bundles required by this screen */
    public static assetBundles = ["main"];
    //handle turns and game loop
    private board!: MancalaBoard;
    private topText!: Text;
    private gameState: GameState;

    //should be overriden with method in SocketGameInterface
    public cascadeGameEnd: (winner: number) => void;
    public sendGameContext: (playerId: number, message: string, isSilent: boolean) => void;
    public sendActionList: (playerId: number, actionList: ActionType[]) => void;
    public sendActionForce: (playerId: number, stateVal: string, queryVal: string, actionList: string[], priorityVal: priorityEnum) => void;
    public sendActionResult: (playerId: number, actionId: string, successVal: boolean, messageVal?: string) => void
    public unregisterAction: (playerId: number, actionList: string[]) => void

    constructor(gameType: GameList, state: GameState){
        super(gameType);
        this.gameState = state;
        engine().ticker.autoStart = true;

        //temp functions to start in(n)it <- these functions need to be overriden!
        this.cascadeGameEnd = () => {throw new Error("Method not implemented.");}
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
        //bottom text                       (there is no botton text)
    }

    public startGame() {
        this.removeChildren();
        this.gameOver = false;

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

        this.board.onTurnChange = () => {
            this.updateTurnText();
        };

        this.board.onGameEnd = (winner) => {
            this.endGame(winner);
        };

        this.board.sendActionResult = this.sendActionResult;

        this.topText = new Text({
            text: `${this.gameState.getCurrentPlayerName()}'s Turn`,
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


    updateTurnText = () => {
        this.topText.text = `${this.gameState.getCurrentPlayerName()}'s Turn`;
        this.topText.style.fill = this.gameState.getCurrentPlayerColour();
    }

    endGame = (winner: number) => {
        this.gameOver = true;
        this.topText.style.fill = this.gameState.getPlayerColour(winner);
        this.topText.text = `Winner is ${this.gameState.getPlayerName(winner)}!`;

        for (let i = 1; i < 3; i++) {
            if (this.gameState.getIsSocketPlayer(i)){

                if (i == winner){
                    this.sendGameContext(
                        i, 
                        mancalaSocketTexts.win(this.board.getStoreStatus(i), this.board.getStoreStatus(3-i)),
                        false
                    )
                }
                else {
                    this.sendGameContext(
                        i, 
                        mancalaSocketTexts.lose(this.board.getStoreStatus(i), this.board.getStoreStatus(3-i)),
                        false
                    )
                }

                this.unregisterAction(i, [MancalaActions.pick_pit])
            } 
        }

        //call function assigned from Game Interface for game menu actions
        this.cascadeGameEnd(winner);

    }

    //parse data sent by socketPlayer
    // if correct, run the action
    //if theres an issue, return an error
    public handleAction(msg: ServerMsg, playerId: number): GameMsg | null {
        //should be right player action here, check if it is an actual action, 
        //return a returnType <- also needs to update opponent with context if an update is made (in this function??)
        if (msg.data.name in MancalaActions){   //theres like only one but it sets precedent or whatever
            //should have a switch case here, but theres only one action in this game
            //check if inavlid schema, oob/not a number, or if pit is empty
            const parseResult = pickResponseSchema.safeParse(JSON.parse(msg.data.data ?? ""));
                        
            if (!parseResult.success){
                return buildResultMsg(GameList.Mancala, msg.data.id, false, mancalaSocketTexts.errorInvalidSchema(msg.data.name))
            }
            const pit = parseResult.data.pit
            if (pit >= 13 || pit <= 0){
                return buildResultMsg(GameList.Mancala, msg.data.id, false, mancalaSocketTexts.errorInvalidPit(pit))
            }
            const pitOwner = pit < 7 ? 1 : 2;
            if (pitOwner != this.gameState.getCurrentPlayer()){
                return buildResultMsg(GameList.Mancala, msg.data.id, false, mancalaSocketTexts.errorOOB(pit))
            }
            if (this.board.isPitEmpty(pit)){
                return buildResultMsg(GameList.Mancala, msg.data.id, false, mancalaSocketTexts.errorEmpty(pit))
            }
            //when the player needs to do another turn, both an action result success and action force needs to be sent
            //i could just send a failed action to force another try but that seems mean
            this.board.socketMoveSeeds(pit, msg, playerId)
            return null;
        }
        else {
            //non-existant action / not a mancala action
            return buildResultMsg(GameList.Mancala, msg.data.id, false, mancalaSocketTexts.errorInvalidAction());
        }
    }

}
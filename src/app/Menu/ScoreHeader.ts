import { Text } from "pixi.js";
import { Container } from "pixi.js";
import { GameState } from "../screens/main/GameState";

export class ScoreHeader extends Container {
        
    private gameState: GameState;

    private gap = 100;

    private player1Score: Text;
    private player1Text: Text;
    private player2Score: Text;
    private player2Text: Text;
    
    constructor(gameState: GameState){
        super()
        this.gameState = gameState;

        this.player1Score = new Text({
            text: `temp`,
            style: {
                fontSize: 30,
                fill: "AE2448",
                padding: 0,            
                fontWeight: '800',
            },
        })

        this.player1Text = new Text({
            text: `temp`,
            style: {
                fontSize: 30,
                fill: "AE2448",
                padding: 0,            
                fontWeight: '800',
            },
        });

        this.player2Score = new Text({
            text: `temp`,
            style: {
                fontSize: 30,
                fill: "72BAA9",
                padding: 0,            
                fontWeight: '800',
            },
        })

        this.player2Text = new Text({
            text: `temp`,
            style: {
                fontSize: 30,
                fill: "72BAA9",
                padding: 0,            
                fontWeight: '800',
            },
        });

        this.drawHeader()
    }

    private drawHeader = () => {
        //update positions
        this.player1Text.x = -this.gap*3;
        this.player1Score.x = -this.gap;
        this.player2Score.x = this.gap;
        this.player2Text.x = this.gap*2;

        this.addChild(this.player1Text)
        this.addChild(this.player1Score)
        this.addChild(this.player2Text)
        this.addChild(this.player2Score)
    };

    public updateHeader = () => {
        this.player1Text.text = this.gameState.getPlayerName(1);
        this.player1Text.style.fill = this.gameState.getPlayerColour(1);

        this.player1Score.text = this.gameState.getPlayerWins(1);
        this.player1Score.style.fill = this.gameState.getPlayerColour(1);


        this.player2Text.text = this.gameState.getPlayerName(2);
        this.player2Text.style.fill = this.gameState.getPlayerColour(2);

        this.player2Score.text = this.gameState.getPlayerWins(2);
        this.player2Score.style.fill = this.gameState.getPlayerColour(2);
    }

}
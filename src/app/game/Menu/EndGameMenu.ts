import { Container } from "pixi.js";
import { ConfettiEmitter } from "../ConfettiEmitter";
import { FancyButton } from "@pixi/ui";

export class EndGameMenu extends Container {

    private confetti: ConfettiEmitter;
    private restartButton: FancyButton;
    private homeButton: FancyButton;

    private screenWidth: number;
    private screenHeight: number;

    private onHomePressed: () => void;
    private onRetryPressed: () => void;

    private showGameArray: () => void;

    constructor(
        screenWidth: number, 
        screenHeight: number,
        showGameArray: () => void
    ){
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.showGameArray = showGameArray;

        this.onHomePressed = () => {throw new Error("Method not implemented.");}
        this.onRetryPressed = () => {throw new Error("Method not implemented.");}
        
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
            this.onRetryPressed();
            this.hideMenu();
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
            this.onHomePressed();
            this.hideMenu();
        });

        this.addChild(this.restartButton);

        this.restartButton.visible = false;
        this.restartButton.enabled = false;

        this.addChild(this.homeButton);

        this.homeButton.visible = false;
        this.homeButton.enabled = false;

        this.addChild(this.confetti);

    }

    public setButtonFuctions (
        onHomePressed: () => void,
        onRetryPressed: () => void
    ){
        this.onHomePressed = () => {onHomePressed(); this.showGameArray()};
        this.onRetryPressed = onRetryPressed;
    }

    public showMenu(){
        for (let i = 0; i <= 5; i++) {
            const xVal = (-this.screenWidth/2) + ((this.screenWidth) / 5 * i)
            this.confetti.burst(xVal, -this.screenHeight/2, 120);
        }
        this.restartButton.visible = true;
        this.restartButton.enabled = true;

        this.homeButton.visible = true;
        this.homeButton.enabled = true;
    }

    public hideMenu(){

    }

}
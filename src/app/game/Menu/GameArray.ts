import { FancyButton } from "@pixi/ui";
import { Container, Graphics, Text } from "pixi.js";
import { GameList } from "../GameList";

export class GameArray extends Container {
    private readonly iconSideLength = 200;
    private readonly rowNum = 3;
    private iconBuffer: number;

    private readonly containerSideLength: number = 800;

    private gameArray: Container[] = [];

    public onGameSelect: (game: GameList) => void;

    constructor(
        onGameSelect: (game: GameList) => void
    ){
        super()
        this.onGameSelect = onGameSelect;
        this.iconBuffer = (this.containerSideLength - (this.rowNum * this.iconSideLength)) / (this.rowNum + 1)
        
        let counter = 0;
        for (const [key, value] of Object.entries(GameList)) {

            const iconContainer = new Container;
            iconContainer.x = (-this.containerSideLength/2) + this.iconBuffer + counter * (this.iconBuffer + this.iconSideLength);

            const icon = new Graphics().roundRect(
                0,
                0,
                this.iconSideLength,
                this.iconSideLength,
                15)
                .fill({ color: 0x693927 })

            const gameButton = new FancyButton({
                defaultView: icon,
                anchor: 0.5,
                scale: 1,
                animations: {
                    hover: {
                        props: {
                            scale: { x: 1.1, y: 1.1 },
                        },
                        duration: 100,
                    },
                    pressed: {
                        props: { scale: { x: 0.96, y: 0.96 } },
                        duration: 80,
                    },
                },
            })
            // this.restartButton.x = 0;
            // this.restartButton.y = 300;
    
            gameButton.onPress.connect(() => {
                this.onGameSelect(value)
            });

            iconContainer.addChild(gameButton);

            const iconText = new Text({
                text: `${value}`,
                style: {
                fontSize: 30,
                fill: 0xffffff,
                padding: 0,
                fontWeight: '800',
                },
                    x: 0,
                    y: 0,
                anchor: 0.5,
            });

            iconContainer.addChild(iconText);

            this.gameArray[counter] = iconContainer;
            this.addChild(iconContainer);
            counter++;
        }

    }
}
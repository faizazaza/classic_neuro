import { FancyButton, List } from "@pixi/ui";
import { Container, Graphics, Text } from "pixi.js";
import { GameList, GameListColour } from "../game/GameList";

export class GameArray extends Container {
    private readonly iconSideLength = 200;

    private layout: List;

    public onGameSelect: (game: GameList) => void;

    constructor(
        onGameSelect: (game: GameList) => void
    ){
        super()
        this.onGameSelect = onGameSelect;
        
        this.layout = new List({
            elementsMargin: 50,
            maxWidth: (this.iconSideLength * 10),
            maxHeight: (this.iconSideLength * 4),
            horPadding: (this.iconSideLength),
            vertPadding: (this.iconSideLength),
        })

        this.layout.x = - (this.iconSideLength * 1.5);
        this.layout.y = - (this.iconSideLength * 1.5);


        for (const value of Object.values(GameList)) {

            const icon = this.createGameButton(value);

            this.layout.addChild(icon);
        }

        this.addChild(this.layout)

    }


    private createGameButton = (game: GameList): Container => {
        const iconContainer = new Container;
        //iconContainer.x = (-this.containerSideLength/2) + this.iconBuffer + counter * (this.iconBuffer + this.iconSideLength);

        const gameColour = GameListColour[game];

        const icon = new Graphics().roundRect(
            0,
            0,
            this.iconSideLength,
            this.iconSideLength,
            15)
            .fill({ color: gameColour })

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
            this.onGameSelect(game)
        });

        iconContainer.addChild(gameButton);

        const iconText = new Text({
            text: `${game}`,
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

        return iconContainer

    }
}
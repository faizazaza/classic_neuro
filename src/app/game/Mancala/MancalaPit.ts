import { Container, Graphics, Text } from "pixi.js";
import { engine } from "../../getEngine";
import { FancyButton } from "@pixi/ui";

export class MancalaPit extends Container {

    private index: number;
    public store: boolean;
    private seedHeld: number;
    public selectable;
    public player: number;

    private pitButton!: FancyButton;
    private seedText!: Text;
    
    private pitWidth: number;
    private pitLength: number;

    public onTurnChange?: (index: number) => void;

    constructor(index: number, player: number, pitWidth: number, pitLength: number, posX: number, posY: number, isStore = false){
        super()
        this.index = index;
        this.player = player;
        this.pitWidth = pitWidth;
        this.pitLength = pitLength;
        if (isStore){
            this.store = true;
            this.seedHeld = 0;
            this.selectable = false;
        }
        else {
            this.store = false;
            this.seedHeld = 4;
            this.selectable = true;
        }
        this.setUpGraphics(posX, posY);
    
    }

    public removeSeeds(): number {
        const seeds = this.seedHeld;
        this.seedHeld = 0;
        this.seedText.text = 0;
        return seeds;
    }

    public addSeed(plusSeed = 1): void {
        this.seedHeld += plusSeed;
        this.seedText.text = this.seedHeld
        this.animateText(this.seedText)
    }

    public getSeedHeld(): number {
        return this.seedHeld;
    }

    public setUpGraphics(posX: number, posY: number): void {

        const holder = new Container();
        holder.x = posX;
        holder.y = posY;


        const pit = new Graphics().roundRect(
            0,
            0,
            this.pitWidth,
            this.pitLength,
            15)
            .fill(this.player == 1 ? { color: 0x452519 } : { color: 0x782304 }
        )

        if (!this.store){
            this.pitButton = new FancyButton({
                defaultView: (pit),
                animations: {
                    hover: {
                        props: { scale: { x: 1.04, y: 1.04 } },
                        duration: 80,
                    },
                    pressed: {
                        props: { scale: { x: 0.96, y: 0.96 } },
                        duration: 80,
                    },
                },
            })
            this.pitButton.x = 0;
            this.pitButton.y = 0;


            this.pitButton.onPress.connect(async () => {
                this.onTurnChange?.(this.index)
            });

            holder.addChild(this.pitButton);
        }
        else {
            holder.addChild(pit)
        }

        this.addChild(holder);

        this.seedText = new Text({
            text: this.seedHeld,
            style: {
            fontSize: 20,
            fill: 0xffffff,
            padding: 0,
            fontWeight: '800',
            },
                x: posX + (this.pitWidth / 2),
                y: posY + (this.pitLength / 2),
            anchor: 0.5,
        });

        this.addChild(this.seedText)
    }

    public isStore(): boolean{
        return this.store;
    }

    public isEnabled(): boolean{
        return this.pitButton.enabled;
    }

    public enableButton(){
        this.pitButton.enabled = true;
    }

    public disableButton(){
        this.pitButton.enabled = false;
    }

    private animateText(text: Text) {
        let life = 60;

        const tickerFunc = () => {
            text.scale.x += 0.01;
            text.scale.y += 0.01;

            life--;
            if (life <= 0) {
                engine().ticker.remove(tickerFunc);
                text.scale.x = 1;
                text.scale.y = 1;
            }
        };

        engine().ticker.add(tickerFunc);
    }
}

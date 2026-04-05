import { Container, Graphics, Text } from "pixi.js";

export class MancalaPit extends Container {

    public store: boolean = false;
    private seedHeld: number = 4;
    public selectable = true;
    public player: number = 1;

    private seedText!: Text;
    
    private pitWidth: number = 50;
    private pitLength: number = 50;

    constructor(player: number, pitWidth: number, pitLength: number, isStore = false){
        super()
        this.player = player;
        this.pitWidth = pitWidth;
        this.pitLength = pitLength;
        if (isStore){
            this.store = true;
            this.seedHeld = 0;
            this.selectable = false;
        }
        this.setUpGraphics();
    
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
    }

    public getSeedHeld(): number {
        return this.seedHeld;
    }

    public setUpGraphics(): void {

        this.addChild(new Graphics().roundRect(
            0,
            0,
            this.pitWidth,
            this.pitLength,
            15)
            .fill(this.player == 1 ? { color: 0x452519 } : { color: 0x782304 })
        )

        this.seedText = new Text({
            text: this.seedHeld,
            style: {
            fontSize: 20,
            fill: 0xffffff,
            padding: 0,
            fontWeight: '800',
            },
                x: this.pitWidth / 2,
                y: this.pitLength / 2,
            anchor: 0.5,
        });

        this.addChild(this.seedText)
    }

}
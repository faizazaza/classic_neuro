import { Graphics, GraphicsContext } from "pixi.js";

export class MancalaPit {

    public store: boolean = false;
    private seedHeld: number = 4;
    public selectable = true;
    public player: number = 1;
    
    private pitWidth: number = 50;
    private pitLength: number = 50;

    private posX: number = 0;
    private posY: number = 0;

    constructor(player: number, pitWidth: number, pitLength: number, posX: number, posyY: number, isStore = false){
        this.player = player;
        this.pitWidth = pitWidth;
        this.pitLength = pitLength;
        this.posX = posX;
        this.posY = posyY;
        if (isStore){
            this.store = true;
            this.seedHeld = 0;
            this.selectable = false;
        }
    }

    public removeSeeds(): number {
        const seeds = this.seedHeld;
        this.seedHeld = 0;
        return seeds;
    }

    public addSeed(plusSeed = 1): void {
        this.seedHeld += plusSeed;
    }

    public getSeedHeld(): number {
        return this.seedHeld;
    }

    public getGraphic(): Graphics {
        //blueprint
        const context = new GraphicsContext().roundRect(
            this.posX,
            this.posY,
            this.pitWidth,
            this.pitLength,
            15)
            .fill(this.player == 1 ? { color: 0x452519 } : { color: 0x782304 })

        return new Graphics(context);
    }

}
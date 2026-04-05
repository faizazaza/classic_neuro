
export class MancalaPit {

    public store: boolean = false;
    private seedHeld: number = 4;
    public selectable = true;
    public player: number = 1;

    constructor(player: number, isStore = false){
        if (isStore){
            this.store = true;
            this.seedHeld = 0;
            this.selectable = false;
            this.player = player;
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

}
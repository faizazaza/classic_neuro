import { Container, Graphics, Text } from "pixi.js";
import { CellVals } from "./TicTacToeTypes";
import { FancyButton } from "@pixi/ui";

export class TicTacToeCell extends Container {

    private cellIndex: number;
    private cellVal: CellVals;
    private cellSide: number;

    private onCellSelect: (index: number) => void;
    
    private cell: Container;
    private cellButton: FancyButton;
    private cellText: Text;

    constructor(cellIndex: number, cellSide: number, onCellSelect: (index: number) => void){
        super()
        this.cellIndex = cellIndex;
        this.cellVal = null;
        this.cellSide = cellSide;
        this.onCellSelect = onCellSelect;

        this.cell = new Container();
        const cellBg = new Graphics().roundRect(
            0,
            0,
            this.cellSide,
            this.cellSide,
            15)
            .stroke({ width: 10, color: 0x2b2a29 })
            .fill({ color: 0x4d4a49 })

        this.cellButton = new FancyButton({
            defaultView: (cellBg),
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

        this.cellButton.onPress.connect(() => {
            this.onCellSelect(this.cellIndex);
        })
        
        this.cellText = new Text({
            text: this.cellVal ?? "",  //test
            style: {
                fontSize: 80,
                fill: 0xffffff,
                padding: 0,
                fontWeight: '800',
            },
        });

        //dont ask me why ive got these numbers
        //science cannot explain this one
        this.cellText.x = cellBg.width / 3.5;
        this.cellText.y = cellBg.height / 5;

        this.cell.addChild(this.cellButton);
        this.cell.addChild(this.cellText);

        this.addChild(this.cell);
    }

    public selectCell = (val: CellVals, colour: string) => {
        this.cellVal = val;
        this.cellText.text = val?.toString() ?? "";
        this.cellText.style.fill = colour;
        this.cellButton.enabled = false;
    }

    public getCellVal = () => {
        return this.cellVal;
    }

    public disableCell = () => {
        this.cellButton.enabled = false;
    }
}
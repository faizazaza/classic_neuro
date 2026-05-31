import { Container } from "pixi.js";
import { ActionType, priorityEnum, ServerMsg, GameMsg } from "../../types/ActionTypes";
import { GameList } from "../GameList";
import { GameArray } from "./GameArray";

export class GameMenu extends Container {

    private gameArray: GameArray;

    public onGameSelect: (game: GameList) => void

    constructor(
        onGameSelect: (game: GameList) => void
    ){
        super()
        this.onGameSelect = onGameSelect;
        this.gameArray = new GameArray(this.onGameSelect);
        
    }
    
}
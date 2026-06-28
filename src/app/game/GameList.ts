import z from "zod";

export enum GameList {
    Mancala = "Mancala",
    TicTacToe = "TicTacToe"
}

export const GameListEnum = z.enum(GameList);

export const GameListColour: Record<GameList, string> = {
    Mancala: "0xeb6434",
    TicTacToe: "0x52700a",
}
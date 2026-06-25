import z from "zod";

export enum GameList {
    Mancala = "Mancala",
    TicTacToe = "TicTacToe"
}

export const GameListEnum = z.enum(GameList);
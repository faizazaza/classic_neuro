import z from "zod";

export enum GameList {
    Mancala = "Mancala"
}

export const GameListEnum = z.enum(GameList);
# A Collection of Mini Browser Game Integrations

## What is this?
A small collection of games designed to be playable alongside LLM agents using the [neuro-sdk](https://github.com/VedalAI/neuro-sdk) (Referred to as Socket Players). This is a TS based project that uses Pixi.js and Vite.


This project aims to support the following player setups (2 Players):
- Mouse vs Mouse
- Mouse vs Socket ...and vice versa.
- Socket vs Socket

Tested with 2 Instances of [neuro-api-tony](https://github.com/Pasu4/neuro-api-tony)

## Current Games
- Mancala
- Tic Tac Toe

## How can I use this?
After cloning the project, create a new .env file and input the following information:

```
VITE_SOCKET_ONE="ws://localhost:8000"
VITE_SOCKET_TWO="ws://localhost:8001"
```
This is assuming the LLM agents **each have their own separate Websockets** available.

If you would like to use Mouse players instead, replace any of the the URLs above with `""`

Afterwards, complete the following steps:
1. Go to the root directory (classic_neuro) 
2. Run `npm run install`
3. Run `start_build`

(You could also run `npm run start` for dev mode, they behave the same)

(The base code is from some pixi.js tutorial that I left most of untouched. It came with music, but you can mute that in the settings menu in the top right)


## Want to add more games?
Firstly, good luck to you! I tried to add a bit more abstraction and modulation to make it easy(ish) to add in new games but it's still rough in a few places.

I've got some template classes for _Actions and _Game - in the future I may make one for _Board as well.

Tic Tac Toe is a fairly simple game to understand how things work and come together so that might also be a good starting point.

To add a Game you need the following things:
- A new entry in [GameList.ts](./src/app/game/GameList.ts) (and a colour!)
- A new case for [MainScreen's](./src/app/screens/main/MainScreen.ts) setGame()
- A new folder under [/game](./src/app/game/)
- A new class that extends the [Game](./src//app/game/GameAbstract.ts) class
- Socket texts, an Action list, Action Types and Schemas


## Disclaimer

The project was initially just a Mancala web-game and the rest was an afterthought - this is very visible in the code structure, so keep that in mind! 😊
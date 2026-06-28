import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { PlayerPopup } from "../../popups/PlayerPopup";

import { MancalaGame } from "../../game/Mancala/MancalaGame";
import { GameList } from "../../game/GameList";
import { GameState } from "./GameState";
import { SocketGameInterface } from "../../websocket/SocketGameInterface";
import { GameMenu } from "../../Menu/GameMenu";
import { EndGameMenu } from "../../Menu/EndGameMenu";
import { Game } from "../../game/GameAbstract";
import { ScoreHeader } from "../../Menu/ScoreHeader";
import { TicTacToeGame } from "../../game/TicTacToe/TicTacToeGame";

/** The screen that holds the app */
export class MainScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["main"];

  private gameState: GameState;
  private gameInterface: SocketGameInterface;
  private gameMenu: GameMenu;
  private endGameMenu: EndGameMenu;
  private scoreHeader: ScoreHeader;

  public mainContainer: Container;
  // private pauseButton: FancyButton;
  private settingsButton: FancyButton;

  private playerButton: FancyButton;


  private paused = false;

  constructor() {
    super();

    this.gameState = new GameState
    this.scoreHeader = new ScoreHeader(this.gameState);
    this.gameMenu = new GameMenu(this.gameState, this.setGame, this.scoreHeader.updateHeader)
    this.endGameMenu = new EndGameMenu(screen.width, screen.height, this.showGameArray)
    this.gameInterface = new SocketGameInterface(this.gameState, this.gameMenu, this.endGameMenu, this.scoreHeader.updateHeader)

    this.scoreHeader.updateHeader();
    this.addChild(this.scoreHeader);
    

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    const buttonAnimations = {
      hover: {
        props: {
          scale: { x: 1.1, y: 1.1 },
        },
        duration: 100,
      },
      pressed: {
        props: {
          scale: { x: 0.9, y: 0.9 },
        },
        duration: 100,
      },
    };
    // this.pauseButton = new FancyButton({
    //   defaultView: "icon-pause.png",
    //   anchor: 0.5,
    //   animations: buttonAnimations,
    // });
    // this.pauseButton.onPress.connect(() =>
    //   engine().navigation.presentPopup(PausePopup),
    // );
    // this.addChild(this.pauseButton);

    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.addChild(this.settingsButton);

    this.playerButton = new FancyButton({
      defaultView: "player-edit.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.playerButton.onPress.connect(() => {
      const popup = new PlayerPopup(this.gameState, this.scoreHeader.updateHeader)
      engine().navigation.presentPopupGivenApp(popup)
    });
    this.addChild(this.playerButton);

    this.mainContainer.addChild(this.gameMenu)
  }


  /** Prepare the screen just before showing */
  public prepare() {}

  /** Update the screen */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(_time: Ticker) {
    if (this.paused) return;
    //this.bouncer.update();
  }

  /** Pause gameplay - automatically fired when a popup is presented */
  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
  }

  /** Resume gameplay */
  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
  }

  /** Fully reset */
  public reset() {
    this.mainContainer.removeChildren();
  }

  /** Resize the screen, fired whenever window size changes */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.scoreHeader.x = centerX;
    this.scoreHeader.y = 20;
    this.mainContainer.x = centerX;
    this.mainContainer.y = centerY;
    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;
    this.playerButton.x = 30;
    this.playerButton.y = 30;
  }

  /** Show screen with animations */
  public async show(): Promise<void> {
    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    const elementsToAnimate = [
      this.settingsButton,
      this.playerButton,
    ];

    let finalPromise!: AnimationPlaybackControls;
    for (const element of elementsToAnimate) {
      element.alpha = 0;
      finalPromise = animate(
        element,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
    //this.bouncer.show(this);
  }

  /** Hide screen with animations */
  public async hide() {}

  // /** Auto pause the app when window go out of focus */
  // public blur() {
  //   if (!engine().navigation.currentPopup) {
  //     engine().navigation.presentPopup(PausePopup);
  //   }
  // }

  setGame = (selectedGame: GameList) => {
    this.gameState.newGame(selectedGame);
    let game: Game | null  = null;

    switch (selectedGame) {
      case GameList.Mancala:
        game = new MancalaGame(GameList.Mancala, this.gameState);
        break;

      case GameList.TicTacToe:
        game = new TicTacToeGame(GameList.TicTacToe, this.gameState);
        break;
    
      default:
        break;
    }

    if (game == null){console.log("ERROR! game is null"); return}

    this.reset();
    this.mainContainer.addChild(game);
    this.mainContainer.addChild(this.endGameMenu);
    this.gameInterface.startGame(game);
  }

  showGameArray = () => {
    this.gameInterface.exitGame();
    this.reset();
    this.mainContainer.addChild(this.gameMenu);
  }
}

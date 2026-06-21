import { Input, List } from "@pixi/ui";
import { animate } from "motion";
import { Graphics, Text } from "pixi.js";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { GameState } from "../screens/main/GameState";

/** Popup for volume */
export class PlayerPopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The popup title label */
  private title: Text;
  /** Button that closes the popup */
  private doneButton: Button;
  /** The panel background */
  private panelBase: RoundedBox;
  /** The build version label */
  private versionLabel: Text;
  /** Layout that organises the UI components */
  private layout: List;

  private gameState: GameState;
  public onPlayerAttrChange: () => void;

  private _1nameInput: Input;
  private _1colourInput: Input;

  private _2nameInput: Input;
  private _2colourInput: Input;

  constructor(gameState: GameState, onPlayerAttrChange: () => void) {
    super();
    this.gameState = gameState;
    this.onPlayerAttrChange = onPlayerAttrChange;

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 425 });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "Update Players",
      style: {
        fill: 0xec1561,
        fontSize: 50,
      },
    });
    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    this.panel.addChild(this.title);

    this.doneButton = new Button({ text: "OK" });
    this.doneButton.y = this.panelBase.boxHeight * 0.5 - 78;
    this.doneButton.onPress.connect(() => engine().navigation.dismissPopup());
    this.panel.addChild(this.doneButton);

    this.versionLabel = new Label({
      text: `Version ${APP_VERSION}`,
      style: {
        fill: 0xffffff,
        fontSize: 12,
      },
    });
    this.versionLabel.alpha = 0.5;
    this.versionLabel.y = this.panelBase.boxHeight * 0.5 - 15;
    this.panel.addChild(this.versionLabel);

    this.layout = new List({ type: "vertical", elementsMargin: 4 });
    this.layout.x = -90;
    this.layout.y = -110;
    this.panel.addChild(this.layout);

    this._1nameInput = new Input({
      placeholder: "Enter player 1's name...",
      value: this.gameState.getPlayerName(1),
      bg: this.makeInputBg(),
    });
    this.layout.addChild(this._1nameInput);

    this._1colourInput = new Input({
      placeholder: "Enter player 1's colour...",
      value: this.gameState.getPlayerColour(1),
      bg: this.makeInputBg(),
    });
    this.layout.addChild(this._1colourInput);

    this._2nameInput = new Input({
      placeholder: "Enter player 2's name...",
      value: this.gameState.getPlayerName(2),
      bg: this.makeInputBg(),
    });
    this.layout.addChild(this._2nameInput);

    this._2colourInput = new Input({
      placeholder: "Enter player 2's colour...",
      value: this.gameState.getPlayerColour(2),
      bg: this.makeInputBg(),
    });
    this.layout.addChild(this._2colourInput);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Set things up just before showing the popup */
  public prepare() {
    this._1nameInput.value = this.gameState.getPlayerName(1);
    this._1colourInput.value = this.gameState.getPlayerColour(1);
    this._2nameInput.value = this.gameState.getPlayerName(2);
    this._2colourInput.value = this.gameState.getPlayerColour(2);
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 4 }),
      ];
    }

    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    //update name and colours
    //no validation on hex here but eeuegahsajk
    this.gameState.setPlayerName(1, this._1nameInput.value);
    this.gameState.setPlayerColour(1, this._1colourInput.value);
    this.gameState.setPlayerName(2, this._2nameInput.value);
    this.gameState.setPlayerColour(2, this._2colourInput.value);
    this.onPlayerAttrChange();

    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      {
        duration: 0.3,
        ease: "backIn",
      },
    );
  }

  public getGameState(gameState: GameState){
    this.gameState = gameState;
  }

  private makeInputBg(): Graphics {
    return new Graphics()
        .roundRect(0, 0, 180, 40, 8)
        .fill(0xffffff)
        .stroke({ width: 2, color: 0xec1561 });
  }
}

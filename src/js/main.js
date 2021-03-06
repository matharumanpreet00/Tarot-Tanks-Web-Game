import { Stage, Sound, Text, Ticker, Bitmap } from "createjs-module";

import { SCENES, WIDTH, HEIGHT, FULL_HEIGHT, FULL_WIDTH } from "./constants";

import { Keyboard } from "./modules/input";
import { PlayScene, MenuScene, EndScene, WonScene, InstructionsScene } from "./modules/scene";
import { Button } from "./modules/common";

import { assetManager } from "./asset_store";
import { Util } from "./utils";
import config from "./config";

class Game {
  Play() {
    console.log("Started New Game ");
    this.canvas = document.getElementById("canvas");
    this.stage = new Stage(this.canvas);
    this.input = new Keyboard();
    this.input.listenTo(window);
    this.Init();
  }

  Init() {
    this.stage.enableMouseOver(20);
    Ticker.framerate = 60;
    Ticker.timingMode = Ticker.RAF;
    Ticker.on("tick", this.Update);
    window.game = this;
    this.Main();
  }

  Update(e) {
    this.scene.Update(e);
  }

  Main() {
    // this.scene = new PlayScene();
    this.scene = new MenuScene();
    this.stage.setBounds(0, 0, FULL_WIDTH, FULL_HEIGHT);
    // this.scene.regX = WIDTH / 2;
    // this.scene.regY = HEIGHT / 2;
    // this.scene.x = WIDTH/2;
    // this.scene.y = HEIGHT/2;
    // this.scene.rotation = 180;
    this.stage.addChild(this.scene);
  }

  setScene(scene, level = 0) {
    this.stage.removeAllChildren();
    switch (scene) {
      case SCENES.PLAY:
        this.scene = new PlayScene(level);
        break;
      case SCENES.WON:
        this.scene = new WonScene();
        break;
      case SCENES.INSTRUCTIONS:
        this.scene = new InstructionsScene();
        break;
      case SCENES.END:
        this.scene = new EndScene();
        break;
      case SCENES.START:
      default:
        this.scene = new MenuScene();
        break;
    }

    this.stage.addChild(this.scene);
  }

  switchLevel(level) {
    this.setScene(SCENES.PLAY, Util.clamp(level, 0, config.levels.length - 1));
  }
}

export default new Game();

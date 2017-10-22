import { Bitmap, Ticker, Tween, Event } from "createjs-module";
import { Keyboard } from "../input";
import { DIR, KEYS, HEIGHT, WIDTH, FULL_HEIGHT, FULL_WIDTH, TAGS } from "../../constants";
import { Vector2, Util } from "../../utils";
import { GameObject, Bullet } from ".";
import assetManager from "../../asset_store";
import game from "../../main";

export class Player extends GameObject {
  constructor(x, y, speed = 5, scene, playerNum) {
    super(assetManager.getResult("player"), x, y, speed, scene);

    this.movement = [false, false, false, false];
    this.bullets = [];
    this.playerNum = playerNum;
    this.tag = TAGS.PLAYER;
    this.Main();
  }

  Update(e) {
    if (this.isKeyDown()) {
      let { width, height } = this.getBounds();
      let pos = this.pos.add(this.forward.scale(this.speed));

      pos.x = Util.clamp(pos.x, width / 2, FULL_WIDTH - width / 2);
      pos.y = Util.clamp(pos.y, height / 2, FULL_HEIGHT - height / 2);

      if (!this.isColliding(pos)) this.pos = pos;
    }

    this._UpdateBullets();
    this.stage.update();
  }

  isKeyDown() {
    return this.movement.some(e => e);
  }

  Move(e, dir, forward) {
    if (e.type == "keydown") {
      this.movement[dir] = true;
      this.forward = forward;
    } else {
      this.movement[dir] = false;
    }
    this.rotation = 360 - this.forward.atan2(Vector2.Down) * 180 / Math.PI;
  }

  Shoot() {
    let bullet = new Bullet(
      assetManager.getResult("bullet"),
      this.x,
      this.y,
      true,
      this.forward,
      TAGS.PLAYER
    );

    this.stage.addChild(bullet);
    bullet.onDestroyed(this.handleBulletDestruction);
    this.bullets.push(bullet);
  }

  /**
   * @param {Event} e 
   * @param {Bullet} bullet 
   * @memberof Player
   */
  handleBulletDestruction(e, bullet) {
    console.log("in handle bullet ");
    const isAtMyPosition = this.scene.tileMap.isPointInTile(
      bullet.pos.x,
      bullet.pos.y,
      this.scene.tileMap.getTileCoordRaw(this.pos.x, this.pos.y)
    );
    console.log(isAtMyPosition);

    if (isAtMyPosition) this.takeDamage();

    this.bullets = this.bullets.filter(b => b.isAlive);
    this.stage.removeChild(bullet);
  }

  onDestroy(callback) {
    this.on("playerDead", callback, null, true, this); // forward callback to other listeners
  }

  handleDestroy() {
    game.input.removeMapping(this.playerNum ? [37, 38, 39, 40, 32] : [65, 87, 68, 83, 16]);
  }

  takeDamage() {
    this.health = Math.max(0, --this.health);
    if (this.health <= 0) {
      this.dispatchEvent("playerDead");
    }
  }

  Main() {
    // console.log("main of player ", this.scene);
    if (this.playerNum) {
      game.input.addMapping(37, e => this.Move(e, DIR.LEFT, Vector2.Left), false);
      game.input.addMapping(38, e => this.Move(e, DIR.UP, Vector2.Down), false);
      game.input.addMapping(39, e => this.Move(e, DIR.RIGHT, Vector2.Right), false);
      game.input.addMapping(40, e => this.Move(e, DIR.DOWN, Vector2.Up), false);
      game.input.addMapping(32, this.Shoot, true);
    } else {
      game.input.addMapping(65, e => this.Move(e, DIR.LEFT, Vector2.Left), false);
      game.input.addMapping(87, e => this.Move(e, DIR.UP, Vector2.Down), false);
      game.input.addMapping(68, e => this.Move(e, DIR.RIGHT, Vector2.Right), false);
      game.input.addMapping(83, e => this.Move(e, DIR.DOWN, Vector2.Up), false);
      game.input.addMapping(16, this.Shoot, true);
    }
    this.on("playerDead", this.handleDestroy, null, true, this); // handle destroy and clean listeners
  }

  _UpdateBullets() {
    for (let bullet of this.bullets) {
      bullet.Update();
    }
  }
}
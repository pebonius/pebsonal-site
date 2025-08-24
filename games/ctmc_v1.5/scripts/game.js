"use strict";

class Game {
  constructor() {
    const canvas = document.getElementById("canvas");
    checkForTypeError(canvas, "canvas", HTMLCanvasElement, "HTMLCanvasElement");
    canvas.oncontextmenu = (e) => {
      e.preventDefault();
    };
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.content = new ContentManager();
    this.sound = new SoundManager();
    this.credits = new Credits("./CREDITS.txt");
    this.input = new Input(canvas);
    this.gameStates = [];
    this.isRunning = false;
  }
  initialize() {
    this.gameStates.push(new GameScreen(this.gameStates, this.canvas, this.input, this.content, this.sound));
    this.isRunning = true;
    var self = this;
    requestAnimationFrame(() => self.gameLoop(self));
  }
  update() {
    removeDead(this.gameStates);
    if (typeof this.gameStates !== "undefined" && this.gameStates.length > 0) {
      this.gameStates[0].update(this.input);
    }
  }
  draw() {
    clearContext(this.context, this.canvas);
    if (typeof this.gameStates !== "undefined" && this.gameStates.length > 0) {
      this.gameStates[0].draw(this.context, this.canvas);
    }
  }
  gameLoop(self) {
    self.update();
    self.draw();
    if (self.isRunning) {
      requestAnimationFrame(() => self.gameLoop(self));
    }
  }
}

class GameScreen extends GameState {
  constructor(gameStates, canvas, input, content, sound) {
    checkForTypeError(gameStates, "gameStates", Array, "Array");
    checkForTypeError(canvas, "canvas", HTMLCanvasElement, "HTMLCanvasElement");
    checkForTypeError(input, "input", Input, "Input");
    checkForTypeError(content, "content", ContentManager, "ContentManager");
    checkForTypeError(sound, "sound", SoundManager, "SoundManager");
    super(gameStates);
    this.canvas = canvas;
    this.input = input;
    this.content = content;
    this.sound = sound;
    this.addBackground();
    this.addCats();
  }
  playAmbience() {
    this.sound.setMusicVolume(0.5);
    this.sound.playMusic(this.content.ambience, true);
  }
  addBackground() {
    this.background = new Sprite(this.content.bg, new Point(0, 0), new Point(320, 240));
    this.addChild(this.background);
  }
  addCats() {
    this.catSpawner = new CatSpawner(this);
    this.addChild(this.catSpawner);
  }
  update(input) {
    super.update(input);
  }
}

class CatSpawner extends GameComponent {
  constructor(gameScreen) {
    checkForTypeError(gameScreen, "gameScreen", GameScreen, "GameScreen");
    super();
    this.isAwaitingInput = true;
    this.gameScreen = gameScreen;
    this.maxCats = 99;
    this.cats = [];
    this.addClickEvent();
    this.addLabel();
  }
  addClickEvent() {
    this.gameScreen.canvas.addEventListener("mousedown", (e) => { this.onClick(e) }, false);
  }
  addLabel() {
    const canvas = this.gameScreen.canvas;
    this.label = new Label("click to make cat", new Point(canvas.width / 2, canvas.height / 2), "Arial", 20, "white", "center", "center", "rgba(0, 0, 0, 0)");
    this.addChild(this.label);
  }
  onClick(e) {
    if (this.isAwaitingInput) {
      this.isAwaitingInput = false;
      this.label.isDead = true;
      this.gameScreen.playAmbience();
    }
    const input = this.gameScreen.input;
    this.randomizeCat(input.cursorPosition(e));
  }
  randomizeCat(position) {
    switch (randomNumber(1, 10)) {
      case 1:
        this.makeCat(this.gameScreen.content.pallas, position);
        break;
      case 2:
        this.makeCat(this.gameScreen.content.orangecat, position);
        break;
      case 3:
        this.makeCat(this.gameScreen.content.bluecat, position);
        break;
      default:
        this.makeCat(this.gameScreen.content.cat, position);
        break;
    }
  }
  makeCat(image, position) {
    if (this.cats.length >= this.maxCats) {
      this.cats[0].isDead = true;
      this.cats.splice(0, 1);
    }
    let cat = new Cat(this.gameScreen, position, image, new Point(0, 0));
    this.cats.push(cat);
    this.addChild(cat);
  }
}

class Cat extends GameComponent {
  constructor(gameScreen, position, image, delta) {
    checkForTypeError(gameScreen, "gameScreen", GameScreen, "GameScreen");
    checkForTypeError(position, "position", Point, "Point");
    checkForTypeError(image, "image", Image, "Image");
    checkForTypeError(delta, "delta", Point, "Point");
    super();
    this.gameScreen = gameScreen;
    this.position = new Point(position.x, position.y);
    this.image = image;
    this.size = new Point(image.width, image.height);
    this.delta = new Point(delta.x, delta.y);
    this.collisionRect = new Rectangle(this.position, this.size, "white");
    this.damping = 0.99;
    this.addSprite();
    this.sayNyaa();
  }
  addSprite() {
    this.sprite = new Sprite(this.image, this.position, this.size);
    this.addChild(this.sprite);
  }
  applyGravity() {
    if (this.position.y + this.size.y < this.gameScreen.canvas.height) {
      this.delta.y += 0.01 * (this.delta.y + 10);
    } else {
      this.position.y = this.gameScreen.canvas.height - this.size.y;
      this.delta.y = 0;
    }
  }
  collideWithCats() {
    for (let i = 0; i < this.gameScreen.catSpawner.cats.length; i++) {
      const cat = this.gameScreen.catSpawner.cats[i];
      if (Rectangle.intersects(this.collisionRect, cat.collisionRect) && this != cat) {
        this.delta.x += randomNumber(-1, 1) * 0.1;
        this.delta.y += randomNumber(-1, 1) * 0.1;
      }
    }
  }
  collideWithBoundaries() {
    if (this.position.x <= 0) {
      this.delta.x += 0.2;
    } else if (this.position.x + this.size.x > canvas.width) {
      this.delta.x -= 0.2;
    }
  }
  move() {
    this.position.x += this.delta.x;
    this.position.y += this.delta.y;
  }
  roundPosition() {
    this.position.x = Math.round(this.position.x);
    this.position.y = Math.floor(this.position.y);
  }
  addDamping() {
    this.delta.x *= this.damping;
    this.delta.y *= this.damping;
  }
  sayNyaa() {
    this.gameScreen.sound.playSoundEffect(this.gameScreen.content.nyaa);
  }
  update(input) {
    super.update();
    this.applyGravity();
    this.collideWithCats();
    this.collideWithBoundaries();
    this.move();
    this.roundPosition();
    this.addDamping();
  }
}

class ContentManager {
  constructor() {
    this.loadContent();
    this.preloadSfx();
  }
  loadContent() {
    this.bg = new Image();
    this.bg.src = "./images/bg1.png";
    this.cat = new Image();
    this.cat.src = "./images/cat.png";
    this.orangecat = new Image();
    this.orangecat.src = "./images/orangecat.png";
    this.pallas = new Image();
    this.pallas.src = "./images/pallas.png";
    this.bluecat = new Image();
    this.bluecat.src = "./images/bluecat.png";
    this.ambience = new Audio("./sounds/town-ambient.ogg");
    this.nyaa = "./sounds/nyaa.ogg";
  }
  preloadSfx() {
    const nyaa = new Audio(this.nyaa);
  }
}

window.onload = () => {
  const game = new Game();
  game.initialize();
};
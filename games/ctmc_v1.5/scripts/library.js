"use strict";

const maxNumber = 999999999;

const isRunningLocally = () => {
    return location.hostname === "localhost"
        || location.hostname === "127.0.0.1"
        || location.hostname === "";
}

const checkForTypeError = (value, valueName, type, typeName) => {
    if (!(value instanceof type)) {
        throw TypeError("Provided " + valueName + " must be instance of " + typeName + ".");
    }
}

const checkForTypeErrorNum = (value, valueName) => {
    if (!isNumber(value)) {
        throw TypeError("Provided " + valueName + " must be a number.");
    }
}

const clamp = (number, min, max) => {
    if (!isNumber(number) || !isNumber(min) || !isNumber(max)) {
        throw TypeError("Provided number, min, max must be numbers.");
    }
    if (min >= max) {
        throw RangeError("Provided min must be smaller than max.");
    }
    return Math.min(Math.max(number, min), max);
};

const isNumber = (value) => {
    return Number(value) === value;
};

const isFloat = (number) => {
    return isNumber(number) && number % 1 !== 0;
};

const isNonEmptyString = (checked) => {
    return typeof checked === "string" && checked !== "";
};

const removeDead = (array) => {
    if (Array.isArray(array)) {
        for (let i = array.length - 1; i > -1; i--) {
            if (array[i].isDead) {
                array.splice(i, 1);
            }
        }
    } else {
        throw TypeError("Can only remove dead objects from array.");
    }
};

const removeFromArray = (array, object) => {
    if (Array.isArray(array)) {
        const i = array.indexOf(object);
        array.splice(i, 1);
    }
};

const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (+max + 1 - +min) + +min);
};

const randomFloat = (min, max) => {
    return Math.random() * (+max + 1 - +min) + +min;
};

const clearContext = (context, canvas) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000";
    context.fill();
};

class Input {
    constructor(canvas) {
        checkForTypeError(canvas, "canvas", HTMLCanvasElement, "HTMLCanvasElement");
        this.canvas = canvas;
        this.keyMappings = [];
        this.keys = {};
        this.addEvents();
        this.addKeys();
    }
    addKeys() {
        this.keys = {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            ESCAPE: 27,
            SPACE: 32,
            PAGEUP: 33,
            PAGEDOWN: 34,
            END: 35,
            HOME: 36,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            INSERT: 45,
            DELETE: 46,
            K0: 48,
            K1: 49,
            K2: 50,
            K3: 51,
            K4: 52,
            K5: 53,
            K6: 54,
            K7: 55,
            K8: 56,
            K9: 57,
            A: 65,
            B: 66,
            C: 67,
            D: 68,
            E: 69,
            F: 70,
            G: 71,
            H: 72,
            I: 73,
            J: 74,
            K: 75,
            L: 76,
            M: 77,
            N: 78,
            O: 79,
            P: 80,
            Q: 81,
            R: 82,
            S: 83,
            T: 84,
            U: 85,
            V: 86,
            W: 87,
            X: 88,
            Y: 89,
            Z: 90,
            SELECT: 93,
            NUM0: 96,
            NUM1: 97,
            NUM2: 98,
            NUM3: 99,
            NUM4: 100,
            NUM5: 101,
            NUM6: 102,
            NUM7: 103,
            NUM8: 104,
            NUM9: 105,
            MULTIPLY: 106,
            ADD: 107,
            SUBTRACT: 109,
            DECIMAL: 110,
            DIVIDE: 111,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            MINUS: 173,
            SEMICOLON: 186,
            EQUAL: 187,
            COMMA: 188,
            DASH: 189,
            PERIOD: 190,
            SLASH: 191,
            BACKQUOTE: 192,
            BACKSLASH: 220,
            BRACKETLEFT: 219,
            BRACKETRIGHT: 221,
            QUOTE: 222,
        };
        Object.freeze(this.keys);
    }
    addEvents() {
        document.addEventListener("keydown", this.keyDown, false);
        document.addEventListener("keyup", this.keyUp, false);
        window.addEventListener(
            "keydown",
            (e) => {
                if (
                    [
                        this.keys.SPACE,
                        this.keys.UP,
                        this.keys.DOWN,
                        this.keys.LEFT,
                        this.keys.RIGHT,
                    ].indexOf(e.keyCode) > -1
                ) {
                    e.preventDefault();
                }
            },
            false
        );
    }
    keyDown = (e) => {
        this.keyMappings[e.keyCode] = true;
    };
    keyUp = (e) => {
        this.keyMappings[e.keyCode] = false;
    };
    isKeyPressed(key) {
        return this.keyMappings[key];
    }
    cursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        return new Point(event.clientX - rect.left, event.clientY - rect.top);
    }
}

class SoundManager {
    constructor() {
        this.sfxVolume = 1;
        this.musicVolume = 1;
    }
    setSfxVolume(value) {
        this.sfxVolume = clamp(value, 0, 1);
    }
    setMusicVolume(value) {
        this.musicVolume = clamp(value, 0, 1);
    }
    playSoundEffect(source) {
        const sound = new Audio(source);
        sound.volume = this.sfxVolume;
        sound.oncanplay = (e) => {
            sound.play();
        };
    }
    playMusic(audio, loop) {
        audio.loop = loop;
        audio.volume = this.musicVolume;

        if (audio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
            audio.play();
        } else {
            audio.oncanplay = (e) => {
                audio.play();
            };
        }
    }
}

class Credits {
    constructor(source) {
        if (!isNonEmptyString(source)) {
            console.log("Credits file path incorrect.");
        } else if (isRunningLocally()) {
            console.log("Cannot load credits file when game is running locally.")
            console.log("Open CREDITS.txt in game folder to see the credits.")
        } else {
            this.fetchCredits(source);
        }
    }
    fetchCredits(source) {
        fetch(source).then(
            (response) => {
                if (response.status !== 200) {
                    console.log("Could not fetch credits file.");
                    return;
                }

                response.text().then((data) => {
                    this.logCredits(data);
                });
            }
        )
    }
    logCredits(text) {
        console.log(text);
    }
}

class GameComponent {
    constructor() {
        this.children = [];
    }
    addChild(gameComponent) {
        this.children.push(gameComponent);
    }
    updateChildren(input) {
        removeDead(this.children);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].update(input);
        }
    }
    update(input) {
        this.updateChildren(input);
    }
    drawChildren(context) {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].draw(context);
        }
    }
    draw(context) {
        this.drawChildren(context);
    }
}

class GameState extends GameComponent {
    constructor(gameStates) {
        super();
        this.gameStates = gameStates;
        if (new.target === GameState) {
            throw TypeError("Cannot instantiate abstract class GameState.");
        }
    }
    close() {
        this.isDead = true;
    }
    update(input) {
        super.update(input);
    }
    draw(context, canvas) {
        clearContext(context, canvas);
        super.draw(context);
    }
}

class Point {
    constructor(x, y) {
        if (!isNumber(x) || !isNumber(y)) {
            throw TypeError("Provided x and y coordinates must be numbers.");
        }
        this.x = x;
        this.y = y;
    }
    static distance(a, b) {
        if (!(a instanceof Point) || !(b instanceof Point)) {
            throw TypeError("Provided a and b must be Points.")
        }
        let xDist = Math.pow(a.x - b.x, 2);
        let yDist = Math.pow(a.y - b.y, 2);
        return Math.sqrt(xDist + yDist);
    }
    normalize() {
        const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        if (magnitude !== 0) {
            this.x = this.x / magnitude;
            this.y = this.y / magnitude;
        }
    }
}

class DrawableComponent extends GameComponent {
    constructor(position, size) {
        super();
        this.position = position;
        this.size = size;
    }
    draw() { }
}

class Rectangle extends DrawableComponent {
    constructor(position, size, color) {
        super(position, size);
        this.color = color;
    }
    center() {
        return new Point(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2);
    }
    draw(context) {
        this.drawAt(context, this.position);
    }
    drawAt(context, position) {
        this.drawAtSize(context, position, this.size);
    }
    drawAtSize(context, position, size) {
        this.drawAtSizeColor(context, position, size, this.color);
    }
    drawAtSizeColor(context, position, size, color) {
        context.beginPath();
        context.fillStyle = color;
        context.fillRect(position.x, position.y, size.x, size.y);
        context.fill();
    }
    contains(point) {
        return (
            point.x >= this.position.x &&
            point.x <= this.position.x + this.size.x &&
            point.y >= this.position.y &&
            point.y <= this.position.y + this.size.y
        );
    }
    static intersects(rectA, rectB) {
        if (
            rectA.position.x > rectB.position.x + rectB.size.x ||
            rectB.position.x > rectA.position.x + rectA.size.x
        ) {
            return false;
        }
        if (
            rectA.position.y > rectB.position.y + rectB.size.y ||
            rectB.position.y > rectA.position.y + rectA.size.y
        ) {
            return false;
        }
        return true;
    }
}

class Triangle extends DrawableComponent {
    constructor(position, size, color) {
        super(position, size);
        this.color = color;
    }
    draw(context) {
        this.drawAt(context, this.position);
    }
    drawAt(context, position) {
        this.drawAtSize(context, position, this.size);
    }
    drawAtSize(context, position, size) {
        this.drawAtSizeColor(context, position, size, this.color);
    }
    drawAtSizeColor(context, position, size, color) {
        context.beginPath();
        context.moveTo(position.x + size.x / 2, position.y);
        context.lineTo(position.x + size.x, position.y + size.y);
        context.lineTo(position.x, position.y + size.y);
        context.fillStyle = color;
        context.fill();
        context.closePath();
    }
}

class Circle extends DrawableComponent {
    constructor(position, radius, color) {
        super(position, new Point(radius, radius));
        this.radius = radius;
        this.color = color;
    }
    draw(context) {
        this.drawAt(context, this.position);
    }
    drawAt(context, position) {
        this.drawAtSize(context, position, this.radius);
    }
    drawAtSize(context, position, radius) {
        this.drawAtSizeColor(context, position, radius, this.color);
    }
    drawAtSizeColor(context, position, radius, color) {
        context.beginPath();
        context.fillStyle = color;
        context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        context.fill();
    }
    contains(point) {
        return (
            Point.calculateDistance(
                this.position.x,
                this.position.y,
                point.x,
                point.y
            ) <=
            this.size.x / 2
        );
    }
    static intersects(circA, circB) {
        return (
            Point.distance(circA.position, circB.position) <=
            circA.size.x / 2 + circB.size.x / 2
        );
    }
}

class Sprite extends DrawableComponent {
    constructor(image, position, size) {
        super();
        this.image = image;
        this.position = position;
        this.size = size;
    }
    draw(context) {
        this.drawAt(context, this.position);
    }
    drawAt(context, position) {
        this.drawAtSize(context, position, this.size);
    }
    drawAtSize(context, position, size) {
        context.drawImage(this.image, position.x, position.y, size.x, size.y);
    }
    drawAtSizeColor(context, position, size, color) {
        this.drawAtSize(context, position, size);
    }
}

class Label extends DrawableComponent {
    constructor(
        text,
        position,
        fontFamily,
        fontSize,
        color,
        alignHorizontal,
        alignVertical,
        bgColor
    ) {
        super(position, new Point(0, 0));
        this.text = text;
        this.fontSize = fontSize;
        this.font = fontSize + "px " + fontFamily;
        this.color = color;
        this.alignHorizontal = alignHorizontal;
        this.alignVertical = alignVertical;
        if (bgColor !== undefined) {
            this.background = new Rectangle(
                new Point(0, 0),
                new Point(0, 0),
                bgColor
            );
        }
    }
    updateText(text) {
        this.text = text;
    }
    draw(context) {
        this.drawAtPosition(context, this.position);
    }
    drawAtPosition(context, position) {
        context.font = this.font;
        if (this.background !== undefined) {
            this.background.drawAtSize(
                context,
                position,
                new Point(context.measureText(this.text).width, this.fontSize)
            );
        }
        context.fillStyle = this.color;
        context.textAlign = this.alignHorizontal;
        context.textBaseline = this.alignVertical;
        context.fillText(this.text, position.x, position.y);
    }
}

class MessageLog {
    constructor(position) {
        checkForTypeError(position, "position", Point, "Point");
        this.messages = [];
        this.maxMessages = 20;
        this.maxMessageLenght = 100;
        this.messageQueue = [];
        this.waitTime = 0;
        this.waitQueue = [];
        this.fontSize = 16;
        this.fontfamily = "Courier New";
        this.position = new Point(position.x, position.y);
    }
    log(messageText, color = "white") {
        if (messageText.length > this.maxMessageLenght) {
            this.splitMessage(messageText, color);
        } else {
            this.messages.push(
                new Label(
                    messageText,
                    new Point(0, 0),
                    this.fontfamily,
                    this.fontSize,
                    color,
                    "left",
                    "top",
                    "rgba(0, 0, 0, 0.5)"
                )
            );
        }
        if (this.messages.length > this.maxMessages) {
            this.messages = this.messages.slice(
                this.messages.length - this.maxMessages,
                this.messages.length
            );
        }
    }
    splitMessage(message, color) {
        if (isNonEmptyString(message)) {
            let words = [];
            let currentLine = "";

            words = message.split(" ");

            for (let i = 0; i < words.length; i++) {
                if (isNonEmptyString(currentLine)) {
                    currentLine += " ";
                }

                if (currentLine.length + words[i].length <= this.maxMessageLenght) {
                    currentLine += words[i];
                } else {
                    this.log(currentLine, color);
                    currentLine = words[i];
                }
            }

            if (isNonEmptyString(currentLine)) {
                this.log(currentLine, color);
            }
        }
    }
    queue(message, time = 0, color = "white") {
        this.messageQueue.push({
            messageText: message,
            color: color,
        })
        if (isNumber(time)) {
            this.waitQueue.push(time);
        }
    }
    logFromQueue() {
        if (this.messageQueue.length > 0) {
            this.log(this.messageQueue[0].messageText, this.messageQueue[0].color);
            this.messageQueue.shift();
        }
    }
    waitFromQueue() {
        if (this.waitQueue.length > 0) {
            this.waitTime = this.waitQueue[0];
            this.waitQueue.shift();
        }
    }
    isEmpty() {
        return this.messageQueue.length <= 0 && this.waitQueue.length <= 0;
    }
    update() {
        if (this.waitTime <= 0) {
            this.logFromQueue();
            this.waitFromQueue();
        } else {
            this.waitTime--;
        }
    }
    draw(context) {
        for (let i = 0; i < this.messages.length; i++) {
            this.messages[i].drawAtPosition(
                context,
                new Point(
                    this.position.x,
                    this.position.y - 20 * (this.messages.length - i)
                )
            );
        }
    }
}

class Particle extends GameComponent {
    constructor(position, size, lifespan) {
        checkForTypeError(position, "position", Point, "Point");
        checkForTypeError(size, "size", Point, "Point");
        checkForTypeErrorNum(lifespan, "lifespan");
        super();
        this.position = new Point(position.x, position.y);
        this.size = size;
        this.life = 0;
        this.lifespan = lifespan;
    }
    update() {
        this.life += 0.1;
    }
    remove() {
        this.life = this.lifespan;
    }
    isDead() {
        return this.life >= this.lifespan;
    }
}

class ParticleEngine extends GameComponent {
    constructor() {
        super();
        this.particles = [];
    }
    emit() { }
    update(input) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (particle.life >= particle.lifespan) {
                this.particles.splice(i, 1);
            } else {
                particle.update();
            }
        }
    }
    draw(context) {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw(context);
        }
    }
}
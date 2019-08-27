kontra.init("game");
kontra.initKeys();

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

let sprites = [];
let ship = kontra.Sprite({
  type: "ship",
  x: 300,
  y: 300,
  width: 6,
  rotation: -90,
  dt: 0,
  render() {
    this.context.save();

    this.context.translate(this.x, this.y);
    this.context.rotate(degreesToRadians(this.rotation));
    this.context.beginPath();
    this.context.moveTo(-3, -5);
    this.context.lineTo(12, 0);
    this.context.lineTo(-3, 5);
    this.context.lineTo(4, 0);
    this.context.closePath();
    this.context.stroke();
    this.context.restore();
  },
  update() {
    if (kontra.keyPressed("left")) {
      this.rotation += -4;
    } else if (kontra.keyPressed("right")) {
      this.rotation += 4;
    }

    const cos = Math.cos(degreesToRadians(this.rotation));
    const sin = Math.sin(degreesToRadians(this.rotation));

    if (kontra.keyPressed("up")) {
      this.ddx = cos * 0.05;
      this.ddy = sin * 0.05;
    } else {
      this.ddx = 0;
      this.ddy = 0;
    }
    this.advance();
    const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (magnitude > 10) {
      this.dx *= 0.95;
      this.dy *= 0.95;
    }
    this.dt += 1 / 60;
    if (kontra.keyPressed("space") && this.dt > 0.25) {
      this.dt = 0;

      let bullet = kontra.Sprite({
        type: "bullet",
        x: this.x + cos * 12,
        y: this.y + sin * 12,
        dx: this.dx + cos * 5,
        dy: this.dy + sin * 5,
        ttl: 60,
        width: 2,
        height: 2,
        color: "black"
      });

      sprites.push(bullet);
    }
  }
});

sprites.push(ship);

function createAsteroid() {
  let astroid = kontra.Sprite({
    type: "asteroid",
    x: 100,
    y: 100,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 - 2,
    radius: 30,
    render() {
      this.context.strokeStyle = "black";
      this.context.beginPath(); //Start drawing a shape
      this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      this.context.stroke();
    }
  });

  sprites.push(astroid);
}

for (var i = 0; i < 10; i++) {
  createAsteroid();
}

let loop = kontra.GameLoop({
  update: function() {
    let canvas = kontra.getCanvas();

    sprites.map(sp => {
      sp.update();
      if (sp.x < 0) {
        sp.x = canvas.width;
      }
      if (sp.x > canvas.width) {
        sp.x = -sp.width;
      }
      if (sp.y < 0) {
        sp.y = canvas.height;
      }
      if (sp.y > canvas.height) {
        sp.y = sp.height;
      }
    });

    for (let i = 0; i < sprites.length; i++) {
      if (sprites[i].type == "asteroid") {
        for (let j = 0; j < sprites.length; j++) {
          if (sprites[j].type !== "asteroid") {
            let astroid = sprites[i];
            let sprite = sprites[j];

            let dx = astroid.x - sprite.x;
            let dy = astroid.y - sprite.y;
            if (
              Math.sqrt(Math.pow(dx, 2)) + Math.pow(dy, 2) <
              astroid.radius + sprite.width
            ) {
              astroid.ttl = 0;
              sprite.ttl = 0;

              break;
            }
          }
        }
      }
    }
    sprites = sprites.filter(sprite => sprite.isAlive());
  },
  render: function() {
    sprites.map(sp => sp.render());
  }
});

loop.start();

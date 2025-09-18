class Ball {
  // --- Dimensions ---
  #radius;

  // --- Speed and direction ---
  #speed;
  #directionX;
  #directionY;

  // --- Coordinates ---
  #initX;
  #initY;
  #x;
  #y;

  constructor(config) {
    this.#initX = config.x;
    this.#initY = config.y;
    this.#x = config.x;
    this.#y = config.y;
    this.#speed = config.speed;
    this.#radius = config.radius;
    this.#directionX = 0;
    this.#directionY = 0;
    this.reset();
  }

  reset() {
    this.#x = this.#initX;
    this.#y = this.#initY;

    this.#directionX = Math.random() < 0.5 ? 1 : -1;
    this.#directionY = (Math.random() * 2 - 1) * 0.5; 
  }

  update(leftPaddleY, rightPaddleY, paddleHeight, paddleWidth) {
    //console.log("directionY, directionX: ", this.#directionY, this.#directionX);
    this.#x += this.#speed * this.#directionX;
    this.#y += this.#speed * this.#directionY;

    const leftPaddleTop = leftPaddleY - paddleHeight / 2;
    const leftPaddleBottom = leftPaddleY + paddleHeight / 2;
    const rightPaddleTop = rightPaddleY - paddleHeight / 2;
    const rightPaddleBottom = rightPaddleY + paddleHeight / 2;

    const leftCollision =
      this.#x - this.#radius <= paddleWidth &&
      this.#y + this.#radius >= leftPaddleTop &&
      this.#y - this.#radius <= leftPaddleBottom;

    const rightCollision =
      this.#x + this.#radius >= 1 - paddleWidth &&
      this.#y + this.#radius >= rightPaddleTop &&
      this.#y - this.#radius <= rightPaddleBottom;

    if (leftCollision || rightCollision) {
      const paddleY = leftCollision ? leftPaddleY : rightPaddleY;
      const relativeIntersectY = paddleY - this.#y;
      const normalizedIntersectY = relativeIntersectY / (paddleHeight / 2);

      const bounceAngle = normalizedIntersectY * (Math.PI / 2);

      this.#directionX = leftCollision ? 1 : -1;
      this.#directionY = -Math.sin(bounceAngle);
    }

    // Wall collision: reverse direction
    if (this.#y - this.#radius <= 0 || this.#y + this.#radius >= 1) {
      this.#directionY *= -1;
    }
  }

  // --- Getters ---
  get radius() { return this.#radius; }
  get x() { return this.#x; }
  get y() { return this.#y; }
  get directionX() { return this.#directionX; }
  get directionY() { return this.#directionY; }
  get speed() {return this.#speed;}
}

export default Ball;

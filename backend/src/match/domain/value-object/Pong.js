import Ball from './Ball.js';
import Paddle from './Paddle.js';

class Pong {
  // --- Scores ---
  #winningScore = 3;
  #scores = [0, 0];

  // --- Ball ---
  #ball;

  // --- Paddles ---
  #paddles = [];

  constructor(config) {
    this.#winningScore = config.game.winningScore;
    this.#ball = new Ball(config.ball);

    this.#paddles[0] = new Paddle(config.paddle, 0);
    this.#paddles[1] = new Paddle(config.paddle, 1);
  }

  isBallScoring(side) {
    const ballLeft = this.#ball.x - this.#ball.radius;
    const ballRight = this.#ball.x + this.#ball.radius;

    const paddle = this.#paddles[side];
    const paddleTop = paddle.top();
    const paddleBottom = paddle.bottom();

    const ballAtEdge = (side === 0 && ballLeft <= 0) || 
    (side === 1 && ballRight >= 1);
    const missedPaddle = this.#ball.y < paddleTop || this.#ball.y > paddleBottom;

    if (ballAtEdge && missedPaddle)
      return true;
    return false;
  }

  movePaddleUp(index) {
    //console.log(`Pong: movePaddleUp: ${index}`);
    this.#paddles[index].moveUp();
  }

  movePaddleDown(index) {
    //console.log(`Pong: movePaddleDown: ${index}`);
    this.#paddles[index].moveDown();
  }

  movePaddleStop(index) {
    //console.log(`Pong: movePaddleStop: ${index}`);
    this.#paddles[index].stop();
  }

  update() {
    if (
      this.#scores[0] === this.#winningScore || 
      this.#scores[1] === this.#winningScore
    )
      return;

    if (this.isBallScoring(0)) {
      console.log("Pong : ball scored in the left side");
      this.#scores[1]++;
      this.#ball.reset();
    }

    if (this.isBallScoring(1)) {
      console.log("Pong : ball scored in the right side");
      this.#scores[0]++;
      this.#ball.reset();
    }

    this.#ball.update(
      this.#paddles[0].y, this.#paddles[1].y, 
      this.paddleHeight, this.paddleWidth);
  }

  // --- Getters ---
  // --- Game ---
  get winningScore() {
    return this.#winningScore;
  }

  get scores() {
    return this.#scores;
  }

  // --- Ball ---
  get ball() {
    return this.#ball;
  }

  // --- Paddles ----
  get paddles() {
    return this.#paddles;
  }

  get paddleHeight() {
    return this.#paddles[0].height;
  }

  get paddleWidth() {
    return this.#paddles[0].width;
  }

  get paddleSpeed()
  {
    return this.#paddles[0].speed;
  }
}

export default Pong;
import Pong from '../value-object/Pong.js';
import crypto from 'crypto'

import MatchControllerAi from '../../../match/infrastructure/MatchControllerAi.js';

class Match {
  #id;
  #timestamp;
  #type;

  #pong;
  #hasStarted = false;

  #players = [];
  #playerAiIndex = null;
  #hasAiPlayer = false;
  #framesCounter;
  #matchControllerAi;

  constructor(type, playerA, playerB, config, aiModelData) {
    if (!config || config == null) throw new Error("Missing configuration");

      this.#id = crypto.randomUUID();
      this.#timestamp = Date.now();
      this.#type = type;
      this.#pong = new Pong(config);
      this.#matchControllerAi = playerA.isAi() || playerB.isAi() ? new MatchControllerAi(aiModelData) : null;

    if (playerA.isAi() && playerB.isAi()) {
      throw new Error('Both players cannot be AI');

    
    }

    // --- Randomize players (left or right on the board) ---
    if (type != "local" && config.game.shufflePlayers && Math.random() < 0.5) {
      [playerA, playerB] = [playerB, playerA];
    }

    this.#players[0] = playerA;
    this.#players[1] = playerB;

    if (playerA.isAi() || playerB.isAi()) {
      this.#hasAiPlayer = true;
      this.#playerAiIndex = playerA.isAi() ? 0 : 1;
    }

    this.#framesCounter = 0;
  }

  get id() {
    return this.#id;
  }

  get timestamp() {
    return this.#timestamp;
  }

  get type() {
    return this.#type;
  }

  // --- User IDs ---
  getUserIds() {
    return [this.userIdA, this.userIdB];
  }

  get userIdA() {
    return this.#players[0].userId;
  }

  get userIdB() {
    return this.#players[1].userId;
  }

  get winnerId() {
    if (!this.isMatchOver()) return null;
    const winnerIndex = this.#pong.scores[0] > this.#pong.scores[1] ? 0 : 1;
    return this.#players[winnerIndex].userId;
  }

  get loserId() {
    if (!this.isMatchOver()) return null;
    
    // Winner is index 0? -> Loser is index 1, and vice versa
    const winnerIndex = this.#pong.scores[0] > this.#pong.scores[1] ? 0 : 1;
    return this.#players[1 - winnerIndex].userId; // Opposite player
  }

  getPaddleId(userId) {
    return this.#players.findIndex(player => player.userId === userId);
  }

  // --- Scores ---
  get scores() {
    return this.#pong.scores;
  }

  get frames()
  {
    if(this.#framesCounter == 60)
      this.#framesCounter = 0;
    return this.#framesCounter++;
  }

  get controllerAi()
  {
    return this.#matchControllerAi;
  }

  // --- Controls ---

  movePaddleUp(index) {
    //console.log(`Match: movePaddleUp: ${index}`);
    this.#pong.movePaddleUp(index);
  }

  movePaddleDown(index) {
    //console.log(`Match: movePaddleDown: ${index}`);
    this.#pong.movePaddleDown(index);
  }

  movePaddleStop(index) {
    //console.log(`Match: movePaddleStop: ${index}`);
    this.#pong.movePaddleStop(index);
  }

  // --- Start, update, end ---
  get hasStarted() {
    return this.#hasStarted;
  }

  start() {
    if (this.#hasStarted)
      return;
    this.#hasStarted = true;
  }

  update() {
    this.#pong.update();
  }

  isMatchOver() {
    return this.#pong.scores[0] === this.#pong.winningScore || this.#pong.scores[1] === this.#pong.winningScore;
  }

  // --- State ---
  getState() {
    return {
      game: {
        matchId: this.#id,
        scores: [
          this.#pong.scores[0],
          this.#pong.scores[1]
        ],
        players: this.#players
      },
      ball: {
        radius: this.#pong.ball.radius,
        x: this.#pong.ball.x,
        y: this.#pong.ball.y
      },
      paddles: [
        {
          height: this.#pong.paddleHeight,
          width: this.#pong.paddleWidth,
          x: this.#pong.paddles[0].x,
          y: this.#pong.paddles[0].y
        },
        {
          height: this.#pong.paddleHeight,
          width: this.#pong.paddleWidth,
          x: this.#pong.paddles[1].x,
          y: this.#pong.paddles[1].y
        }
      ]
    }
  }
  
  stateForAi()
  {
    return {
      ball: {
        x: this.#pong.ball.x,
        y: this.#pong.ball.y,
        radius: this.#pong.ball.radius,
        directionX: this.#pong.ball.directionX,
        directionY: this.#pong.ball.directionY,
        speed: this.#pong.ball.speed
      },
      paddles: [
        {
          height: this.#pong.paddleHeight,
          width: this.#pong.paddleWidth,
          x: this.#pong.paddles[0].x,
          y: this.#pong.paddles[0].position,
          speed: this.#pong.paddleSpeed
        },
        {
          height: this.#pong.paddleHeight,
          width: this.#pong.paddleWidth,
          x: this.#pong.paddles[1].x,
          y: this.#pong.paddles[1].position,
          speed: this.#pong.paddleSpeed
        }
      ]
    }
  }

  get players() {
    return this.#players;
  }
  
  // --- AI ----
  get hasAiPlayer() {
	  return this.#hasAiPlayer;
  }

  get playerAiIndex() {
	  return this.#playerAiIndex;
  }
}

export default Match;
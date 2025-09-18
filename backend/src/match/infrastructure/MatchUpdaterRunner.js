class MatchUpdaterRunner {
  #matchUpdater;
  #intervalId;
  #isRunning = false;

  constructor(matchUpdater) {
    this.#matchUpdater = matchUpdater;
  }

  /*
   * This is the loop that runs 60 times per second (60 fps)
   * It calls the match updater
   * Runs as long as there are active matches in the registry
   */
/*
  start() {
    if (this.#isRunning)
      return;

    this.#isRunning = true;

    const TICK_RATE_MS = 1000 / 60;

    this.#intervalId = setInterval(() => {
      let hasActiveMatches = this.#matchUpdater.updateAll();
      if (!hasActiveMatches)
        this.stop();
    }, TICK_RATE_MS);
  }
*/

/*
start function runs the game loop as fast as possible, but only calls updateAll() every 16ms (60FPS)
it doesnt overlap frames, keeps the match update timing predictable and even 
 */
  start() {
  if (this.#isRunning) return;
  this.#isRunning = true;

  const TICK_RATE_MS = 1000 / 60;
  let lastUpdateTime = Date.now();

  const loop = async () => {
    if (!this.#isRunning) return;

    const now = Date.now();
    const elapsed = now - lastUpdateTime;

    if (elapsed >= TICK_RATE_MS) {
      lastUpdateTime = now;

      const hasActiveMatches = await this.#matchUpdater.updateAll();

      if (!hasActiveMatches) {
        this.stop();
        return;
      }
    }

    // Use requestAnimationFrame-like scheduling
    setImmediate(loop);
  };

  loop(); // start the loop
}

  stop() {
    if (!this.#isRunning)
      return;

    clearInterval(this.#intervalId);

    this.#isRunning = false;
  }

  get isRunning() {
    return this.#isRunning;
  }
}

export default MatchUpdaterRunner;

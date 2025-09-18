 /*
   * Updates the state of each match in the registry
   * Broadcasts the state to the frontend
   * Skips a match that has not yet started
   * If a match is over :
   * - It is removed from the registry
   * - The final score is added to the repository
   * - An event is emitted
   */
 class MatchUpdater {
  #matchRegistry;
  #matchBroadcast;
  #matchRepository;
  #eventEmitter;
  #matchControllerAi;

  constructor(matchRegistry, matchBroadcast, matchRepository, eventEmitter, matchControllerAi) {
    this.#matchRegistry = matchRegistry;
    this.#matchBroadcast = matchBroadcast;
    this.#matchRepository = matchRepository;
    this.#eventEmitter = eventEmitter;
    this.#matchControllerAi = matchControllerAi;
  }

  async updateAll() {
    const matches = this.#matchRegistry.getAll();
    let hasActiveMatches = false;

    for (const match of matches) {
      if (!match.hasStarted) {
        continue;
      }

      if (match.isMatchOver()) {
        console.log(`Match ${match.id} is over. Skipping update.`);
        this.#matchBroadcast.broadcast(match.id, "match-over", {matchId: match.id, winnerId: match.winnerId, loserId: match.loserId});
        this.#matchRegistry.remove(match.id);

        // We only save the remote matches (local and ai are just for training)
        if (match.type == 'remote' || match.type == 'tournament') {
          this.#matchRepository.save(match);
        }
        
        this.#eventEmitter.emitMatchOver(match.id, match.winnerId, match.loserId, match.getUserIds(), match.scores);
        continue;
      }

      hasActiveMatches = true;
      await match.update();
    
      const state = match.getState();
      // --- AI Control ---
      if (match.hasAiPlayer) { 
        const aiPaddleIndex = match.playerAiIndex;
        const currentFrame = match.frames;
        const stateForAi = match.stateForAi();
        const decision = match.controllerAi.getDecision(stateForAi, currentFrame);
        switch(decision) {
          case 1:
            match.movePaddleUp(aiPaddleIndex);
            break;
          case 2:
            match.movePaddleDown(aiPaddleIndex);
            break;
        }
      }

      // --- Broadcast state to front ---
      this.#matchBroadcast.broadcast(match.id, "match-update", state);
    }

    return hasActiveMatches;
  }
}

export default MatchUpdater;
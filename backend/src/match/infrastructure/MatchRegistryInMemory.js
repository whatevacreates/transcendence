import MatchRegistry from '../port/MatchRegistry.js';

class MatchRegistryInMemory extends MatchRegistry {
  #matches = new Map();

  add(match) {
    const [ userIdA, userIdB ] = match.getUserIds();
    console.log(`MatchRegistryInMemory: add match: userIdA: ${userIdA} userIdB: ${userIdB}`);

    // Use the new method to check if match exists
    const existingMatch = this.getMatchByUsers(userIdA, userIdB);
    if (!existingMatch) {
      this.#matches.set(match.id, match);
      console.log(`Match added with id ${match.id}`);
      return match.id;
    } else {
      console.log(`!MatchRegistryInMemory : match already in registry ${existingMatch.id}`);
      return existingMatch.id;  // Return existing match ID explicitly
    }
  }

  get(matchId) {
    return this.#matches.get(matchId);
  }

  start(matchId) {
    const match = this.get(matchId);
    if (!match) {
      //throw new Error(`Match with id ${matchId} not found`);
      return;
    }
    match.start();
    return match;
  }

  getAll() {
    return Array.from(this.#matches.values());
  }

  remove(matchId) {
    this.#matches.delete(matchId);
  }

  matchExists(userIdA, userIdB) {
    return !!this.getMatchByUsers(userIdA, userIdB);
  }

  getMatchByUsers(userIdA, userIdB) {
    for (let match of this.#matches.values()) {
      const [existingUserIdA, existingUserIdB] = match.getUserIds();
      if (
        (existingUserIdA === userIdA && existingUserIdB === userIdB) ||
        (existingUserIdA === userIdB && existingUserIdB === userIdA)
      ) {
        return match;
      }
    }
    return null;
  }

  getMatchByUser(userId) {
    for (const match of this.#matches.values()) {
      if (match.getUserIds().includes(userId)) {
        return match;
      }
    }
    return null;
  }

  isUserInMatch(userId) {
    for (let match of this.#matches.values()) {
      const userIds = match.getUserIds();
      if (userIds.includes(userId)) {
        return true;
      }
    }
    return false;
  }
}

const matchRegistryInstance = new MatchRegistryInMemory();
export default matchRegistryInstance;

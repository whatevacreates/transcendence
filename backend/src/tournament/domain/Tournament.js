// domain/Tournament.js
class Tournament {
  #id;
  #players = [];
  #semiFinalMatches = [];
  #finalMatch = null;
  #ranking = [];
  
  // Runtime state
  semiFinalMatches = new Set();
  finalMatchId = null;
  phase = null; // 'semi' or 'final'
  matchSubscriptions = new Map();

  constructor(players) {
      this.#id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      if (players.length !== 4) {
          throw new Error("Tournament requires exactly 4 players");
      }
      
      this.#players = [...players];
      this.#initializeMatches();
  }

  get id() {
      return this.#id;
  }

  getPlayer(userId) {
      return this.#players.find(player => player.userId === userId);
  }

  #initializeMatches() {
      const pairs = this.#createSemiFinalPairs();
      this.#semiFinalMatches = pairs.map(pair => ({
          players: pair,
          scores: [0, 0],
          completed: false
      }));
  }

  #createSemiFinalPairs() {
      const shuffled = this.#shufflePlayers();
      return [
          [shuffled[0].userId, shuffled[1].userId],
          [shuffled[2].userId, shuffled[3].userId]
      ];
  }

  #shufflePlayers() {
      return [...this.#players].sort(() => Math.random() - 0.5);
  }

  getSemiFinalPairs() {
      return this.#semiFinalMatches.map(match => match.players);
  }

  recordSemiFinalResult(winnerId, loserId, winnerScore, loserScore) {
      const matchIndex = this.#semiFinalMatches.findIndex(match => 
          match.players.includes(winnerId) && match.players.includes(loserId)
      );

      if (matchIndex === -1) return;

      const match = this.#semiFinalMatches[matchIndex];
      const winnerIndex = match.players.indexOf(winnerId);
      
      match.scores = winnerIndex === 0 
          ? [winnerScore, loserScore] 
          : [loserScore, winnerScore];
          
      match.completed = true;
      this.#ranking.push(loserId); // Loser takes 3rd/4th place
  }

  getFinalists() {
      if (!this.#semiFinalMatches.every(match => match.completed)) {
          throw new Error("Cannot get finalists - semi-finals incomplete");
      }

      const finalists = this.#semiFinalMatches.map(match => 
          match.players[match.scores[0] > match.scores[1] ? 0 : 1]
      );

      this.#finalMatch = {
          players: finalists,
          scores: [0, 0]
      };

      return finalists;
  }

  recordFinalResult(winnerId, loserId, winnerScore, loserScore) {
      if (!this.#finalMatch) return;

      const winnerIndex = this.#finalMatch.players.indexOf(winnerId);
      this.#finalMatch.scores = winnerIndex === 0
          ? [winnerScore, loserScore]
          : [loserScore, winnerScore];

      // Final ranking: [1st, 2nd, 3rd/4th]
      this.#ranking = [winnerId, loserId, ...this.#ranking];
  }

  getTournamentData() {
      return {
          semiFinals: this.#semiFinalMatches.map(match => ({
              players: [...match.players],
              scores: [...match.scores],
              completed: match.completed
          })),
          final: this.#finalMatch ? {
              players: [...this.#finalMatch.players],
              scores: [...this.#finalMatch.scores]
          } : null,
          ranking: [...this.#ranking]
      };
  }

  getPlayers() {
      return this.#players.map(player => player.userId);
  }

  get userIds() {
      return this.getPlayers();
  }

  getAlias(userId) {
    const player = this.getPlayer(userId);
    return player.alias;
  }

  registerAlias(userId, alias) {
    console.log(`Tournament: registerAlias`);
    const player = this.getPlayer(userId);
    player.alias = alias;
    console.log(`Tournament: registered alias ${player.alias} for userId: ${player.userId}`);
  }

  areAliasesSet() {
    return this.#players.every(player => typeof player.alias === 'string');
  }

  resetAliases() {
    this.#players.forEach(player => {
        player.alias = null;
    });
  }
}

export default Tournament;
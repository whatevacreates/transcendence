import TournamentRegistry from "../port/TournamentRegistry.js";
import Tournament from "../domain/Tournament.js";

class TournamentRegistryInMemory {
  #tournaments = new Map(); // tournamentId -> Tournament
  #playerToTournament = new Map(); // userId -> tournamentId

  add(tournament) {
      this.#tournaments.set(tournament.id, tournament);
      for (const userId of tournament.userIds) {
          this.#playerToTournament.set(userId, tournament.id);
      }
  }

  getById(tournamentId) {
      return this.#tournaments.get(tournamentId);
  }

  getByPlayer(userId) {
      const tournamentId = this.#playerToTournament.get(userId);
      return tournamentId ? this.#tournaments.get(tournamentId) : null;
  }

  remove(tournament) {
      this.#tournaments.delete(tournament.id);
      for (const userId of tournament.userIds) {
          this.#playerToTournament.delete(userId);
      }
  }
}

export default TournamentRegistryInMemory;
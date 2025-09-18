import MatchRepository from "../port/MatchRepository.js";

class MatchRepositorySqlite extends MatchRepository {
  #db;

  constructor(db) {
    super();
    this.#db = db;
  }

  save(match) {
    const statement = this.#db.prepare(`
      INSERT INTO matches (matchId, timestamp, userIdA, userIdB, winnerId, scoreA, scoreB)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const dto = this.serialize(match);

    statement.run(
      dto.matchId,
      dto.timestamp,
      dto.userIdA,
      dto.userIdB,
      dto.winnerId,
      dto.scoreA,
      dto.scoreB
    );
  }

  getAll() {
    const statement = this.#db.prepare(`
      SELECT * FROM matches
    `);

    const rows = statement.all();
    return rows.map(row => this.deserialize(row));
  }

  getByMatchId(matchId) {
    const statement = this.#db.prepare(`
      SELECT * FROM matches WHERE matchId = ?
    `);

    const row = selectByIdstatement.get(matchId);
    return row ? this.deserialize(row) : null;
  }

  getByUserId(userId) {
    const statement = this.#db.prepare(`
      SELECT * FROM matches
      WHERE userIdA = ? OR userIdB = ?
    `);

    const rows = statement.all(userId, userId);
    return rows.map(row => this.deserialize(row));
  }

  serialize(match) {
    // Domain -> DTO
    return {
      matchId: match.matchId,
      timestamp: match.timestamp,
      userIdA: match.userIdA,
      userIdB: match.userIdB,
      winnerId: match.winnerId,
      scoreA: match.scores[0],
      scoreB: match.scores[1]
    }
  }

  deserialize(row) {
    // DB row -> DTO
    return {
      matchId: row.matchId,
      timestamp: parseInt(row.timestamp),
      userIdA: parseInt(row.userIdA),
      userIdB: parseInt(row.userIdB),
      winnerId: parseInt(row.winnerId),
      scoreA: parseInt(row.scoreA),
      scoreB: parseInt(row.scoreB)
    };
  }
}

export default MatchRepositorySqlite;
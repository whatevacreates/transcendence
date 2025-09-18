import FriendshipRepository from "../port/FriendshipRepository.js";

class FriendshipRepositorySqlite extends FriendshipRepository {
  #db;

  constructor(db) {
    super();
    this.#db = db;
  }

  async saveFriendship(user1Id, user2Id) {
    const statement = this.#db.prepare(`
      INSERT INTO friendships (user1_id, user2_id)
      VALUES (?, ?)
    `);

    statement.run(user1Id, user2Id);
  }

  async removeFriendship(user1Id, user2Id) {
    const statement = this.#db.prepare(`
      DELETE FROM friendships
      WHERE (user1_id = ? AND user2_id = ?)
        OR (user1_id = ? AND user2_id = ?)
      `);
    statement.run(user1Id, user2Id, user2Id, user1Id);
  }

  async areFriends(user1Id, user2Id) {
    const statement = this.#db.prepare(`
      SELECT 1 FROM friendships
      WHERE (user1_id = ? AND user2_id = ?)
      OR (user1_id = ? AND user2_id = ?)
    `);

    const result = statement.get(user1Id, user2Id, user2Id, user1Id);
    return !!result;
  }

  async getFriendsOfUser(userId) {
    const statement = this.#db.prepare(`
      SELECT u.id, u.username
      FROM users u
      JOIN (
        SELECT user1_id AS friendId FROM friendships WHERE user2_id = ?
        UNION
        SELECT user2_id AS friendId FROM friendships WHERE user1_id = ?
      ) f ON u.id = f.friendId
    `);

    return statement.all(userId, userId);
  }

  serialize(friendship) {
    return {
      user1_id: friendship.user1Id,
      user2_id: friendship.user2Id,
    };
  }

  deserialize(row) {
    return {
      user1Id: row.user1_id,
      user2Id: row.user2_id,
    };
  }
}

export default FriendshipRepositorySqlite;

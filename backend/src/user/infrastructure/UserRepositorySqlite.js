import UserRepository from "../port/UserRepository.js";
import User from "../domain/User.js";

class UserRepositorySqlite extends UserRepository {
  #db;

  constructor(db) {
    super();
    this.#db = db;
    this.#checkConnection();
  }

  #checkConnection() {
    try {
      this.#db.prepare("SELECT 1").get();
      console.log("Database connection is successful!");
    } catch (error) {
      console.error("Failed to connect to the database:", error.message);
    }
  }

  async getByUsername(username) {
    if (!username) return null;

    const statement = this.#db.prepare(`
      SELECT * FROM users WHERE username = ?
    `);

    const row = statement.get(username);
    return row ? this.#deserialize(row) : null;
  }

  async getByUserId(id) {
    const statement = this.#db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);

    const row = statement.get(id);
    return row ? this.#deserialize(row) : null;
  }

  async getAllUsers() {
    const statement = this.#db.prepare(`
      SELECT * FROM users
    `);

    const rows = statement.all();
    return rows.map(row => this.#deserialize(row));
  }

  async save(user) {
    const dto = this.#serialize(user);

    const statement = this.#db.prepare(`
      INSERT INTO users (id, username, password)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        username = excluded.username,
        password = excluded.password
    `);

    const result = statement.run(
      dto.id,
      dto.username,
      dto.password,
    );

    return this.#deserialize({
      ...dto,
      id: dto.id ?? result.lastInsertRowid
    });
  }


  // async getAllUsers() {
  //   const rows = this.db.prepare("SELECT * FROM users").all();

  //   return rows.map(
  //     (row) =>
  //       new User({
  //         id: row.id,
  //         username: row.username,
  //         password: row.password,
  //       }),
  //   );
  // }

  // --- Domain ↔︎ DB ---
  #serialize(user) {
    return {
      id: user.getId(),
      username: user.getUsername(),
      password: user.getPassword(),
    };
  }

  #deserialize(row) {
    return new User({
      id: row.id,
      username: row.username,
      password: row.password,
    });
  }
}

export default UserRepositorySqlite;

import DatabaseSqlite3 from "better-sqlite3";
import Database from "../../port/Database.js";

class DatabaseSqlite extends Database {
  #db;

  constructor(databasePath) {
    super();
    this.#db = new DatabaseSqlite3(databasePath);

    this.init();
  }

  get migration() {
    return [
      // --- Create `users` table ---
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
      `,
      // --- Create `matches` table ---
      `
      CREATE TABLE IF NOT EXISTS matches (
        matchId TEXT PRIMARY KEY,
        timestamp TEXT,
        userIdA INTEGER,
        userIdB INTEGER,
        winnerId INTEGER,
        scoreA INTEGER,
        scoreB INTEGER,
        FOREIGN KEY (userIdA) REFERENCES users(id),
        FOREIGN KEY (userIdB) REFERENCES users(id),
        FOREIGN KEY (winnerId) REFERENCES users(id)
      );
      `,
      // --- Create `messages` table ---
      `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        recipientId INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (recipientId) REFERENCES users(id)
      );
      `,

      // --- Create `invitations` table ---
      `
      CREATE TABLE IF NOT EXISTS invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('match', 'tournament', 'friendship')),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id)
      );
      `,

      // --- Create `invitation_recipients` table ---
      `
      CREATE TABLE IF NOT EXISTS invitation_recipients (
        invitationId INTEGER NOT NULL,
        recipientId INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
        PRIMARY KEY (invitationId, recipientId),
        FOREIGN KEY (invitationId) REFERENCES invitations(id) ON DELETE CASCADE,
        FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE
      );
      `,

      // --- Create `friendships` table ---
      `
      CREATE TABLE IF NOT EXISTS friendships (
        user1_id INTEGER,
        user2_id INTEGER,
        PRIMARY KEY (user1_id, user2_id),
        FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
      );`,
      // --- Create `blocked` table ---
      `
      CREATE TABLE IF NOT EXISTS blocked (
        blocker_id INTEGER,
        blocked_id INTEGER,
        PRIMARY KEY (blocker_id, blocked_id),
        FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
      );`,
      // --- Create `notifications` table ---
      `
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        context TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        status INTEGER DEFAULT 0
      );
      `,
      // --- create `notification-recipients` table ---
      `
  CREATE TABLE IF NOT EXISTS notification_recipients (
  notificationId INTEGER NOT NULL,
  recipientId INTEGER NOT NULL,
  type TEXT NOT NULL,
        context TEXT NOT NULL,
        payload TEXT NOT NULL,
  status INTEGER DEFAULT 0
);
`,
    ];
  }

  init() {
    for (const query of this.migration) {
      this.#db.prepare(query).run();
    }
  }

  get connection() {
    return this.#db;
  }
}

export default DatabaseSqlite;

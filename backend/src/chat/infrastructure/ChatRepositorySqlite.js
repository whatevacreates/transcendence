import ChatRepository from '../port/ChatRepository.js';
import ChatMessage from '../domain/ChatMessage.js';

class ChatRepositorySqlite extends ChatRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async save(message) {
    console.log("ChatRepositorySqlite: save");

    if (!message) {
      console.error("ChatRepository: save: message is undefined");
      return null;
    }
    const statement = this.db.prepare(`
            INSERT INTO messages (userId, recipientId, content)
            VALUES (?, ?, ?)
        `);

    const result = statement.run(message.getUserId(), message.getRecipientId(), message.getContent());

    return result.lastInsertRowid;
  }

  // Get global chat last messages: 
  async getLastMessages(limit = 50) {
    const statement = this.db.prepare(`
            SELECT userId, recipientId, content, created_at
            FROM messages
            ORDER BY created_at DESC
            LIMIT ?
        `);

    const rows = statement.all(limit);

    // Map the rows to ChatMessage domain objects 
    return rows.reverse().map(row => new ChatMessage({
      userId: row.userId,
      recipientId: row.recipientId,
      content: row.content,
      createdAt: row.created_at
    }));
  }

  async getPrivateMessages(userId, recipientId, limit = 50) {
    const statement = this.db.prepare(`
            SELECT userId, recipientId, content, created_at
            FROM messages
            WHERE 
                (userId = ? AND recipientId = ?) OR
                (userId = ? AND recipientId = ?)
            ORDER BY created_at DESC
            LIMIT ?
        `);

    const rows = statement.all(userId, recipientId, recipientId, userId, limit);

    return rows.reverse().map(row => new ChatMessage({
      userId: row.userId,
      recipientId: row.recipientId,
      content: row.content,
      createdAt: row.created_at
    }));
  }

  // Get all users that have exchanged messages with logged in user. 
  // By joining the messages table with the users table we get usernames as well
  async getChatPartners(userId) {
    const statement = this.db.prepare(`
            SELECT DISTINCT u.id, u.username
            FROM messages m
            JOIN users u ON u.id = (
                CASE 
                    WHEN m.userId = ? THEN m.recipientId
                    ELSE m.userId
                END
            )
            WHERE m.userId = ? OR m.recipientId = ?
        `)

    const rows = statement.all(userId, userId, userId); // one userId for each placeholder ("?")
    return rows.map(row => ({ id: row.id, username: row.username }));
  }
}

export default ChatRepositorySqlite;

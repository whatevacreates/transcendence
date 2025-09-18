import BlockRepository from '../port/BlockRepository.js';

class BlockRepositorySqlite extends BlockRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    async blockUser(blockerId, blockedId) {
        const statement = this.db.prepare(`
            INSERT OR IGNORE INTO blocked (blocker_id, blocked_id) VALUES (?, ?)
        `);
        statement.run(blockerId, blockedId);
    }

    async unblockUser(blockerId, blockedId) {
        const statement = this.db.prepare(`
            DELETE FROM blocked WHERE blocker_id = ? AND blocked_id = ?
        `);
        statement.run(blockerId, blockedId);
    }

    async getBlockedUsers(blockerId) {
        const statement = this.db.prepare(`
            SELECT users.id, users.username
            FROM blocked
            JOIN users ON blocked.blocked_id = users.id
            WHERE blocker_id = ?
        `);
        return statement.all(blockerId);
    }

    async getUsersWhoBlocked(userId) {
        const statement = this.db.prepare(`
            SELECT users.id, users.username
            FROM blocked
            JOIN users ON blocked.blocker_id = users.id
            WHERE blocked.blocked_id = ?
        `);
        return statement.all(userId);
    }


    async isBlocked(userA, userB ) {
        const statement = this.db.prepare(`
            SELECT 1 FROM blocked 
            WHERE (blocker_id = ? AND blocked_id = ?) 
            OR (blocker_id = ? AND blocked_id = ?)
        `);
        return !!statement.get(userA, userB , userB , userA); // boolean value 
    }
}

export default BlockRepositorySqlite;
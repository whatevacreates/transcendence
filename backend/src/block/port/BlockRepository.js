
class BlockRepository {
    async blockUser(userId, blockedId) {
        throw new Error("Method 'blockUser' not implemented");
    }

    async unblockUser(userId, blockedId) {
        throw new Error("Method 'unblockUser' not implemented");
    }

    async getBlockedkUsers(userId) {
        throw new Error("Method 'getBlockedUsers' not implemented");
    }
    
    async getUsersWhoBlocked(userId) {
        throw new Error("Method 'getUsersWhoBlocked' not implemented");
    }

    async isBlocked(userA, userB) {
        throw new Error("Method 'isBlocked' not implemented");
    }
}

export default BlockRepository;

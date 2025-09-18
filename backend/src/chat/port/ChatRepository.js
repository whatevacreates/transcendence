class ChatRepository {
    async save(message) {
        throw new Error('Method not implemented');
    }

    async getLastMessages(limit) {
        throw new Error('Method not implemented');
    }

    async getPrivateMessages(userId, recipientId, limit = 50) {
      throw new Error('Method not implemented');
    }
}

export default ChatRepository;

class ChatMessage {
    #userId;
    #recipientId;
    #content;
    #createdAt;

    constructor({ userId, recipientId, content, createdAt = new Date().toISOString() }) {
        this.#userId = userId;
        this.#recipientId = recipientId;
        this.#content = content;
        this.#createdAt = createdAt;
    }

    getUserId() {
        return this.#userId;
    }

    getRecipientId() {
        return this.#recipientId;
    }

    getContent() {
        return this.#content;
    }

    getCreatedAt() {
        return this.#createdAt;
    }
}

export default ChatMessage;

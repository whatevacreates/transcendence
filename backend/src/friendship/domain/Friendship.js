class Friendship {
    #user1Id;
    #user2Id;
    #createdAt;

    constructor(user1Id, user2Id, createdAt = null) {
        this.#user1Id = user1Id;
        this.#user2Id = user2Id;
        this.#createdAt = createdAt;
    }
}

export default Friendship;
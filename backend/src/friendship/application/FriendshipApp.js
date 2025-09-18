class FriendshipApp {
    #friendshipRepository;
    #eventEmitter

    constructor(friendshipRepository, eventEmitter) {
        this.#friendshipRepository = friendshipRepository;
        this.#eventEmitter = eventEmitter;
        //this.#subscribeToFriendshipInvitationAccepted();
    }

    async createFriendship(user1Id, user2Id) {
        const alreadyFriends = await this.#friendshipRepository.areFriends(user1Id, user2Id);
        if (alreadyFriends) {
            throw new Error('Users are already friends');
        }
        await this.#friendshipRepository.saveFriendship(user1Id, user2Id);
    }

    async removeFriendship(user1Id, user2Id) {
        const alreadyFriends = await this.#friendshipRepository.areFriends(user1Id, user2Id);
        if (!alreadyFriends)
            throw new Error('Users are not friends');
        await this.#friendshipRepository.removeFriendship(user1Id, user2Id);
    }

    async checkFriendship(user1Id, user2Id) {
        return await this.#friendshipRepository.areFriends(user1Id, user2Id);
    }

    async getFriends(userId) {
        return await this.#friendshipRepository.getFriendsOfUser(userId);
    }
}

export default FriendshipApp;
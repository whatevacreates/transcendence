class FriendshipRepository {
    async saveFriendship(user1Id, user2Id) {
        throw new Error('saveFriendship() must be implemented');
    }

    async areFriends(user1Id, user2Id) {
        throw new Error('areFriends() must be implemented');
    }

    async getFriendsOfUser(userId) {
        throw new Error('getFriendsOfUser() must be implemented');
    }

    serialize(friendship) {
      throw new Error('Method not implemented');
    }
  
    deserialize(row) {
      throw new Error('Method not implemented');
    }
}

export default FriendshipRepository;


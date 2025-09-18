class FriendshipController {
  #friendshipApp;

  constructor(friendshipApp) {
    this.#friendshipApp = friendshipApp;
  }

  getFriends = async (request, reply) => {
    try {
      const userId = request.user?.id;
      if (!userId) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const friends = await this.#friendshipApp.getFriends(userId);
      return reply.status(200).send(friends);
    } catch (error) {
      console.error("Error in getFriends:", error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  };


  removeFriendship = async (request, reply) => {
    try {
      const user1Id = request.user?.id;
      const { user2Id } = request.body;

      if (!user1Id || !user2Id) {
        return reply.code(400).send({ error: "Missing user ID(s)" });
      }

      await this.#friendshipApp.removeFriendship(user1Id, user2Id);
      return reply
        .code(200)
        .send({ message: "Friendship removed successfully" });
    } catch (err) {
      console.error("Failed to remove friendship:", err.message);
      return reply
        .code(500)
        .send({ error: err.message || "Internal Server Error" });
    }
  };
}

export default FriendshipController;
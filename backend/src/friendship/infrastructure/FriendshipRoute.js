
class FriendshipRoute {
  #fastify;
  #friendshipController;
  #authToken

  constructor(fastify, friendshipController, authToken) {
    this.#fastify = fastify;
    this.#friendshipController = friendshipController;
    this.#authToken = authToken;

    this.#register();
  }

  #register() {
    // get all friends for connected user 
    this.#fastify.get( "/api/friends", { preHandler: [this.#authToken.authTokenVerifier] }, this.#friendshipController.getFriends);
    // Remove a friendship : /api/friendship/remove (POST)
    this.#fastify.post("/api/friendship/remove", { preHandler: [this.#authToken.authTokenVerifier] }, this.#friendshipController.removeFriendship);

  }
}

export default FriendshipRoute;

class TournamentRoute {
  #fastify;
  #tournamentController;
  #authToken

  constructor(fastify, tournamentController, authToken) {
    this.#fastify = fastify;
    this.#tournamentController = tournamentController;
    this.#authToken = authToken;

    this.#register();
  }

  #register() {
    // Get alias
    this.#fastify.get(
      "/api/tournament/alias/:userId",
      { preHandler: [this.#authToken.authTokenVerifier] },
      this.#tournamentController.getAlias.bind(this.#tournamentController)
    );
  }
}

export default TournamentRoute;
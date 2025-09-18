class TournamentController {
  #tournamentApp;

  constructor(tournamentApp) {
    this.#tournamentApp = tournamentApp;

    this.getAlias = this.getAlias.bind(this); // Ensure correct context if needed
  }

  getAlias(req, reply) {
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(userId)) {
      reply.code(400).send({ error: "Invalid userId" });
      return;
    }

    try {
      const alias = this.#tournamentApp.getAlias(userId);
      reply.send({ alias });
    } catch (err) {
      if (err.message.includes("Tournament not found")) {
        reply.code(404).send({ error: `No tournament found for user ${userId}` });
      } else {
        console.error(err);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  }
}

export default TournamentController;

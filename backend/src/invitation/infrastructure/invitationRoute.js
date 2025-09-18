
class InvitationRoute {
  #fastify;
  #invitationController;
  #authToken

  constructor(fastify, invitationController, authToken) {
    this.#fastify = fastify;
    this.#invitationController = invitationController;
    this.#authToken = authToken;

    this.#register();
  }

  #register() {
    // Get all invitations related to the authentified user : /api/invitations (GET)
    // this.#fastify.get("/api/invitations", this.
    // #invitationController.getAllByUserId);

    // Get all invitations (for testing only)
    this.#fastify.get("/api/invitations", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.getAll);

    // Get all invitations related to the authenticated user : /api/invitations/user (GET)
    this.#fastify.get("/api/invitations/user", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.getAllByUserId);

    // Create a new invitation : /api/invitations (POST)
    this.#fastify.post("/api/invitations", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.create);

    // Retrieve details of a specific invitation : /api/invitations/{id}
    this.#fastify.get("/api/invitations/:invitationId", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.getById);

    // Accept an invitation : /api/invitations/{id}/accept (POST)
    this.#fastify.post("/api/invitations/:invitationId/accept", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.accept);

    // Decline an invitation : /api/invitations/{id}/decline (POST)
    this.#fastify.post("/api/invitations/:invitationId/decline", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.decline);

    //Delete a mutual invitation: /api/invitations/delete/mutual-invitation (DELETE)
    this.#fastify.delete("/api/invitations/delete/mutual-invitation", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.deleteMutualInvitation);
    
    // Remove (cancel) an invitation : /api/invitations/{id} (DELETE)
	  this.#fastify.delete("/api/invitations/:invitationId", { preHandler: [this.#authToken.authTokenVerifier] }, this.#invitationController.remove);
  }
}

export default InvitationRoute;
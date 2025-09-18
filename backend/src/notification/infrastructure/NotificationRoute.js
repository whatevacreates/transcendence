class NotificationRoute {
  #fastify;
  #notificationController;
  #authToken;

  constructor(fastify, notificationController, authToken) {
    this.#fastify = fastify;
    this.#notificationController = notificationController;
    this.#authToken = authToken;
    this.#register();
  }
  #register() {
    this.#fastify.get(
      "/api/notifications",
      { preHandler: [this.#authToken.authTokenVerifier] },
      this.#notificationController.getUnreadNotifications,
    );
    this.#fastify.delete("/api/notifications/delete/mutual-invitation", { preHandler: [this.#authToken.authTokenVerifier] }, this.#notificationController.deleteNotifForMutualInvitation);
    this.#fastify.delete("/api/notifications/delete/handled", { preHandler: [this.#authToken.authTokenVerifier] },
      this.#notificationController.deleteHandledNotif);
  }
}

export default NotificationRoute;

class NotificationController {
  #notificationRepository;
  #invitationRepository;

  constructor(notificationRepository, invitationRepository) {
    this.#notificationRepository = notificationRepository;
    this.#invitationRepository = invitationRepository;
  }

  deleteNotifForMutualInvitation = async (request, reply) => {
    try {
      const { userAId, userBId } = request.body;
      if (!userAId || !userBId) {
        reply.code(400).send({ error: "Bad Request" });
      }

      await this.#notificationRepository.deleteNotifForMutualInvitation(
        userAId,
        userBId,
      );
      reply
        .code(200)
        .send({
          message: "Delete notifications of handled invitations successfully",
        });
    } catch (err) {
      console.error(
        "Failed to remove notifications of handled invitations:",
        err.message,
      );
      return reply
        .code(500)
        .send({ error: err.message || "Internal Server Error" });
    }
  };

  deleteHandledNotif = async (request, reply) => {
    try {
      const { notifId, recipientId } = request.body;
      if (typeof notifId !== "number" || typeof recipientId !== "number") {
        reply
          .code(400)
          .send({
            error:
              "Bad Request: invalid or missing notification id or recipient id",
          });
      }
      await this.#notificationRepository.deleteHandledNotif(
        notifId,
        recipientId,
      );
      reply
        .code(200)
        .send({ message: "Delete handled notifications successfully" });
    } catch (err) {
      console.error("Failed to remove handled notifications:", err.message);
      return reply
        .code(500)
        .send({ error: err.message || "Internal Server Error" });
    }
  };

  getUnreadNotifications = async (request, reply) => {
    try {
      const userId = request.user?.id;

      if (!userId) {
        reply.code(401).send({ error: "Unauthorized" });
      }

      // Use the notification repository instead of raw DB queries
      const notifications =
        await this.#notificationRepository.getUnreadByrecipientId(userId);

      //test
      console.log("user: ", userId);
      console.log("In getUnreadNotications, got notifs: ", notifications);
      console.log("Ready to send mapped notificatiosn to frontend");
      //
      // Transform notifications to the desired response shape
      const response = notifications.map((notification) => {
        const payload = notification.getPayload();
        return {
          interactive: notification.getType() !== "announcement",
          invitationId: payload.invitationId || undefined,
          content: payload.notifMsg,
          user: payload.senderId,
          time: notification.getCreatedAt(),
          context: notification.getContext(),
          notifId: notification.getNotifId(),
        };
      });

      reply.send(response);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  };
}

export default NotificationController;

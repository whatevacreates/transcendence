import NotificationDelivery from "../port/NotificationDelivery.js";
import NotificationTypes from "../domain/NotificationTypes.js";

class NotificationDeliveryWebsocket extends NotificationDelivery {
  #connectionRegistry;

  constructor(connectionRegistry) {
    super();
    this.#connectionRegistry = connectionRegistry;
  }

  async send(notification) {
    const recipientIds = notification.getrecipientIds(); //recipientId is an array
    //test
    console.log("in notification send, recipientIds: ", recipientIds);
    //
    for (const recipientId of recipientIds) {
      const normalizedRecipientId = parseInt(recipientId, 10);
      //test
      console.log("normalizedRecipientId ", normalizedRecipientId);
      console.log(
        "connected users: ",
        this.#connectionRegistry.getConnectedUsers(),
      );
      //
      const connection = this.#connectionRegistry.getConnection(
        normalizedRecipientId,
      );

      if (!connection) {
        console.warn(`User ${normalizedRecipientId} not connnected`);
      }

      const UiPayload = this._extractInfoForClient(notification);
      //test
      console.log("UiPayload of the packet:", UiPayload);
      //
      const packet = {
        domain: "notification",
        type: notification.getType(),
        data: UiPayload,
      };
      if (connection) connection.send(JSON.stringify(packet));
    }
  }

  //transformer method: extract info from backend domain entity to form UI payload which is used in `notificationComponent()`
  _extractInfoForClient(notification) {
    const type = notification.getType();
    const context = notification.getContext();
    const domainPayload = notification.getPayload();
    const notifId = notification.getNotifId();

    if (type === NotificationTypes.INVITATION) {
      return {
        interactive: true,
        content: domainPayload.notifMsg,
        user: domainPayload.senderId,
        time: notification.getCreatedAt(),
        context: context,
        invitationId: domainPayload.invitationId,
        notifId: notifId,
      };
    }

    if (type === NotificationTypes.ANNOUNCEMENT) {
      return {
        interactive: false,
        content: domainPayload.notifMsg,
        user: domainPayload.senderId,
        time: notification.getCreatedAt(),
        context: context,
        notifId: notifId,
      };
    }

    //A default return value
    return {
      interactive: false,
      content: "You received a notification",
      user: domainPayload.senderId,
      time: notification.getCreatedAt(),
      context: context,
      notifId: notifId,
    };
  }
}

export default NotificationDeliveryWebsocket;

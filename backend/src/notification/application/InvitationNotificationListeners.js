import NotificationTypes from "../domain/NotificationTypes.js";
import NotificationContexts from "../domain/NotificationContexts.js";
import Notification from "../domain/Notification.js";

export default function registerInvitationNotificationListeners(
  eventEmitter,
  userRepository,
  notificationApp,
  matchApp
) {
  // --- friendship ---
  eventEmitter.subscribeToInvitation(
    "friendship",
    "created",
    async (invitationId, senderId, recipientId) => {
      //test
      console.log("friendshipInvitationCreated listener triggered");
      console.log("recipientId passed to this listener: ", recipientId);
      //
      const sender = await userRepository.getByUserId(senderId);
      const notification = new Notification({
        recipientIds: recipientId,
        type: NotificationTypes.INVITATION,
        context: NotificationContexts.FRIENDSHIP,
        payload: {
          invitationId: invitationId,
          //senderName: sender.getUsername(),
          senderId: senderId,
          notifMsg: `${sender.getUsername()} sent you a friend request`,
        },
      });
      await notificationApp.notify(notification);
    },
  );

  eventEmitter.subscribeToInvitation(
    "friendship",
    "accepted",
    async (invitationId, senderId, recipientId) => {
      const receiver = await userRepository.getByUserId(recipientId);
      const notification = new Notification({
        recipientIds: [senderId],
        type: NotificationTypes.ANNOUNCEMENT,
        context: NotificationContexts.FRIENDSHIP,
        payload: {
          invitationId: invitationId,
          //senderName: receiver.getUsername(),
          senderId: senderId,
          notifMsg: `${receiver.getUsername()} has accepted your friend request`,
        },
      });
      //test
      console.log("sending `accepted` notification");
      //
      await notificationApp.notify(notification);
    },
  );

  eventEmitter.subscribeToInvitation(
    "friendship",
    "declined",
    async (invitationId, senderId, recipientId) => {
      const receiver = await userRepository.getByUserId(recipientId);
      const notification = new Notification({
        recipientIds: [senderId],
        type: NotificationTypes.ANNOUNCEMENT,
        context: NotificationContexts.FRIENDSHIP,
        payload: {
          invitationId: invitationId,
          //senderName: receiver.getUsername(),
          senderId: recipientId,
          notifMsg: `${receiver.getUsername()} has declined your friend request`,
        },
      });
            //test
      console.log("sending `declined` notification");
      //
      await notificationApp.notify(notification);
    },
  );

  // --- match ---
  eventEmitter.subscribeToInvitation(
    "match",
    "created",
    async (invitationId, senderId, recipientIds) => {
      //test
      console.log("matchInvitationcreated listener triggered");
      //
      const sender = await userRepository.getByUserId(senderId);
      const notification = new Notification({
        recipientIds: recipientIds,
        type: NotificationTypes.INVITATION,
        //type: NotificationTypes.ANNOUNCEMENT,
        context: NotificationContexts.MATCH,
        payload: {
          invitationId: invitationId,
          senderId: senderId,
          notifMsg: `${sender.getUsername()} sent you a match invitation`,
        },
      });
      await notificationApp.notify(notification);
    },
  );

  eventEmitter.subscribeToInvitation("match", "accepted", async (invitationId, senderId, recipientIds) => {
    
        console.log(
          `InvitationNotificationListeners: starting a match from invitation: ${invitationId} with players: ${senderId} and ${recipientIds}`
        );
        const recipientId = recipientIds[0];
        matchApp.initAndStartMatch("remote", senderId, recipientId);
      }
    );

    eventEmitter.subscribeToInvitation(
    "match",
    "declined",
    async (invitationId, senderId, recipientIds) => {
      const recipientId = recipientIds[0];
      const receiver = await userRepository.getByUserId(recipientId);
      const notification = new Notification({
        recipientIds: [senderId],
        type: NotificationTypes.ANNOUNCEMENT,
        context: NotificationContexts.MATCH,
        payload: {
          invitationId: invitationId,
          senderId: recipientId,
          notifMsg: `${receiver.getUsername()} has declined your match invitation`,
        },
      });
            //test
      console.log("sending `declined` notification");
      //
      await notificationApp.notify(notification);
    },
  );

   // --- tournament ---
  eventEmitter.subscribeToInvitation(
    "tournament",
    "created",
    async (invitationId, senderId, recipientIds) => {
      //test
      console.log("tournamentInvitationcreated listener triggered");
      //
      const sender = await userRepository.getByUserId(senderId);
      const notification = new Notification({
        recipientIds: recipientIds,
        type: NotificationTypes.INVITATION,
        // type: NotificationTypes.ANNOUNCEMENT,
        context: NotificationContexts.TOURNAMENT,
        payload: {
          invitationId: invitationId,
          //senderName: sender.getUsername(),
          senderId: senderId,
          notifMsg: `${sender.getUsername()} sent you a tournament invitation`,
        },
      });
      await notificationApp.notify(notification);
    },
  );
}

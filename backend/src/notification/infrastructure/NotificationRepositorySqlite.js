import NotificationRepository from "../port/NotificationRepository.js";
import Notification from "../domain/Notification.js";

class NotificationRepositorySqlite extends NotificationRepository {
  #db;

  constructor(db) {
    super();
    this.#db = db;
  }

  save(notification) {
    if (!notification) throw new Error("Notification is undefined");

    const dto = this.serialize(notification);

    try {
      const statNotif = this.#db.prepare(`
        INSERT INTO notifications ( type, context, payload, status)
        VALUES ( ?, ?, ?, ?)
      `);

      const result = statNotif.run(
        dto.type,
        dto.context,
        dto.payload,
        dto.status,
      );

      //test
      console.log("notification saved with id: ", result.lastInsertRowid);
      //
      const stateNotifRecipient = this.#db.prepare(`
        INSERT INTO notification_recipients (notificationId, recipientId, type, context, payload, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const recipientIds = dto.recipientIds;
      for (const recipientId of recipientIds) {
        stateNotifRecipient.run(
          result.lastInsertRowid,
          recipientId,
          dto.type,
          dto.context,
          dto.payload,
          dto.status,
        );
      }
      return result.lastInsertRowid;
    } catch (err) {
      console.error("SQLite error when saving notification: ", err);
      throw new Error("Database failed to save notification");
    }
  }

  getById(id) {
    const row = this.#db
      .prepare("SELECT * FROM notifications WHERE id = ?")
      .get(id);

    return row ? this.deserialize(row) : null;
  }

  getUnreadByrecipientId(recipientId) {
    const statement = this.#db.prepare(`
      SELECT *
      FROM notification_recipients
      WHERE recipientId = ?
      AND status = 0
      ORDER BY notificationId ASC
    `);

    const rows = statement.all(recipientId);

    return rows.map((row) => this.deserialize(row));
  }

  async deleteNotifForMutualInvitation(userAId, userBId) {
    //test
    console.log("in deleteNotifForMutualInvitation");
    //
    // B->A invitation is removed at A's acceptance.
    // //Step 1: Find the A -> B invitation
    const invitationStmt = this.#db.prepare(`
    SELECT inv.id AS id
    FROM invitations AS inv
    JOIN invitation_recipients AS rec ON inv.id = rec.invitationId
    WHERE inv.senderId = ?
      AND rec.recipientId = ?
      AND inv.type = 'friendship'
  `);
    const invitation = invitationStmt.get(userAId, userBId);
    if (!invitation) {
      return; // No mutual invitation, nothing to delete
    }
    const invitationId = invitation.id;
    //test
    console.log("Found mutual invitation, id: ", invitationId);
    //
    // Step 2: Find matching notifications
    const notifIdsStmt = this.#db.prepare(`
    SELECT id FROM notifications
    WHERE context = 'friendship'
      AND type = 'invitation'
      AND json_extract(payload, '$.invitationId') = ?
  `);
    const notifIds = notifIdsStmt.all(invitationId);

    if (!notifIds.length) return;

    const ids = notifIds.map((row) => row.id);

    // Step 3: Prepare deletion
    const notifRecipientStmt = this.#db.prepare(`
    DELETE FROM notification_recipients WHERE notificationId = ?
  `);
    const notifStmt = this.#db.prepare(`
    DELETE FROM notifications WHERE id = ?
  `);

    const transaction = this.#db.transaction(() => {
      for (const id of ids) {
        //test
        console.log("deleting notification, id: ", id);
        //
        notifRecipientStmt.run(id);
        notifStmt.run(id);
      }
    });

    transaction();
  }

  async deleteHandledNotif(notifId, recipientId) {
    //test
    console.log(
      "in DELETEHANDLEDNOTIF, deleting notification of id: ",
      notifId,
    );
    console.log("deleting in notification_recipients, recipientId: ", recipientId);
    //
    const notifRecipientsStmt = this.#db.prepare(`
      DELETE FROM notification_recipients WHERE notificationId = ? AND recipientId = ?
    `);

    const notifStmt = this.#db.prepare(`
      DELETE FROM notifications WHERE id = ?
    `);

    const transaction = this.#db.transaction(() => {
      notifRecipientsStmt.run(notifId, recipientId);
      notifStmt.run(notifId);
    });
    transaction();
  }

  serialize(notification) {
    return {
      recipientIds: notification.getrecipientIds(),
      type: notification.getType(),
      context: notification.getContext(),
      payload: JSON.stringify(notification.getPayload()),
      status: notification.getStatus(),
    };
  }

  deserialize(row) {
    return new Notification({
      id: row.notificationId,
      recipientId: row.recipientId,
      type: row.type,
      context: row.context,
      payload: JSON.parse(row.payload),
      read: row.status,
      createdAt: row.createdAt,
    });
  }
}

export default NotificationRepositorySqlite;

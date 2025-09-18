import InvitationRepository from "../port/InvitationRepository.js";

class InvitationRepositorySqlite extends InvitationRepository {
  #db;

  constructor(db) {
    super();
    this.#db = db;
  }

  // --- Invitations ---
  save(invitation) {
    const statement = this.#db.prepare(`
      INSERT INTO invitations (senderId, type)
      VALUES (?, ?)
    `);

    const dto = this.serialize(invitation);

    console.log(
      `InvitationRepositorySqlite: ${dto.senderId}, ${dto.type}`,
    );

    const result = statement.run(dto.senderId, dto.type);
    const invitationId = result.lastInsertRowid;
    this.#saveRecipients(dto.recipientIds, invitationId);

    return invitationId;
  }

  #saveRecipients(recipientIds, invitationId) {
    const statement = this.#db.prepare(`
      INSERT INTO invitation_recipients (invitationId, recipientId)
      VALUES (?, ?)
    `);

    const insertMany = this.#db.transaction((recipientIds) => {
      for (const recipientId of recipientIds) {
        statement.run(invitationId, recipientId);
      }
    });

    insertMany(recipientIds);
  }

  remove(invitationId) {
    const statement = this.#db.prepare(`
      DELETE FROM invitations
      WHERE id = ?
    `);

    statement.run(invitationId);
  }

  deleteMutualInvitation(userAId, userBId) {
     //test
  console.log("******in deleteMutualInvitation");
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
    return; 
  }
  const invitationId = invitation.id;
//test
console.log("Found mutual invitation, id: ", invitationId);
//

  // Step 2: Prepare deletion
  const invStmt = this.#db.prepare(`DELETE FROM invitations WHERE id = ?`);
  const invRecipientStmt = this.#db.prepare(`DELETE FROM invitation_recipients WHERE invitationId = ?`);

  const transaction = this.#db.transaction(() => {
    //test
    console.log("deleting invitation, id: ", invitationId);
    //
    invStmt.run(invitationId);
    invRecipientStmt.run(invitationId);
  });

  transaction();
  }

  getAll() {
    const statement = this.#db.prepare(`
      SELECT * FROM invitations
    `);

    const rows = statement.all();

    if (!rows.length) {
      return [];
    }

    return rows.map((row) => this.deserialize(row));
  }

  getById(invitationId) {
    const statement = this.#db.prepare(`
      SELECT * FROM invitations
      WHERE id = ?
    `);

    const row = statement.get(invitationId);

    if (!row) {
      return null;
    }

    return this.deserialize(row);
  }

  /*
   * Checks if a pending invitation (of a given type) already exists between two given users 
   */
  existsBetweenUsers(userId1, userId2, type = null) {
    if (type && !['match', 'tournament', 'friendship'].includes(type)) {
      throw new Error(`Invalid invitation type: ${type}`);
    }

  console.log('Checking existsBetweenUsers:', { userId1, userId2, type });
  
  let query = `
    SELECT 1
    FROM invitations AS i
    JOIN invitation_recipients AS ir ON i.id = ir.invitationId
    WHERE (
      (i.senderId = CAST(? AS INTEGER) AND ir.recipientId = CAST(? AS INTEGER))
      OR
      (i.senderId = CAST(? AS INTEGER) AND ir.recipientId = CAST(? AS INTEGER))
    )
    AND ir.status = 'pending'
  `;
  
  const params = [userId1, userId2, userId2, userId1];

  if (type) {
    query += ` AND i.type = ?`;
    params.push(type);
  }

  query += ` LIMIT 1`;
  
  console.log('Executing query:', query);
  console.log('With params:', params);
  
  const row = this.#db.prepare(query).get(...params);
  console.log('Query result:', row);
  
  return !!row;
  }

  // --- Recipients ---
  getRecipients(invitationId) {
    const statement = this.#db.prepare(`
      SELECT recipientId, status
      FROM invitation_recipients
      WHERE invitationId = ?
    `);
    return statement.all(invitationId);
  }

  updateRecipientStatus(invitationId, recipientId, status) {
    if (!['pending', 'accepted', 'declined'].includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be 'pending', 'accepted', or 'declined'.`);
    }

    const statement = this.#db.prepare(`
      UPDATE invitation_recipients
      SET status = ?
      WHERE invitationId = ? AND recipientId = ?
    `);

    const result = statement.run(status, invitationId, recipientId);

    if (result.changes === 0) {
      throw new Error(`No recipient found for invitationId=${invitationId} and recipientId=${recipientId}`);
    }

    console.log(`Status updated to "${status}" for invitationId=${invitationId}, recipientId=${recipientId}`);
  }

  allRecipientsAccepted(invitationId) {
    const statement = this.#db.prepare(`
      SELECT COUNT(*) AS pendingOrDeclined
      FROM invitation_recipients
      WHERE invitationId = ?
        AND status != 'accepted'
    `);

    const result = statement.get(invitationId);

    return result.pendingOrDeclined === 0;
  }

  countRecipients(invitationId) {
    return this.getRecipientIds(invitationId).length;
  }

  removeRecipient(invitationId, recipientId) {
    console.log(`removeRecipient: invitationId ${invitationId} recipientId: ${recipientId}`);

    const statement = this.#db.prepare(`
      DELETE FROM invitation_recipients
      WHERE invitationId = ?
        AND recipientId = ?
    `);

    statement.run(invitationId, recipientId);
  }

  existsTournamentInvitation(senderId, recipientIds) {
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return false;
    }
  
    // Convert senderId and recipientIds to numbers
    const numSenderId = Number(senderId);
    const numRecipientIds = recipientIds.map(id => Number(id));
    const count = numRecipientIds.length;
    
    const placeholders = numRecipientIds.map(() => '?').join(',');
    const params = [numSenderId, 'tournament', count, ...numRecipientIds, count];
  
    const query = `
      SELECT i.id
      FROM invitations i
      JOIN invitation_recipients ir ON i.id = ir.invitationId
      WHERE i.senderId = ?
        AND i.type = ?
      GROUP BY i.id
      HAVING COUNT(ir.recipientId) = ?
        AND COUNT(CASE WHEN ir.recipientId IN (${placeholders}) THEN 1 END) = ?
    `;
  
    try {
      const row = this.#db.prepare(query).get(...params);
      return !!row;
    } catch (error) {
      console.error('Database error in existsTournamentInvitation:', error);
      throw error; // Will be caught by controller's try-catch
    }
  }

  // --- Serialize / deserialize ---
  serialize(invitation) {
    // Domain -> DTO
    return {
      id: invitation.id,
      senderId: invitation.senderId,
      recipientIds: invitation.recipientIds,
      type: invitation.type,
      isHandled: invitation.isHandled,
      createdAt: invitation.createdAt,
    };
  }

  deserialize(row) {
    // DB row -> DTO
    const recipientData = this.getRecipients(row.id);

    return {
      id: row.id,
      senderId: row.senderId,
      recipientIds: recipientData.map(r => r.recipientId),
      recipientStatuses: recipientData.map(r => r.status),
      type: row.type,
      createdAt: row.created_at,
    };
  }
}

export default InvitationRepositorySqlite;

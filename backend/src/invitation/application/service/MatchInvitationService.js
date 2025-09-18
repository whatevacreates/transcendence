import MatchInvitation from '../../domain/MatchInvitation.js';

class MatchInvitationService {
  #invitationApp;
  #matchApp;

  constructor(invitationApp, matchApp) {
    this.#invitationApp = invitationApp;
    this.#matchApp = matchApp;
  }

  createInvitation(senderId, recipientIds) {
	console.log("MatchInvitationService: createInvitation");

    if (!senderId || !recipientIds) {
        throw new Error("senderId and recipientIds must be provided.");
    }

    if (!Array.isArray(recipientIds) && recipientIds.length != 1) {
      throw new Error("recipientIds must be an array with one element");
    }

	const recipientId = recipientIds[0];

    // Check if users are already in a match against each other
    const areInMatch = this.#matchApp.matchExists(senderId, recipientId);
	  console.log(`MatchInvitationService: areInMatch: ${areInMatch}`);

    if (areInMatch) {
      throw new Error("Users are already in a match against each other.");
    }

    // Check if a match request has already been sent
    const alreadySent = this.#invitationApp.existsBetweenUsers(senderId, recipientId, 'match');
	console.log(`MatchInvitationService: alreadySent: ${alreadySent}`);
    if (alreadySent) {
      throw new Error("A match invitation has already been sent.");
    }

    const invitation = new MatchInvitation(senderId, recipientId);
    return this.#invitationApp.saveAndSend(invitation);
  }

  accept(invitationId, recipientId) {
    // Delegate acceptance to InvitationApp
    // The actual match creation happens in an event listener subscribed to 'matchInvitationAccepted'
    this.#invitationApp.accept(invitationId, recipientId, false); // REVISIT: must be true to check hasExpired()
    return true;
  }

  async decline(invitationId, recipientId) {
    this.#invitationApp.decline(invitationId, recipientId, false); // REVISIT: must be true to check hasExpired()
    return true;
  }
}

export default MatchInvitationService;

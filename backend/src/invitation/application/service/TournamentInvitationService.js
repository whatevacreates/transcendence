import TournamentInvitation from "../../domain/TournamentInvitation.js";

class TournamentInvitationService {
  #invitationApp;
  #invitationRepository;
  #eventEmitter;

  constructor(invitationApp, invitationRepository, eventEmitter) {
    this.#invitationApp = invitationApp;
    this.#invitationRepository = invitationRepository;
    this.#eventEmitter = eventEmitter;
  }

  async createInvitation(senderId, recipientIds) {
    if (!senderId || !recipientIds) {
      throw new Error("senderId and recipientIds must be provided.");
    }
  
    if (!Array.isArray(recipientIds) || recipientIds.length !== 3) {
      throw new Error("recipientIds must be an array with 3 elements");
    }
  
    if (this.#hasDuplicates(recipientIds)) {
      throw new Error("recipientIds cannot contain duplicates");
    }
  
    // Check for existing tournament invitation
    const alreadyExists = await this.#invitationRepository.existsTournamentInvitation(
      senderId, 
      recipientIds
    );
    
    if (alreadyExists) {
      throw new Error("A tournament invitation has already been sent to the same recipients.");
    }
  
    const invitation = new TournamentInvitation(senderId, recipientIds);
    return this.#invitationApp.saveAndSend(invitation);
  }

  accept(invitationId, recipientId) {
    /*
     * Tournament invitation has its own logic (that is different from match and friendship invitation)
     * That's why the `accept` logic CANNOT be delegated to invitationApp
     * When a recipient accepts a tournament invitation, the recipient is removed from the database
     * When there are no more recipients in the database, it means all recipients have accepted
     * We can emit an event and remove the tournament invitation from the database
     * The actual tournament creation happens in an event listener subscribed to that event
     */

    //const invitation = this.#invitationApp.fetchAndValidate(invitationId, true);

    // Remove the recipient that has accepted the invitation
    //this.#invitationRepository.removeRecipient(invitationId, recipientId);
    
    // If all recipients have accepted the tournament invitation

    /*if (invitation.recipientCount == 1) {
      console.log("Tournament invitation accepted by all players");
      this.#eventEmitter.emitInvitationEvent("accepted", invitation);
      this.#invitationRepository.remove(invitationId);
    }*/

    this.#invitationApp.accept(invitationId, recipientId, false);

    return true;
  }

  decline(invitationId, recipientId) {
    /* Tournament invitation has its own logic (that is different from match and friendship invitation)
     * That's why `decline` logic CANNOT be delegated to invitationApp
     * When a recipient declines a tournament invitation, the whole tournament invitation is canceled
     */

    const invitation = this.#invitationApp.fetchAndValidate(invitationId, true);
    console.log("Tournament invitation declined by one player, tournament invitation deleted");
    this.#eventEmitter.emitInvitationEvent("declined", invitation);
    this.#invitationRepository.remove(invitationId);

    return true;
  }

  #hasDuplicates(array) {
      const seen = new Set();
      for (const item of array) {
        if (seen.has(item)) {
          return true;
        }
        seen.add(item);
      }
      return false;
    }
}

export default TournamentInvitationService;

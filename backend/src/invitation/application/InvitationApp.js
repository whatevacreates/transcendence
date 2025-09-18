import Invitation from "../domain/Invitation.js";

class InvitationApp {
  #invitationRepository;
  #eventEmitter;

  constructor(invitationRepository, eventEmitter) {
    this.#invitationRepository = invitationRepository;
    this.#eventEmitter = eventEmitter;
  }

  saveAndSend(invitation) {
    if (!(invitation instanceof Invitation)) {
      throw new Error("Invalid invitation instance");
    }

    const id = this.#invitationRepository.save(invitation);
    invitation.setId(id);
    this.#eventEmitter.emitInvitationEvent("created", invitation);
    //test
    console.log("invitation created, event emitted, type ", invitation.type);
    //
    return invitation;
  }

  // Private helper for fetching and validating invitation with timeout check
  fetchAndValidate(invitationId, withTimeout = false) {
    const dto = this.#invitationRepository.getById(invitationId);
	if (!dto) throw new Error("Invitation not found");

	const invitation = new Invitation(
      dto.id,
      dto.senderId,
      dto.recipientIds,
      dto.type,
      dto.createdAt,
    );

	// Remove the invitation if it has expired
    if (withTimeout && invitation.hasExpired()) {
      this.#eventEmitter.emitInvitationEvent("expired", invitation);
      this.#invitationRepository.remove(invitationId);
      throw new Error("Invitation has expired");
    }

    return invitation;
  }

  accept(invitationId, recipientId, withTimeout = false) {
    const invitation = this.fetchAndValidate(invitationId, withTimeout);
    this.#invitationRepository.updateRecipientStatus(invitationId, recipientId, 'accepted');

    // Check if all recipients of a given invitation have accepted
    if (this.#invitationRepository.allRecipientsAccepted(invitationId)) {
      this.#eventEmitter.emitInvitationEvent("accepted", invitation);
      this.#invitationRepository.remove(invitationId);
      //test
      console.log("invitation accepted, removed invitation from database")
      //
    }

    return invitation;
  }

  decline(invitationId, recipientId, withTimeout = false) {
    const invitation = this.fetchAndValidate(invitationId, withTimeout);

    this.#eventEmitter.emitInvitationEvent("declined", invitation);
    this.#invitationRepository.remove(invitationId);
         //test
      console.log("invitation declined, removed invitation from database")
      //
  }

  
  deleteMutual(userAId, userBId) {
    this.#invitationRepository.deleteMutualInvitation(userAId, userBId);
  }

  getAll() {
    return this.#invitationRepository.getAll();
  }

  getById(invitationId) {
    return this.#invitationRepository.getById(invitationId);
  }

  existsBetweenUsers(senderId, recipientId, type) {
    return this.#invitationRepository.existsBetweenUsers(senderId, recipientId, type);
  }

  remove(invitationId) {
	  this.#invitationRepository.remove(invitationId);
  }

}

export default InvitationApp;

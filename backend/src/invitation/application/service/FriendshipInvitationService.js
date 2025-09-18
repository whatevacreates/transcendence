import Invitation from "../../domain/Invitation.js";
class FriendshipInvitationService {
  #invitationApp;
  #friendshipApp;

  constructor(invitationApp, friendshipApp) {
    this.#invitationApp = invitationApp;
    this.#friendshipApp = friendshipApp;
  }

  async createInvitation(senderId, recipientIds) {
    if (!senderId || !recipientIds) {
        throw new Error("senderId and recipientIds must be provided.");
    }

    if (!Array.isArray(recipientIds) && recipientIds.length != 1) {
      throw new Error("recipientIds must be an array with one element");
    }

    const recipientId = recipientIds[0];
    
    const alreadyFriends = await this.#friendshipApp.checkFriendship(senderId, recipientId);
    if (alreadyFriends) {
      const error = new Error('Users are already friends');
      error.code = 'ALREADY_FRIENDS';
      throw error;
    }
  
    /*
    const alreadySent = await this.#invitationApp.existsBetweenUsers(senderId, recipientId, 'friendship');
    if (alreadySent) {
      const error = new Error('A friendship invitation has already been sent');
      error.code = 'INVITATION_EXISTS';
      throw error;
    }*/
  
    const invitation = new Invitation(null, senderId, recipientIds, 'friendship');
    return this.#invitationApp.saveAndSend(invitation);
  }

  async accept(invitationId, recipientId) {
    // Delegate acceptance to InvitationApp
    // The actual friendship creation happens in an event listener subscribed to 'friendshipInvitationaccepted'
    this.#invitationApp.accept(invitationId, recipientId, false);

    return true;
  }

  decline(invitationId, recipientId) {
    this.#invitationApp.decline(invitationId, recipientId, false);
    return true;
  }
}

export default FriendshipInvitationService;
 
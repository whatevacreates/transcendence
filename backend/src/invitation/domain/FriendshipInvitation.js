import Invitation from './Invitation.js';

class FriendshipInvitation extends Invitation {
  constructor(senderId, recipientId) {
    super(null, senderId, [recipientId], 'friendship', null);
  }
}

export default FriendshipInvitation;

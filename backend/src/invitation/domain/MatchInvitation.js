import Invitation from './Invitation.js';

class MatchInvitation extends Invitation {
  constructor(senderId, recipientId) {
    super(null, senderId, [recipientId], 'match', null);
  }
}

export default MatchInvitation;

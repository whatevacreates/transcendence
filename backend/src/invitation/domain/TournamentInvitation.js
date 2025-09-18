import Invitation from './Invitation.js';

class TournamentInvitation extends Invitation {
  constructor(senderId, recipientIds) {
    super(null, senderId, recipientIds, 'tournament', null);
  }
}

export default TournamentInvitation;

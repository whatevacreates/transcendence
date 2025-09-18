import MatchBroadcast from '../port/MatchBroadcast.js';
import ConnectionRegistry from '../../shared/infrastructure/websocket/RegistryWebsocket.js';

class MatchBroadcastWebsocket extends MatchBroadcast {
  #matchRegistry;

  // REVISIT: save sockets so we don't have too lookup each time in ConnectionRegistry

  constructor(matchRegistry) {
    super();
    this.#matchRegistry = matchRegistry;
  }

  broadcast(matchId, type, data) {

    const message = {
      domain: "game",
      type: type,
      data: data
    }
    
    const match = this.#matchRegistry.get(matchId);
    if (!match) {
      console.error(`Match with matchId ${matchId} not found in matchRegistry. Unable to broadcast message.`);
      return;
    }

    const userIds = match.getUserIds();
    ConnectionRegistry.sendToUsers(userIds, message);
  }

  sendToUser(userId, type, data) {

    const message = {
      domain: "game",
      type: type,
      data: data
    }
  
    ConnectionRegistry.sendToUser(userId, message);
  }
}

export default MatchBroadcastWebsocket;
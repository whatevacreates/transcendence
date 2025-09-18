import TournamentBroadcast from '../port/TournamentBroadcast.js';
import ConnectionRegistry from '../../shared/infrastructure/websocket/RegistryWebsocket.js';

class TournamentBroadcastWebsocket extends TournamentBroadcast {
  constructor() {
    super();
  }

  broadcast(userIds, type, data) {
    const message = {
      domain: "game",
      type: type,
      data: data
    }
    console.log("TournamentBroadcastWebsocket: ", message);
    ConnectionRegistry.sendToUsers(userIds, message);
  }
}

export default TournamentBroadcastWebsocket;
import Match from '../domain/entity/Match.js';
import Player from '../domain/entity/Player.js';
import JsonLoader from '../../shared/infrastructure/json/JsonLoader.js';
import ConnectionRegistry from '../../shared/infrastructure/websocket/RegistryWebsocket.js';


class MatchApp {
  #pongConfig;
  #matchRegistry;
  #matchUpdaterRunner;
  #eventEmitter;
  #matchBroadcast;
  #aiModelData

  constructor(
    matchRegistry,
    matchUpdaterRunner, 
    eventEmitter,
    pongConfig,
    matchBroadcast,
    aiModelData

  ) {
    this.#matchRegistry = matchRegistry;
    this.#matchUpdaterRunner = matchUpdaterRunner;
    this.#eventEmitter = eventEmitter;
    this.#matchBroadcast = matchBroadcast;
    this.#subscribeToMatchInvitationAccepted();
    this.#pongConfig = pongConfig;
    this.#aiModelData = aiModelData;
  }

  #subscribeToMatchInvitationAccepted() {
    this.#eventEmitter.subscribeToInvitation(
      "match", // type
      "accepted", // event
      (invitationId, senderId, recipientIds) => {
        console.log(
          `MatchApp: starting a match from invitation: ${invitationId} with players: ${senderId} and ${recipientIds}`
        );
        const recipientId = recipientIds[0];
        this.initAndStartMatch("remote", senderId, recipientId);
      }
    );
  }

  async initAndStartMatch(matchType, userIdA, userIdB = null) {
    console.log(`MatchApp: initAndStartMatch: matchType: ${matchType} userIdA: ${userIdA} userIdB: ${userIdB}`);

    let playerA = new Player(userIdA);
    let playerB;

    switch(matchType) {
      case "ai":
        playerB = new Player(null, true);
        playerA.alias = null;
        playerB.alias = null;
        break;
      case "local":
        playerB = new Player(userIdA, false);
        playerA.alias = null;
        playerB.alias = null;
        break;
      case "remote":
        if (!userIdB) throw new Error("Remote match requires two user IDs");
        playerB = new Player(userIdB)
        break;
      case "tournament":
        if (!userIdB) throw new Error("Tournament match requires two user IDs");
        playerB = new Player(userIdB)
        break;
    }

    // Match init
    const matchId = await this.initMatch(matchType, playerA, playerB);

    // Redirect to pong page
    console.log("match-redirect");
    this.#matchBroadcast.broadcast(matchId, "match-redirect", {});

    // Short delay to allow clients to connect to match channel
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Broadcast match-init AFTER clients have connected
    this.#matchBroadcast.broadcast(matchId, "match-init", {
      matchId: matchId,
      matchType: matchType,
      userIdA: playerA.userId,
      userIdB: playerB.userId
    });

    // Match countdown
    await this.#runCountdown(matchId);

    // Start match
    this.startMatch(matchId);
    return matchId;
  }

 initMatch(matchType, playerA, playerB) {
    let userIdA = playerA.userId;
    let userIdB = playerB.userId;

    console.log(`MatchApp: initMatch: playerAId: ${userIdA} playerIdB: ${userIdB}`);

    if (userIdA && this.#matchRegistry.isUserInMatch(userIdA)) {
      console.log(`User ${userIdA} is already in match`);
      return null;
    }

    if (userIdB && this.#matchRegistry.isUserInMatch(userIdB)) {
      console.log(`User ${userIdB} is already in match`);
      return null;
    }

    const match = new Match(matchType, playerA, playerB, this.#pongConfig, this.#aiModelData);
    const matchId = this.#matchRegistry.add(match);

    //this.#matchBroadcast.broadcast(match.id, "match-init", { matchId: matchId, matchType: matchType, userIdA: userIdA, userIdB: userIdB });

    return matchId;
  }

  matchRejoin(userId) {
    //console.log("MatchApp: matchRejoin");

    const match = this.#matchRegistry.getMatchByUser(userId);

    if (!match) {
      return ;
    }
    
    //console.log("MatchApp: matchRejoin: resend match-init");
    this.#matchBroadcast.sendToUser(userId, "match-init", {
      matchId: match.id,
      matchType: match.type,
      userIdA: match.userIdA,
      userIdB: match.userIdB
    });
  }

  async #runCountdown(matchId) {
    console.log(`Countdown started for match: ${matchId}`);
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let countdown = (!this.#pongConfig.game.countdown ||this.#pongConfig.game.countdown < 0 ) ? 9 : this.#pongConfig.game.countdown;
  
    for (let i = countdown; i > 0; i--) {
      console.log(`Countdown: ${i}`);
      this.#matchBroadcast.broadcast(matchId, "match-countdown", i);
      await sleep(1000); // 1 second delay
    }
  }
  
  startMatch(matchId) {
    console.log(`MatchApp: startMatch: ${matchId}`);
    const match = this.#matchRegistry.start(matchId);

    if (!this.#matchUpdaterRunner.isRunning)
      this.#matchUpdaterRunner.start();

    // REVISIT: this is just to test if the event emitter is working
    this.#eventEmitter.subscribeToMatchOver(matchId, (matchId, winnerId, loserId) => console.log(`The match ${matchId} is over and the winner is ${winnerId} and the loser is ${loserId}`));
  }

  movePaddleUp(matchId, userId, paddleIndex = null) {
    const match = this.#matchRegistry.get(matchId);
  
    if (paddleIndex == null || match.type !== "local") {
      paddleIndex = match.getPaddleId(userId);
    }
  
    console.log(`MatchApp: movePaddleUp: matchId: ${matchId} userId: ${userId} paddleIndex: ${paddleIndex}`);
    match.movePaddleUp(paddleIndex);
  }
  

  movePaddleDown(matchId, userId, paddleIndex = null) {
    const match = this.#matchRegistry.get(matchId);
    
    if (paddleIndex == null || match.type !== "local") {
      paddleIndex = match.getPaddleId(userId);
    }

    console.log(`MatchApp: movePaddleDown: matchId: ${matchId} userId: ${userId} paddleIndex: ${paddleIndex}`);
    match.movePaddleDown(paddleIndex);
  }

  movePaddleStop(matchId, userId, paddleIndex = null) {
    const match = this.#matchRegistry.get(matchId);

    if (paddleIndex == null || match.type !== "local") {
      paddleIndex = match.getPaddleId(userId);
    }

    console.log(`MatchApp: movePaddleStop: matchId: ${matchId} userId: ${userId} paddleIndex: ${paddleIndex}`);
    match.movePaddleStop(paddleIndex);
  }

  matchExists(userIdA, userIdB) {
    return this.#matchRegistry.matchExists(userIdA, userIdB);
  }
}

export default MatchApp;
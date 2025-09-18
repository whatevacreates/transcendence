import MatchController from "../port/MatchController.js";

export default class MatchControllerWebsocket extends MatchController {
  #matchApp;
  #tournamentApp;

  constructor(matchApp) {
    super();
    this.#matchApp = matchApp;
  }

  handle(type, data, socket) {
    switch (type) {
      case "init-and-start-match":
        this.onInitAndStartMatch(data, socket);
        break;
      case "control-match":
        this.onControlMatch(data, socket);
        break;
      case "tournament-alias":
        this.tournamentAlias(data, socket);
        break;
      case "match-rejoin":
        this.onMatchRejoin(data, socket);
        break;
      default:
        console.warn("Unknown message type :", type);
        break;
    }
  }

  onInitAndStartMatch(data, socket) {
    //console.log("MatchControllerWebsocket: onInitAndStartMatch");
    const { matchType, userId } = data;
    this.#matchApp.initAndStartMatch(matchType, userId);
  }

  onMatchRejoin(data, socket) {
    console.log("MatchControllerWebsocket: onMatchRejoin");
    const { userId } = data;
    this.#matchApp.matchRejoin(userId);
  }

  onControlMatch(data, socket) {
    const { matchId, userId, control, paddleIndex} = data;

    //console.log(`MatchControllerWebsocket: onControlMatch: ${control} userId: ${userId} paddleIndex: ${paddleIndex}`);

    switch (control) {
      case "move-paddle-up":
        //console.log(`MatchControllerWebsocket: onMovePaddleUp: matchId: ${matchId} userId: ${userId} paddleIndex: ${paddleIndex}`);
        this.#matchApp.movePaddleUp(matchId, userId, paddleIndex);
        break;
      case "move-paddle-down":
        //console.log(`MatchControllerWebsocket: onMovePaddleDown: matchId: ${matchId} userId: ${userId} paddleIndex: ${paddleIndex}`);
        this.#matchApp.movePaddleDown(matchId, userId, paddleIndex);
        break;
      case "move-paddle-stop":
        //console.log(`MatchControllerWebsocket: onMovePaddleStop: matchId: ${matchId} userId: ${userId} paddleIndex: ${paddleIndex}`);
        this.#matchApp.movePaddleStop(matchId, userId, paddleIndex);
        break;
    }
  }

  tournamentAlias(data, socket) {
    const { userId, alias } = data;

    console.log(`userId: ${userId}, alias: ${alias}`)

    this.#tournamentApp.registerAlias(userId, alias);
  }

  set tournamentApp(tournamentApp) {
    this.#tournamentApp = tournamentApp;
  }
}
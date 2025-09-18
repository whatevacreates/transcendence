// --- Json ---
import JsonLoader from "../json/JsonLoader.js";

// --- Route ---
// import WebsocketRoute from "../websocket/WebsocketRoute.js";
// import UserRoute from "../../../user/infrastructure/UserRoute.js";
// import ChatRoute from "../../../chat/infrastructure/ChatRoute.js";
// import InvitationRoute from "../../../invitation/infrastructure/invitationRoute.js";

// --- Event emitter ---
import EventEmitter from "../event/EventEmitter.js";

// --- User context ---
import UserApp from "../../../user/application/UserApp.js";
import UserController from "../../../user/infrastructure/UserController.js";
import UserRepositorySqlite from "../../../user/infrastructure/UserRepositorySqlite.js";

// --- Block context ---
import BlockController from "../../../block/infrastructure/BlockController.js";
import BlockRepositorySqlite from "../../../block/infrastructure/BlockRepositorySqlite.js";

// --- Chat context ---
import ChatController from "../../../chat/infrastructure/ChatController.js";
import ChatRepositorySqlite from "../../../chat/infrastructure/ChatRepositorySqlite.js";

// --- Invitation context ---
import FriendshipInvitationService from "../../../invitation/application/service/FriendshipInvitationService.js";
import MatchInvitationService from "../../../invitation/application/service/MatchInvitationService.js";
import TournamentInvitationService from "../../../invitation/application/service/TournamentInvitationService.js";
import InvitationRepositorySqlite from "../../../invitation/infrastructure/InvitationRepositorySqlite.js";
import InvitationApp from "../../../invitation/application/InvitationApp.js";
import InvitationController from "../../../invitation/infrastructure/InvitationController.js";

// --- Friendship context ---
import FriendshipRepository from "../../../friendship/infrastructure/FriendshipRepositorySqlite.js";
import FriendshipApp from "../../../friendship/application/FriendshipApp.js";

// --- Match context ---
import MatchApp from "../../../match/application/MatchApp.js";
import MatchUpdater from "../../../match/application/service/MatchUpdater.js";
import MatchUpdaterRunner from "../../../match/infrastructure/MatchUpdaterRunner.js";
import MatchControllerWebsocket from "../../../match/infrastructure/MatchControllerWebsocket.js";
import MatchControllerHttp from "../../../match/infrastructure/MatchControllerHttp.js";
import MatchBroadcastWebsocket from "../../../match/infrastructure/MatchBroadcastWebsocket.js";
import matchRegistryInMemory from "../../../match/infrastructure/MatchRegistryInMemory.js";
import MatchRepositorySqlite from "../../../match/infrastructure/MatchRepositorySqlite.js";
import MatchControllerAi from '../../../match/infrastructure/MatchControllerAi.js';
import MatchStatsService from '../../../match/application/MatchStatsService.js';

// --- Friendship context ---
//import FriendshipApp from '../../../tournament/application/TournamentApp.js';
import FriendshipController from '../../../friendship/infrastructure/FriendshipController.js';

// --- Tournament context ---
import TournamentApp from "../../../tournament/application/TournamentApp.js";
import TournamentBroadcastWebsocket from "../../../tournament/infrastructure/TournamentBroadcastWebsocket.js";
import TournamentRegistryInMemory from "../../../tournament/infrastructure/TournamentRegistryInMemory.js";
import TournamentController from "../../../tournament/infrastructure/TournamentController.js";

// --- Notification context ---
import NotificationRepository from "../../../notification/infrastructure/NotificationRepositorySqlite.js";
import NotificationController from "../../../notification/infrastructure/NotificationController.js";
import NotificationDeliveryWebsocket from "../../../notification/infrastructure/NotificationDeliveryWebsocket.js";
import NotificationApp from "../../../notification/application/NotificationApp.js";

class Container {
  #dependency = new Map();

  #db;
  #hasher;
  #uuidGenerator;
  #authToken;
  #connectionRegistry;
  #logger;
  #cookie;
  #eventEmitter;

  constructor(
    db,
    hasher,
    uuidGenerator,
    authToken,
    connectionRegistry,
    logger,
    cookie,
  ) {
    this.#db = db.connection;
    this.#hasher = hasher;
    this.#uuidGenerator = uuidGenerator;
    this.#authToken = authToken;
    this.#connectionRegistry = connectionRegistry;
    this.#logger = logger;
    this.#cookie = cookie;
    this.#eventEmitter = new EventEmitter();

    this.set("db", db);
    this.set("hasher", hasher);
    this.set("uuidGenerator", uuidGenerator);
    this.set("authToken", authToken);
    this.set("connectionRegistry", connectionRegistry);
    this.set("logger", logger);
    this.set("eventEmitter", this.#eventEmitter);

    //this.#initializeRoute();

    this.#initializeFriendshipContext();
    this.#initializeUserContext();
    this.#initializeChatContext();
    this.#initializeMatchContext();
    this.#initializeTournamentContext();
    this.#initializeBlockContext();
    this.#initializeInvitationContext();
    this.#initializeNotificationContext();
  }

  set(key, instance) {
    this.#dependency.set(key, instance);
    return this;
  }

  get(key) {
    if (!this.#dependency.has(key)) {
      throw new Error(`Dependency ${key} not found`);
    }
    return this.#dependency.get(key);
  }

  // REVISIT: separate the route from the container ?
  /*#initializeRoute() {
    this.set('websocketRoute', new WebsocketRoute(this));
    this.set('userRoute', new UserRoute());
    this.set('chatRoute', new ChatRoute());
    this.set('invitationRoute', new InvitationRoute());
  }*/

  #initializeUserContext() {
    const userRepository = new UserRepositorySqlite(this.#db);
    const userApp = new UserApp(userRepository);

    const userController = new UserController(
      userRepository,
      userApp,
      this.#hasher,
      this.#authToken,
      this.#logger,
      this.#connectionRegistry,
      this.get("friendshipApp"),
    );
    this.set("userController", userController);
    this.set("userRepository", userRepository);
  }

  #initializeBlockContext() {
    const blockRepository = new BlockRepositorySqlite(this.#db);
    const blockController = new BlockController(blockRepository);

    this.set("blockRepository", blockRepository);
    this.set("blockController", blockController);
  }

  #initializeChatContext() {
    const chatRepository = new ChatRepositorySqlite(this.#db);
    this.set("chatRepository", chatRepository);

    const chatController = ChatController;
    this.set("chatController", chatController);
  }

    #initializeFriendshipContext() {
    const friendshipRepository = new FriendshipRepository(this.#db);
    const friendshipApp = new FriendshipApp(friendshipRepository, this.get('eventEmitter'));
    this.set("friendshipApp", friendshipApp);
    const friendshipController = new FriendshipController(this.get("friendshipApp"));
    this.set("friendshipController", friendshipController);
  }

  #initializeInvitationContext() {
    const invitationRepository = new InvitationRepositorySqlite(this.#db);
    this.set("invitationRepository", invitationRepository);
    const invitationApp = new InvitationApp(
      invitationRepository,
      this.#eventEmitter,
    );

    // Services
    const friendshipInvitationService = new FriendshipInvitationService(
      invitationApp,
      this.get("friendshipApp"),
    );
    const matchInvitationService = new MatchInvitationService(
      invitationApp,
      this.get("matchApp"),
    );
    const tournamentInvitationService = new TournamentInvitationService(
      invitationApp,
      invitationRepository,
      this.#eventEmitter
    );

    const invitationController = new InvitationController(
      invitationApp,
      friendshipInvitationService,
      matchInvitationService,
      tournamentInvitationService,
      this.get("friendshipApp")
    );
    this.set("invitationController", invitationController);
  }

  #initializeNotificationContext() {
    const notificationRepository = new NotificationRepository(this.#db);
    const notificationDelivery = new NotificationDeliveryWebsocket(
      this.get("connectionRegistry"),
    );
    const notificationApp = new NotificationApp(
      notificationRepository,
      notificationDelivery,
    );
    const notificationController = new NotificationController(
      notificationRepository, this.get("invitationRepository"),
    );
    this.set("notificationApp", notificationApp);
    this.set("notificationController", notificationController);
  }

  #initializeMatchContext() {
    
    // --- Match controller AI ---
    let  AI_MODEL_DATA;
    let PONG_CONFIG;
    try {
    PONG_CONFIG = JsonLoader.load('src/match/infrastructure/', 'PongConfig.json');
    } catch (error)
    {     
      throw new Error("You are missing PongConfig.json");
    }


    try {
    AI_MODEL_DATA = JsonLoader.load('src/match/infrastructure/', 'PongAi.json');
    } catch (error)
    {    
      throw new Error("You are missing PongAi.json.");
    }









    const matchControllerAi = new MatchControllerAi(AI_MODEL_DATA);

    
    // --- Registry of active matches ---
    const matchRegistry = matchRegistryInMemory;
    
    // --- Permanent storage of played matches result ---
    const matchRepository = new MatchRepositorySqlite(this.#db);
    
    // --- Match broadcast (broadcasts match state to the frontend) ---
    const matchBroadcast = new MatchBroadcastWebsocket(matchRegistry);
    
    
    // --- Match state updater (loop) ---
    const matchUpdater = new MatchUpdater(matchRegistry, matchBroadcast, matchRepository, this.#eventEmitter, matchControllerAi);
    const matchUpdaterRunner = new MatchUpdaterRunner(matchUpdater);
    
    // --- Match application ---
    const matchApp = new MatchApp(matchRegistry, matchUpdaterRunner, this.#eventEmitter, PONG_CONFIG, matchBroadcast, AI_MODEL_DATA);  
    // --- Match stats ---
    const matchStatsService = new MatchStatsService(matchRepository);
    
    const matchControllerHttp = new MatchControllerHttp(matchApp, matchRepository, this.get("userRepository"), matchStatsService, PONG_CONFIG);

    const matchController = new MatchControllerWebsocket(matchApp);

    this.set("matchController", matchController)
        .set("matchRepository", matchRepository)
        .set("matchStatsService", matchStatsService)
        .set("matchApp", matchApp)
        .set("matchControllerHttp", matchControllerHttp);
  }

  #initializeTournamentContext() {
    const tournamentBroadcast = new TournamentBroadcastWebsocket();
    const tournamentRegistry = new TournamentRegistryInMemory();
    const tournamentApp = new TournamentApp(this.get('matchApp'), this.get('eventEmitter'), tournamentBroadcast, tournamentRegistry);
    const tournamentController = new TournamentController(tournamentApp);

    this.get('matchController').tournamentApp = tournamentApp;

    this.set("tournamentApp", tournamentApp)
        .set("tournamentController", tournamentController);
  }
}

export default Container;

// REVISIT: not set what is not needed ?

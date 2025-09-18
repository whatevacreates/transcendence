import path from "path";
import { fileURLToPath } from "url";
import fastifyStatic from "@fastify/static";

// --- Route ---
import WebsocketRoute from "../websocket/WebsocketRoute.js";
import UserRoute from "../../../user/infrastructure/UserRoute.js";
import ChatRoute from "../../../chat/infrastructure/ChatRoute.js";
import InvitationRoute from "../../../invitation/infrastructure/invitationRoute.js";
import MatchRoute from "../../../match/infrastructure/MatchRoute.js";
import TournamentRoute from "../../../tournament/infrastructure/TournamentRoute.js";
import BlockRoute from "../../../block/infrastructure/BlockRoute.js";
import NotificationRoute from "../../../notification/infrastructure/NotificationRoute.js";
import FriendshipRoute from "../../../friendship/infrastructure/FriendshipRoute.js";

const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

class RouteFastify {
  #fastify;
  #container;
  #frontendDistPath;

  constructor(fastify, container, frontendDistPath) {
    this.#fastify = fastify;
    this.#container = container;
    //this.#frontendDistPath = path.resolve(__dirname, frontendDistPath);
    this.#frontendDistPath = path.resolve(process.cwd(), frontendDistPath);
    console.log(this.#frontendDistPath);

    this.userRoute = new UserRoute(
      this.#fastify,
      container.get("userController"),
      container.get("authToken"),
      
    );
    this.chatRoute = new ChatRoute(
      this.#fastify,
      container.get("chatRepository"),
    );
    this.invitationRoute = new InvitationRoute(
      this.#fastify,
      container.get("invitationController"),
      container.get("authToken"),
    );
    this.matchRoute = new MatchRoute(
      this.#fastify,
      container.get("matchControllerHttp"),
    );
    this.tournamentRoute = new TournamentRoute(
      this.#fastify,
      container.get('tournamentController'),
      container.get("authToken")
    );
    this.blockRoute = new BlockRoute(
      this.#fastify,
      container.get("blockController"),
      container.get("authToken"),
    );
    this.notificationRoute = new NotificationRoute(
      this.#fastify,
      container.get("notificationController"),
      container.get("authToken")
    );
    this.friendshipRoute = new FriendshipRoute(
      this.#fastify,
      container.get("friendshipController"),
      container.get("authToken")
    )
  }

  async register() {
    await this.#registerWebsocket();
    await this.#registerApiRoutes(this.#fastify);
    this.#registerStaticFiles(this.#fastify);
    this.#registerSpaFallback(this.#fastify);
  }

  async #registerWebsocket() {
    const websocketRoute = new WebsocketRoute(
      this.#fastify,
      this.#container.get("authToken"),
      this.#container.get("connectionRegistry"),
      this.#container.get("chatController"),
      this.#container.get("chatRepository"),
      this.#container.get("matchController"),
    );
  }

  async #registerApiRoutes() {
    await Promise.all([
      //this.websocketRoutes.register(this.#fastify),
      //this.userRoutes.register(this.#fastify),
      //this.chatRoutes.register(this.#fastify),
      //this.inviteRoutes.register(this.#fastify)
    ]);
  }

  #registerStaticFiles() {
    this.#fastify.register(fastifyStatic, {
      root: this.#frontendDistPath,
      prefix: "/",
      wildcard: true, // Important for SPA
      decorateReply: true,
    });
  }

  #registerSpaFallback() {
    this.#fastify.setNotFoundHandler((request, reply) => {
      if (request.method === "GET" && this.#shouldServeSpa(request)) {
        return reply
          .code(200)
          .type("text/html")
          .sendFile("index.html", this.#frontendDistPath);
      }
      return reply.code(404).send({ error: "Not Found" });
    });
  }

  #shouldServeSpa(request) {
    const accept = request.headers.accept || "";
    return (
      accept.includes("text/html") &&
      !request.url.startsWith("/api") &&
      !request.url.startsWith("/ws")
    );
  }
}

export default RouteFastify;

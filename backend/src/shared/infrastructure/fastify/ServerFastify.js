import Fastify from "fastify";

// --- Dotenv ---
import 'dotenv/config';

// --- Fastify plugins ---
import fastifyWebsocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
//import fastifyBcrypt from 'fastify-bcrypt';

// --- Path ---
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Dependency injection container ---
import Container from "../container/Container.js";

// --- Shared dependencies ---
import DatabaseSqlite from "../database/DatabaseSqlite.js";
import HasherBcrypt from "../authentication/HasherBcrypt.js";
import UuidGeneratorCrypto from "../uuid/UuidCrypto.js"
import AuthTokenJwt from "../authentication/AuthTokenJwt.js";
import RegistryWebsocket from "../websocket/RegistryWebsocket.js";
import Logger from "../logger/Logger.js";
import fastifyMultipart from '@fastify/multipart';

// --- Route ---
import RouteFastify from "./RouteFastify.js";

// --- event listeners ---
import registerInvitationNotificationListeners from "../../../notification/application/InvitationNotificationListeners.js";

class ServerFastify {
  #host;
  #port;
  #databasePath;
  #frontendDistPath;

  constructor(host, port, databasePath, frontendDistPath) {
    this.#host = host;
    this.#port = port;
    this.#databasePath = databasePath;

    this.#frontendDistPath = path.resolve(__dirname, frontendDistPath);
  }

  async start() {
    // origin address for CORS dependant on prod or dev mode. 
    const originAddress = process.env.RUN_MODE === "dev"
        ? `http://${process.env.SERVER_PUBLIC_HOST}:${process.env.SERVER_PORT}`
        : 'https://localhost:8443';

    console.log("origin Address in Fastify Server: ", originAddress);

    // --- Create Fastify instance ---
    const fastify = Fastify();

    // --- Register Fastify plugins (Fastify plugins need to be registered) ---
    await fastify.register(fastifyWebsocket);
    await fastify.register(fastifyCookie);
    //await fastify.register(fastifyBcrypt);
    await fastify.register(fastifyJwt, {
      secret: process.env.JWT_SECRET,
      cookie: {
        cookieName: 'token',
        signed: false
      }
    });
    await fastify.register(fastifyCors, {
      origin: [originAddress],
      credentials: true
    })
    await fastify.register(fastifyMultipart);

    // --- Initialize shared dependencies ---
    const database = new DatabaseSqlite(this.#databasePath);
    const hasher = new HasherBcrypt();
    const uuidGenerator = new UuidGeneratorCrypto();
    const authToken = AuthTokenJwt;
    const connectionRegistry = RegistryWebsocket;
    const logger = new Logger();

    // --- Initialize container (dependency injection) ---
    const container = new Container(
      database,
      hasher,
      uuidGenerator,
      authToken,
      connectionRegistry,
      logger
    );

    // --- Register event listeners in app bootstrap phase ---
    registerInvitationNotificationListeners(container.get('eventEmitter'), container.get('userRepository'), container.get('notificationApp'), container.get("matchApp"));

    // --- Create RouteFastify instance and register routes ---
    const route = new RouteFastify(fastify, container, this.#frontendDistPath);
    await route.register();

    // --- Add route debug logging ---
    fastify.ready(() => {
      console.log(fastify.printRoutes({ commonPrefix: false }));
    });

    // --- Start the Fastify server ---
    await fastify.listen({ port: this.#port, host: this.#host });
  }
}

export default ServerFastify;
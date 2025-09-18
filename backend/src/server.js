import ServerFastify from "./shared/infrastructure/fastify/ServerFastify.js";

// --- Dotenv ---
import "dotenv/config";

// --- Configuration ---
const host = process.env.SERVER_HOST;
const port = process.env.SERVER_PORT;

const databasePath = process.env.DATABASE_PATH;
const frontendDistPath = process.env.FRONTEND_DIST_PATH;

// --- Create server ---
const server = new ServerFastify(host, port, databasePath, frontendDistPath);

// --- Start server ---
await server.start();

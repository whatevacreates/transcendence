import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MatchRoute {
  #fastify;
  #matchControllerHttp;
  
  constructor(fastify, matchControllerHttp) {
    this.#fastify = fastify;
    this.#matchControllerHttp = matchControllerHttp;
    this.#register();
  }

  #register() {
    this.#fastify.get('/api/match/config', (request, response) => this.#matchControllerHttp.getConfig(request, response));
    this.#fastify.get('/api/match', (request, response) => this.#matchControllerHttp.getAllMatches(request, response));
    this.#fastify.get('/api/match/stats/:userId', (request, response) => this.#matchControllerHttp.getUserStats(request, response));
    this.#fastify.get('/api/match/:userId', (request, response) => this.#matchControllerHttp.getMatchHistory(request, response));
    
    // CLI API 
    this.#fastify.get('/api/match/:id/state', (request, response) => this.#matchControllerHttp.getMatchState(request, response));
    this.#fastify.post('/api/match', (request, response) => this.#matchControllerHttp.startMatch(request, response));
    this.#fastify.post('/api/match/:id/control', (request, response) => this.#matchControllerHttp.controlMatch(request, response));
  }

}

export default MatchRoute;

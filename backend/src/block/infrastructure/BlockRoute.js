class BlockRoute {
    #fastify;
    #blockController;
    #authToken;


    constructor(fastify, blockController, authToken) {
        this.#fastify = fastify;
        this.#blockController = blockController;
        this.#authToken = authToken;
        
        this.#register();
    }

    #register() {
        this.#fastify.get('/api/block/blockUser/:blockedId', { preHandler: this.#authToken.authTokenVerifier }, this.#blockController.blockUser);
        this.#fastify.get('/api/block/unblockUser/:blockedId', { preHandler: this.#authToken.authTokenVerifier }, this.#blockController.unblockUser);
        this.#fastify.get('/api/block/fetchBlockedUsers', { preHandler: this.#authToken.authTokenVerifier }, this.#blockController.getBlockedUsers);
        this.#fastify.get('/api/block/fetchAllBlockedUsers', { preHandler: this.#authToken.authTokenVerifier }, this.#blockController.getAllBlockedUsers);
        this.#fastify.get('/api/block/isBlocked/:blockedId', { preHandler: this.#authToken.authTokenVerifier }, this.#blockController.isBlocked);
    }
}

export default BlockRoute;

class UserRoute {
  #fastify;
  #userController;
  #authToken;

  constructor(fastify, userController, authToken) {
    this.#fastify = fastify;
    this.#userController = userController;
    this.#authToken = authToken;

    this.#register();
  }

  #register() {
    this.#fastify.post('/api/user/register', this.#userController.register);
    this.#fastify.post('/api/user/login', this.#userController.login);
    
    // Protect the logout and close account routes with token verification
    this.#fastify.post('/api/user/logout', { preHandler: [this.#authToken.authTokenVerifier] }, this.#userController.logout);
    // this.#fastify.post('/api/closeAccount', { preHandler: [this.#authToken.authTokenVerifier] }, this.#userController.closeAccount);

    // Verify token optionally for current user route
    this.#fastify.get('/api/user/current-user', { preHandler: [this.#authToken.optionalAuthTokenVerifier] }, this.#userController.currentUserVerify);

    // Other user-related routes
    this.#fastify.get('/api/user/all-users', { preHandler: [this.#authToken.authTokenVerifier] }, this.#userController.getAllUsers);
    this.#fastify.get('/api/user/online-users', { preHandler: [this.#authToken.authTokenVerifier]}, this.#userController.getOnlineUsers);
    this.#fastify.put('/api/user/:userId/update', { preHandler: [this.#authToken.authTokenVerifier] }, this.#userController.updateUser);
    this.#fastify.get('/api/user/avatar/:userId', this.#userController.getAvatar);
    this.#fastify.get('/api/user/username/:userId', this.#userController.getUsername);
    this.#fastify.post('/api/user/avatar', { preHandler: [this.#authToken.authTokenVerifier]}, this.#userController.uploadAvatar);
    // this.#fastify.get('/api/user/get/:userId', this.#userController.getUser);

  }
}

export default UserRoute;

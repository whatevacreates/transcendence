import AuthTokenJwt from "../../shared/infrastructure/authentication/AuthTokenJwt.js";

class ChatRoute {
  #fastify;
  #chatRepository;

  constructor(fastify, chatRepository) {
    this.#fastify = fastify;
    this.#chatRepository = chatRepository;
    this.#register();
  }

  #register() {
    this.#fastify.get('/api/chat/history', this.#getHistory.bind(this));
    this.#fastify.get('/api/chat/private-messages/:recipientId', this.#getPrivateMessages.bind(this));
    this.#fastify.get('/api/chat/conversations', this.#getConversations.bind(this));
  }

  async #getHistory(request, reply) {
    try {
      const messages = await this.#chatRepository.getLastMessages(50);
      
      // Return a structured response
      return messages.map(msg => ({
        userId: msg.getUserId(),
        content: msg.getContent(),
        time: msg.getCreatedAt(),
      }));
    } catch (error) {
      reply.code(500).send({ error: 'Error fetching message history' });
    }
  }

  async #getPrivateMessages(request, reply) {
    try {
      await AuthTokenJwt.authTokenVerifier(request, reply);
      const userId = request.user.id;
      const { recipientId } = request.params;

      const messages = await this.#chatRepository.getPrivateMessages(userId, recipientId);

      return messages.map(msg => ({
        userId: msg.getUserId(),
        content: msg.getContent(),
        time: msg.getCreatedAt(),
      }));
    } catch (error) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  }

  async #getConversations(request, reply) {
    try {
      await AuthTokenJwt.authTokenVerifier(request, reply);
      const userId = request.user.id;
      const partners = await this.#chatRepository.getChatPartners(userId);
      
      return partners;
    } catch (error) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  }
}

export default ChatRoute;
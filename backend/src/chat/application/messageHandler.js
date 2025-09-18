import ChatMessage from '../../chat/domain/ChatMessage.js';

async function messageHandler(data, connectionRegistry, chatRepository) {
  try {    
    const { content, userId, recipientId } = data;

    if (!content || !userId || !recipientId) {
      console.warn("Received invalid message data:", data);
      return;
    }

    // create ChatMessage instance 
    const chatMessage = new ChatMessage({
      userId: userId,
      recipientId: recipientId,
      content: content
    });
    
    // SAVE  into the database
    console.log("saving message in messageRepo: ", chatMessage.getContent());
    await chatRepository.save(chatMessage);

    // get each user's socket connection 
    const senderSocket = connectionRegistry.getConnection(userId);
    console.log("sender socket ID: ", senderSocket.user.id);
    console.log("recipient id in messageHandler: ", recipientId);
    const recipientSocket = connectionRegistry.getConnection(recipientId);
    if (recipientSocket) {
      console.log("recipient socket ID: ", recipientSocket.user.id);
    } else {
      console.log("recipient not logged in.");
    }
    
    const payload = {
      domain: "chat",
      type: "message",
      data: {
        userId,
        content,
        recipientId,
        createdAt: chatMessage.getCreatedAt()
      }
    };

    if (recipientSocket)
        recipientSocket.send(JSON.stringify(payload));

    if (senderSocket && senderSocket != recipientSocket)
        senderSocket.send(JSON.stringify(payload));
    
    } catch (error) {
      console.error("Error in messageHandler", error);
    }
}

export default messageHandler;

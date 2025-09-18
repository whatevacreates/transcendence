import messageHandler from "../application/messageHandler.js";

export const ChatController = {
    handle(type, data, connectionRegistry, chatRepository) {
      switch (type) {
        case "message":
          console.log("ChatController: messageHandler");
          messageHandler(data, connectionRegistry, chatRepository);
          break;
        case "block":
          console.log("ChatController:  block type");
          
          break;
        default:
          console.warn("Unknown message type:", type);
      }
    }
  };

  export default ChatController;

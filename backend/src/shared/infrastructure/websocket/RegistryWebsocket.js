const ConnectionRegistry = {
    connections: new Map(),

    addConnection(userId, socket) {
      if (!this.isConnected(userId)) {
        console.log(`Adding user ${userId} to ConnectionRegistry`);
        this.connections.set(userId, socket);
      }
    },
    
    removeConnection(userId) {
      console.log(`Removing user ${userId} from ConnectionRegistry`);
      this.connections.delete(userId);
    },

    getConnection(userId) {
        return this.connections.get(userId) || null;
    }, 

    getConnectedUsers() {
      return Array.from(this.connections.keys());
    },

    isConnected(userId) {
      return this.connections.has(userId);
    },

    sendToUser(userId, packet) {
      const serializedPacket = JSON.stringify(packet);
      const socket = this.getConnection(userId);
      if (socket) {
        socket.send(serializedPacket);
        //console.log(`Sent to user ${userId}:`, packet);
      } else {
        //console.log(`User ${userId} is not connected.`);
      }
    },

    sendToUsers(userIds, packet) {
      const serializedPacket = JSON.stringify(packet);
    
      // Ensure that userIds are unique using a Set
      const uniqueUserIds = [...new Set(userIds)];
    
      uniqueUserIds.forEach(userId => {
        const socket = this.getConnection(userId);
        if (socket) {
          socket.send(serializedPacket);
          //console.log(`Sent to user ${userId}:`, packet);
        } else {
          //console.log(`User ${userId} is not connected.`);
        }
      });
    }
};

export default ConnectionRegistry;
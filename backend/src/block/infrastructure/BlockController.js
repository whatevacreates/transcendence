class BlockController {
    
    #blockRepository;

    constructor(blockRepository) {
        this.#blockRepository = blockRepository;

        this.blockUser = this.blockUser.bind(this);
        this.unblockUser = this.unblockUser.bind(this);
        this.getBlockedUsers = this.getBlockedUsers.bind(this);
        this.getAllBlockedUsers = this.getAllBlockedUsers.bind(this);
        this.isBlocked = this.isBlocked.bind(this);
    }

    async blockUser(request, response) {
        try {            
            const blockerId = request.user?.id;
            const blockedId = parseInt(request.params.blockedId, 10);

            if (!blockerId || !blockedId || blockerId === blockedId)
                return response.code(400).send({ message: "Invalid blocker or target id"});

            await this.#blockRepository.blockUser(blockerId, blockedId);
            console.log("user ", blockerId, " blocking user ", blockedId);

            return response.send({ message: "User blocked successfully" });
        } catch (error) {
            console.error("BlockUser failed: ", error);
            response.code(500).send({ message: "failed to block user"});
        }
    }


    async unblockUser(request, response) {
        try {
            const blockerId = request.user?.id;
            const blockedId = parseInt(request.params.blockedId, 10);

            if (!blockerId || !blockedId) {
                return response.code(400).send({ message: "Invalid blocker or target ID" });
            }

            await this.#blockRepository.unblockUser(blockerId, blockedId);
            return response.send({ message: "User unblocked successfully" });
        } catch (error) {
            console.error("Unblock user failed:", error);
            response.code(500).send({ message: "Could not unblock user" });
        }
    }


    async getBlockedUsers(request, response) {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return response.code(401).send({ message: "Unauthorized" });
        }
    
        const blocked = await this.#blockRepository.getBlockedUsers(userId);
        return response.send(blocked);  // <-- Important: return with response.send
      } catch (error) {
        console.error("Get blocked users failed:", error);
        response.code(500).send({ message: "Failed to fetch blocked users" });
      }
    }


    async getAllBlockedUsers(request, response) {
      try {
        const userId = request.user?.id;
        if (!userId) {
          return response.code(401).send({ message: "Unauthorized" });
        }

        const [blocked, blockedBy] = await Promise.all([
          this.#blockRepository.getBlockedUsers(userId), 
          this.#blockRepository.getUsersWhoBlocked(userId),  
        ]);

        const allBlockedMap = new Map();
        [...blocked, ...blockedBy].forEach((user) => {
          allBlockedMap.set(user.id, user);
        });

        const allBlocked = Array.from(allBlockedMap.values());

        return response.send(allBlocked);
      } catch (error) {
        console.error("Get All blocked users failed:", error);
        response.code(500).send({ message: "Failed to fetch all blocked users" });
      }
    }

    // checks for both blocking directions
    async isBlocked(request, response) {
        try {
            const userIdA = request.user?.id;
            const userIdB = parseInt(request.params.blockedId, 10);

            if (!userIdA || !userIdB) {
              return response.code(400).send({ message: "Invalid user IDs" });
            }

            const [aBlockedB, bBlockedA] = await Promise.all([
              this.#blockRepository.isBlocked(userIdA, userIdB),
              this.#blockRepository.isBlocked(userIdB, userIdA),
            ]);

            const isBlocked = aBlockedB || bBlockedA;

            return response.send({ isBlocked });
        } catch (error) {
            console.error("isBlocked failed", error);
            return response.code(500).send({ message: "Failed to check block status" })
        }
    }

    // async getBlockRelations(request, response) {
    //   try {
    //     const userId = parseInt(request.params.userId, 10);
    //     if (!userId) {
    //       return response.code(400).send({ message: "Invalid userId" });
    //     }

    //     const [blocked, blockedBy] = await Promise.all([
    //       this.#blockRepository.getBlockedUsers(userId),
    //       this.#blockRepository.getUsersWhoBlocked(userId),
    //     ]);

    //     return response.send({ blocked, blockedBy });
    //   } catch (error) {
    //     console.error("Failed to fetch block relations:", error);
    //     return response.code(500).send({ message: "Internal server error" });
    //   }
    // }

}

export default BlockController;
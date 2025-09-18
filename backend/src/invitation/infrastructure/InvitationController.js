import AuthTokenJwt from '../../shared/infrastructure/authentication/AuthTokenJwt.js'

import FriendshipInvitationService from "../application/service/FriendshipInvitationService.js"; // REVISIT: temporary
import MatchInvitationService from "../application/service/MatchInvitationService.js"; // REVISIT: temporary

class InvitationController {
  #invitationApp;
  #friendshipInvitationService;
  #matchInvitationService;
  #tournamentInvitationService;
  #friendshipApp;

  #typeToService;

  constructor(
    invitationApp,
    friendshipInvitationService,
    matchInvitationService,
    tournamentInvitationService,
    friendshipApp,
  ) {
    this.#invitationApp = invitationApp;
    this.#friendshipInvitationService = friendshipInvitationService;
    this.#matchInvitationService = matchInvitationService;
    this.#tournamentInvitationService = tournamentInvitationService;
    this.#friendshipApp = friendshipApp;

    this.#typeToService = {
      friendship: friendshipInvitationService,
      match: matchInvitationService,
      tournament: tournamentInvitationService,
    };
  }

  // --- Helper to get appropriate service or throw error if not supported ---
  #getService(type) {
    const service = this.#typeToService[type];
    if (!service) {
      throw new Error(`Unsupported invitation type '${type}'`);
    }
    return service;
  }

  // --- Create a new invitation ---
  create = async (request, response) => {
    try {
      const { recipientIds, type } = request.body;
      const senderId = request.user?.id;
      console.log("senderId:", senderId);
      console.log("recipientIds:", recipientIds);
      console.log("type:", type);

      if (!senderId || !recipientIds || !type) {
        return response.status(400).send({
          message: "Bad Request",
        });
      }

      if (!Array.isArray(recipientIds)) {
        return response.status(400).send({
            message: "Bad Request",
          });
      }

      const service = this.#getService(type);
      const invitation = await service.createInvitation(senderId, recipientIds);
      return response.status(201).send(invitation);
    } catch (error) {
      console.error("Error in create:", error);
      return response.status(400).send({ message: error.message });
    }
  };

  // --- Accept an invitation ---
  accept = async (request, response) => {
    try {
      // --- Retrieve the id of the invitation ---
      const { invitationId } = request.params;
      const recipientId = request.user?.id;
      //test
      console.log("In `accept`, retrieve user who accepts invitation id: ", recipientId);
      //
      if (!invitationId) {
        return response.status(400).send({ message: "Bad Request" });
      }

      // --- If the recipient id is missing (the user is not authentified) ---
      if (!recipientId) {
        return response
          .status(400)
          .send({ message: "Missing recipientId" });
      }

      // --- Return the invitation object ---
      const invitation = await this.#invitationApp.getById(invitationId);
      if (!invitation) {
        return response.status(404).send({ message: "Not Found" });
      }

      // Verify the recipient is part of this invitation
      if (!invitation.recipientIds.includes(Number(recipientId))) {
        return response
          .status(403)
          .send({ message: "You are not a recipient of this invitation" });
      }
      const service = this.#getService(invitation.type);
      await service.accept(invitationId, recipientId);

      // For friendship invitations, create the friendship
      if (invitation.type === "friendship") {
        await this.#friendshipApp.createFriendship(
          invitation.senderId,
          recipientId,
        );
      }

      return response.status(200).send({ message: "Invitation accepted" });
    } catch (error) {
      console.error("Error in accept:", error);
      return response.status(400).send({ message: "Bad Request" });
    }
  };

  // --- Decline an invitation ---
  decline = async (request, response) => {
    try {
      const { invitationId } = request.params;
      const recipientId = request.user?.id;
      if (!invitationId) {
        return response
          .status(400)
          .send({ message: "Missing invitationId in URL" });
      }

      const invitation = await this.#invitationApp.getById(invitationId);
      if (!invitation) {
        return response.status(404).send({ message: "Not Found" });
      }

      const service = this.#getService(invitation.type);
      await service.decline(invitationId, recipientId);

      return response.status(200).send({ message: "Invitation declined" });
    } catch (error) {
      console.error("Error in create:", error);
      const knownErrorCodes = ['ALREADY_FRIENDS', 'INVITATION_EXISTS'];
      if (knownErrorCodes.includes(error.code)) {
        return response.status(200).send({ status: error.code, message: error.message });
      }
  return response.status(400).send({ status: 'ERROR', message: 'Bad Request' });
}

  };

  // --- Get all invitations ---
  getAll = async (request, response) => {
    try {
      const invitations = await this.#invitationApp.getAll();
      return response.status(200).send(invitations);
    } catch (error) {
      console.error("Error in getAll:", error);
      return response.status(500).send({ message: "Internal Server Error" });
    }
  };

  // --- Get all invitations related to authenticated user ---  // Added or modified
  getAllByUserId = async (request, response) => {
    try {
      const userId = request.user?.id; // Assuming request.user is set by auth middleware
      if (!userId) {
        return response.status(401).send({ message: "Unauthorized" });
      }

      // Filter invitations by senderId or recipientId
      const invitations = (await this.#invitationApp.getAll()).filter(
        (inv) => inv.senderId === userId || inv.recipientIds.includes(userId),
      );

      return response.status(200).send(invitations);
    } catch (error) {
      console.error("Error in getAllByUserId:", error);
      return response.status(500).send({ message: "Internal Server Error" });
    }
  };

  // --- Get invitation by ID ---
  getById = async (request, response) => {
    try {
      const { invitationId } = request.params;
      if (!invitationId) {
        return response.status(400).send({ message: "Bad Request" });
      }

      const invitation = await this.#invitationApp.getById(invitationId);
      if (!invitation) {
        return response.status(404).send({ message: "Invitation not found" });
      }

      return response.status(200).send(invitation);
    } catch (error) {
      console.error("Error in getById:", error);
      return response.status(500).send({ message: "Internal Server Error" });
    }
  };

	// --- Remove invitation ---
  remove = async (request, response) => {
    try {
      const { invitationId } = request.params;
      if (!invitationId) {
        return response.status(400).send({ message: "Bad Request" });
      }

      const invitation = await this.#invitationApp.getById(invitationId);
      if (!invitation) {
        return response.status(404).send({ message: "Invitation not found" });
      }

	  this.#invitationApp.remove(invitationId);

      return response.status(200).send({ message: "Invitation deleted successfully" });
    } catch (error) {
      console.error("Error in getById:", error);
      return response.status(500).send({ message: "Internal Server Error" });
    }
  };

  //delete a mutual invitation when friendship is settled
  deleteMutualInvitation = async (request, response) => {
    try {
      const { userAId, userBId } = request.body;
            //test
      console.log("InvitationController: deleteMutualInvitation, userAId, userBId: ", userAId, userBId);
      //
      if (!userAId || !userBId) {
        response.code(400).send({ error: "Bad Request" });
      }

      await this.#invitationApp.deleteMutual(userAId, userBId);
      response.code(200).send({ message: "Delete mutual invitation successfully" });
    } catch (err) {
      console.error("Failed to delete mutual invitation:", err.message);
      return response
        .code(500)
        .send({ error: err.message || "Internal Server Error" });
    }
  }
}

export default InvitationController;

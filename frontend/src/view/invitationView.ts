// InvitationView.ts
import dom from "../shared/dom.js";
import api from "../shared/api/api.js";
import createSelect from "../component/shared/selectComponent.js";
import User from "../shared/interface/User.js";
import Invitation from "../shared/interface/Invitation.js";

// Declare global types
/*
type User = {
  id: number;
  username: string;
  status: string;
};*/

let currentUser: User | void;
let users: User[] = [];

async function getCurrentUser() {
  currentUser = await api.getCurrentUser();
}

async function fetchFilteredUsers(): Promise<User[]> {
  const allUsers = await api.fetchUsers();
  return allUsers.filter((user) => user.id !== window.app.state.user?.id);
}

async function InvitationView(): Promise<HTMLElement> {
  await getCurrentUser();
  users = await fetchFilteredUsers();

  // Fetch invitations sent by current user
  async function fetchMyInvitations() {
    const response = await fetch("/api/invitations");
    if (!response.ok) throw new Error("Failed to load invitations");
    const allInvitations = await response.json();
    return allInvitations.filter(
      (invite: Invitation) => 
        invite.senderId === window.app.state.user?.id &&
        (invite.type === 'match' || invite.type === 'tournament') // ADDED FILTER
    );
  }

  // Fetch invitations received by current user
  async function fetchReceivedInvitations() {
    const response = await fetch("/api/invitations");
    if (!response.ok) throw new Error("Failed to load invitations");
  
    const allInvitations = await response.json();
    const userId = window.app.state.user?.id;
  
    return allInvitations.filter((invite: Invitation) => {
      if(typeof userId !== "number") return false;
      const index = invite.recipientIds.indexOf(userId);
      if (index === -1) return false;
  
      return (
        invite.recipientStatuses[index] === "pending" &&
        (invite.type === 'match' || invite.type === 'tournament') // ADDED FILTER
      );
    });
  }
  
  
  // Helper to get minutes ago
  function minutesAgo(dateString: string) {
    // Convert "2025-06-05 12:37:08" → "2025-06-05T12:37:08Z"
    const isoString = dateString.replace(" ", "T") + "Z";
    const now = new Date();
    const then = new Date(isoString);
    return Math.floor((now.getTime() - then.getTime()) / 60000);
  }

  const myInvitations = await fetchMyInvitations();
  const receivedInvitations = await fetchReceivedInvitations();

  const invitationView = dom.create(`
  <div class=" mx-auto space-y-10 font-headline font-bold">

    <!-- Create Match Section -->
    <div class="flex gap-8">
    <section class="mt-10 w-full rounded-2xl bg-darkerBackground p-8 font-headline text-lightText">
  <h2 class="text-section-title !text-[1.3rem] mb-6 text-center">Create Match</h2>

  <div class="space-y-10">
    <!-- Player 1 (me) -->
    <div>
      <label class="block text-small text-secondaryText mb-2 font-bold">Player 1</label>
      <input
        type="text"
        value="${window.app.state.user?.username ?? 'Me'}"
        disabled
        class="w-full px-4 py-3 rounded-full bg-transparent border-4 border-secondary text-lightText cursor-not-allowed"
      />
    </div>

    <!-- Player 2 (added container) -->
    <div>
      <label class="block text-small text-secondaryText mb-2 font-bold">Player 2</label>
      <div data-id="match-player2" class="w-full text-background  "></div>
    </div>

    <!-- Invite Button -->
    <div class="flex justify-center pt-2">
      <button
        data-id="match-invitation"
        class="text-[1.1rem] animationBtn border-4 border-secondary inline-flex justify-center items-center rounded-full bg-transparent font-headline px-3 py-3 font-bold text-lightText min-w-[300px]"
      >
        <span class="fill-bg"></span>
        <span class="button-content">Invite for Match</span>
      </button>
    </div>
  </div>
</section>


    <!-- Create Tournament Section -->
<section class="mt-10 w-full rounded-2xl bg-darkerBackground p-8 font-headline text-lightText">
  <h2 class="text-section-title !text-[1.3rem] mb-6 text-center">Create Tournament</h2>

  <div class="space-y-10">
    <!-- Player 1 (me) -->
    <div>
      <label class="block text-small text-secondaryText mb-2 font-bold">Player 1</label>
      <input
        type="text"
        value="${window.app.state.user?.username ?? 'Me'}"
        disabled
        class="w-full px-4 py-3 rounded-full bg-transparent border-4 border-secondary text-lightText cursor-not-allowed"
      />
    </div>

    <!-- Players 2–4 (added containers) -->
    <div>
      <label class="block text-small text-secondaryText mb-2 font-bold">Player 2</label>
      <div data-id="tournament-player2" class="w-full text-background"></div>
    </div>
    <div>
      <label class="block text-small text-secondaryText mb-2 font-bold">Player 3</label>
      <div data-id="tournament-player3" class="w-full text-background"></div>
    </div>
    <div>
      <label class="block text-small text-secondaryText mb-2 font-bold">Player 4</label>
      <div data-id="tournament-player4" class="w-full text-background"></div>
    </div>

    <!-- Invite Button -->
    <div class="flex justify-center pt-2">
      <button
        class="text-[1.1rem] animationBtn border-4 border-secondary inline-flex justify-center items-center rounded-full bg-transparent font-headline px-3 py-3 font-bold text-lightText min-w-[300px]"
      >
        <span class="fill-bg"></span>
        <span class="button-content">Invite for Tournament</span>
      </button>
    </div>
  </div>
</section>
</div>


    


<!-- Sent Invitations Section -->
<section class="mt-10 w-full rounded-2xl bg-darkerBackground p-8 font-headline text-lightText">
  <h2 class="text-section-title !text-[1.3rem] mb-6 text-center">Sent Invitations</h2>

  <div class="overflow-x-auto w-full rounded-lg">
    <table class="min-w-full text-lightText font-bold font-headline text-center text-[1.1rem] border-4 border-secondary">
      <thead class="bg-secondary">
        <tr>
          <th class="px-4 py-4 text-background">Sent (minutes ago)</th>
          <th class="px-4 py-2 text-background">Recipient(s)</th>
          <th class="px-4 py-2 text-background">Type</th>
          <th class="px-4 py-2 text-background">Actions</th>
        </tr>
      </thead>
      <tbody data-id="sent-invitations-body" class="divide-y divide-secondary">
        <!-- Dynamically inject rows here. In each row's Actions cell, use the template below. -->
      </tbody>
    </table>
  </div>

  <!-- Actions buttons template (reuse per row) -->
  <template data-id="invitation-actions-template">
    <div class="flex items-center justify-center gap-3">
      <!-- Decline -->
      <button
        data-id="decline-btn"
        aria-label="Decline"
        class="group relative inline-flex items-center justify-center w-10 h-10 rounded-full
               border-4 border-redColour text-redColour bg-transparent
               active:scale-95 hover:bg-redColour/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-redColour/60">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
             fill="none" stroke="currentColor" stroke-width="2.2"
             class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M14 6l-8 8"/>
        </svg>
        <span
          class="absolute bottom-full translate-y-6 mt-5 px-2 py-1 text-[0.8rem] font-headline font-bold
                 text-darkerBackground bg-redColour rounded opacity-0
                 group-hover:opacity-100 transition-opacity">
          Decline
        </span>
      </button>

      <!-- Accept -->
      <button
        data-id="accept-btn"
        aria-label="Accept"
        class="group relative inline-flex items-center justify-center w-10 h-10 rounded-full
               border-4 border-greenColour bg-greenColour text-darkerBackground
               active:scale-95 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-greenColour/60">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.97 25.35"
             fill="none" stroke="currentColor" stroke-width="4"
             class="w-5 h-5">
          <polyline points="1.5 10.22 4.95 13.67 15.13 23.85 37.47 1.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span
          class="absolute bottom-full translate-y-6 px-2 py-1 text-[0.8rem] font-headline font-bold
                 text-darkerBackground bg-greenColour rounded opacity-0
                 group-hover:opacity-100 transition-opacity">
          Accept
        </span>
      </button>
    </div>
  </template>
</section>

<!-- Received Invitations Section -->
<section class="mt-10 w-full rounded-2xl bg-darkerBackground p-8 font-headline text-lightText">
  <h2 class="text-section-title !text-[1.3rem] mb-6 text-center">Received Invitations</h2>

  <div class="overflow-x-auto w-full rounded-lg">
    <table class="min-w-full text-lightText font-bold font-headline text-center text-[1.1rem] border-4 border-secondary">
      <thead class="bg-secondary">
        <tr>
          <th class="px-4 py-4 text-background">Received (minutes ago)</th>
          <th class="px-4 py-2 text-background">Sender</th>
          <th class="px-4 py-2 text-background">Type</th>
          <th class="px-4 py-2 text-background">Actions</th>
        </tr>
      </thead>
      <tbody data-id="received-invitations-body" class="divide-y divide-secondary">
        <!-- Dynamically inject rows here. In each row's Actions cell, use the template below. -->
      </tbody>
    </table>
  </div>

  <!-- Actions buttons template (reuse per row) -->
  <template data-id="received-actions-template">
    <div class="flex items-center justify-center gap-3">
      <!-- Decline -->
      <button 
  data-id="decline-btn"
  aria-label="Decline"
  class="relative inline-flex items-center justify-center w-10 h-10 rounded-full
         border-2 border-redColour text-redColour
         active:scale-95 hover:bg-redColour/10 focus:outline-none group">

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
       fill="none" stroke="currentColor" stroke-width="2.5"
       class="w-5 h-5">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M14 6l-8 8"/>
  </svg>

  <!-- Tooltip -->
  <span 
    class="absolute bottom-full translate-y-6 mt-5 px-2 py-1 text-[0.8rem] font-headline font-bold text-darkerBackground bg-redColour rounded 
           opacity-0 group-hover:opacity-100 transition-opacity">
    Decline?
  </span>
</button>

      <!-- Accept -->
      <button
        data-id="accept-btn"
        aria-label="Accept"
        class="group relative inline-flex items-center justify-center w-10 h-10 rounded-full
               border-4 border-greenColour bg-greenColour text-darkerBackground
               active:scale-95 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-greenColour/60">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.97 25.35"
             fill="none" stroke="currentColor" stroke-width="4"
             class="w-5 h-5">
          <polyline points="1.5 10.22 4.95 13.67 15.13 23.85 37.47 1.5"
                    stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span
          class="absolute bottom-full translate-y-6 px-2 py-1 text-[0.8rem] font-headline font-bold
                 text-darkerBackground bg-greenColour rounded opacity-0
                 group-hover:opacity-100 transition-opacity">
          Accept
        </span>
      </button>
    </div>
  </template>
</section>



  `);

  // Function to handle canceling invitations
  async function handleCancelInvitation(invitationId: string, button: HTMLElement) {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove the table row from UI
        const row = button.closest('tr');
        if (row) row.remove();
        alert('Invitation canceled successfully');
      } else {
        const error = await response.json();
        alert(`Failed to cancel invitation: ${error.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error canceling invitation:', err);
      alert('An unexpected error occurred. Please try again later.');
    }
  }

  // Inject the pending invitations into the table
  const pendingBody = invitationView.querySelector(
    '[data-id="sent-invitations-body"]',
  );
  if (pendingBody) {
    pendingBody.innerHTML = myInvitations
      .map((invite: Invitation) => {
        const recipients = invite.recipientIds
          .map((id) => users.find((u) => u.id === id)?.username || "Unknown")
          .join(", ");
        return `
        <tr>
          <td class="p-3 border border-gray-700">${minutesAgo(
            invite.createdAt,
          )}</td>
          <td class="p-3 border border-gray-700">${recipients}</td>
          <td class="p-3 border border-gray-700 capitalize">${invite.type}</td>
          <td class="p-3 border border-gray-700">
            <button class="cancel-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" data-id="${invite.id}">
              Cancel
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    // Attach event listeners to cancel buttons in sent invitations
    pendingBody.querySelectorAll('.cancel-button').forEach(button => {
      button.addEventListener('click', function(this: HTMLElement) {
        const invitationId = this.getAttribute('data-id');
        if (invitationId) {
          handleCancelInvitation(invitationId, this);
        }
      });
    });
  }

  // Function to handle accept/decline for received invitations
  // Function to handle accept/decline for received invitations
  const handleInvitationResponse = async (
    invitationId: string,
    action: "accept" | "decline",
  ) => {
    try {
      const response = await fetch(
        `/api/invitations/${invitationId}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: String(window.app.state.user?.id) // Add current user's ID
          })
        },
      );

      if (response.ok) {
        //alert(`Invitation ${action}ed successfully!`);
        // Refresh the invitations list
        const updatedReceivedInvitations = await fetchReceivedInvitations();
        // Re-render the received invitations
        const receivedBody = invitationView.querySelector(
          '[data-id="received-invitations-body"]',
        );
        if (receivedBody) {
          receivedBody.innerHTML = updatedReceivedInvitations
            .map((invite: Invitation) => {
              const sender = users.find((u) => u.id === invite.senderId);
              return `
              <tr>
                <td class="p-3 border border-gray-700">${minutesAgo(
                  invite.createdAt,
                )}</td>
                <td class="p-3 border border-gray-700">${
                  sender ? sender.username : "Unknown"
                }</td>
                <td class="p-3 border border-gray-700 capitalize">${
                  invite.type
                }</td>
                <td class="p-3 border border-gray-700">
                  <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 border border-2 border-background px-2 rounded accept-button" data-id="${
                    invite.id
                  }">
                    Accept
                  </button>
                  <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded decline-button" data-id="${
                    invite.id
                  }">
                    Decline
                  </button>
                </td>
              </tr>
            `;
            })
            .join("");

          // Attach event listeners to the new buttons
          receivedBody
            .querySelectorAll(".accept-button")
            .forEach((button) => {
              button.addEventListener("click", () =>
                handleInvitationResponse(
                  button.getAttribute("data-id")!,
                  "accept",
                ),
              );
            });

          receivedBody
            .querySelectorAll(".decline-button")
            .forEach((button) => {
              button.addEventListener("click", () =>
                handleInvitationResponse(
                  button.getAttribute("data-id")!,
                  "decline",
                ),
              );
            });
        }
      } else {
        const error = await response.json();
        alert(
          `Failed to ${action} invitation: ${error.message || "Unknown error"}`,
        );
      }
    } catch (err) {
      console.error(`Error ${action}ing invitation:`, err);
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  // Inject the received invitations into the table
  const receivedBody = invitationView.querySelector(
    '[data-id="received-invitations-body"]',
  );
  if (receivedBody) {
    receivedBody.innerHTML = receivedInvitations
      .map((invite: Invitation) => {
        const sender = users.find((u) => u.id === invite.senderId);
        return `
        <tr>
          <td class="p-3 border border-gray-700">${minutesAgo(
            invite.createdAt,
          )}</td>
          <td class="p-3 border border-gray-700">${
            sender ? sender.username : "Unknown"
          }</td>
          <td class="p-3 border border-gray-700 capitalize">${invite.type}</td>
          <td class="p-3 border border-gray-700">
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded accept-button" data-id="${
              invite.id
            }">
              Accept
            </button>
            <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded decline-button" data-id="${
              invite.id
            }">
              Decline
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    receivedBody.querySelectorAll(".accept-button").forEach((button) => {
      button.addEventListener("click", () =>
        handleInvitationResponse(button.getAttribute("data-id")!, "accept"),
      );
    });

    receivedBody.querySelectorAll(".decline-button").forEach((button) => {
      button.addEventListener("click", () =>
        handleInvitationResponse(button.getAttribute("data-id")!, "decline"),
      );
    });
  }

  // Mount select components
  const mountSelect = (containerId: string) => {
    const container = invitationView.querySelector(
      `[data-id="${containerId}"]`,
    );
    if (container) {
      container.appendChild(createSelect(containerId, users, "id", "username"));
    }
  };

  mountSelect("match-player2");
  mountSelect("tournament-player2");
  mountSelect("tournament-player3");
  mountSelect("tournament-player4");

  // Setup match invite button
  const matchInvitationButtonSelector = invitationView.querySelector(
    `[data-id="match-invitation"]`,
  );
  matchInvitationButtonSelector?.addEventListener("click", async () => {
    try {
      const player2Select = invitationView.querySelector(
        '[data-id="match-player2"] select',
      ) as HTMLSelectElement | null;
      if (!player2Select) {
        alert("Player 2 select element not found");
        return;
      }
      const recipientId = player2Select.value;
      if (!recipientId) {
        alert("Please select a valid Player 2");
        return;
      }
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: String(window.app.state.user?.id),
          recipientIds: [recipientId],
          type: "match",
        }),
      });
      if (response.ok) {
        alert("Match invitation sent successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to send invitation: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error sending match invitation:", err);
      alert("An unexpected error occurred. Please try again later.");
    }
  });

    // Setup tournament invite button
    const tournamentInvitationButton = invitationView.querySelector(
      'section:nth-of-type(2) button' // Selects the button in the second section (tournament)
    );
    tournamentInvitationButton?.addEventListener("click", async () => {
      try {
        // Get all three player select elements
        const player2Select = invitationView.querySelector(
          '[data-id="tournament-player2"] select',
        ) as HTMLSelectElement | null;
        const player3Select = invitationView.querySelector(
          '[data-id="tournament-player3"] select',
        ) as HTMLSelectElement | null;
        const player4Select = invitationView.querySelector(
          '[data-id="tournament-player4"] select',
        ) as HTMLSelectElement | null;
  
        if (!player2Select || !player3Select || !player4Select) {
          alert("One or more player select elements not found");
          return;
        }
  
        const recipientIds = [
          player2Select.value,
          player3Select.value,
          player4Select.value
        ].filter(id => id); // Filter out empty values
  
        if (recipientIds.length < 3) {
          alert("Please select all three players for the tournament");
          return;
        }
  
        // Check for duplicate selections
        const uniqueRecipients = new Set(recipientIds);
        if (uniqueRecipients.size < 3) {
          alert("Please select three different players for the tournament");
          return;
        }
  
        const response = await fetch("/api/invitations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: String(window.app.state.user?.id),
            recipientIds: recipientIds,
            type: "tournament",
          }),
        });
  
        if (response.ok) {
          alert("Tournament invitation sent successfully!");
        } else {
          const error = await response.json();
          alert(`Failed to send invitation: ${error.message || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Error sending tournament invitation:", err);
        alert("An unexpected error occurred. Please try again later.");
      }
    });

  return invitationView;
}

export default InvitationView;
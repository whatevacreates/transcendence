import User from "../interface/User.js";
import avatarComponent from "../../component/profile/avatarComponent.js";
import chatComponent from "../../component/chat/chatComponent.js";
import api from "../api/api.js";
import dom from "../dom.js";

async function renderUsers(
  container: HTMLElement,
  options?: {
    excludeChatPartners?: boolean;
    onlyChatPartners?: boolean;
  },
) {
  //test
  console.log("renderUsers...");
  //
  container.innerHTML = "";

  try {
    const currentUserId = window.app?.state?.user?.id;
    const [
      allUsers,
      onlineUserIds,
      friends,
      chatPartners,
      sentInvitations,
    ] = await Promise.all([
      api.fetchUsers(),
      api.fetchOnlineUsers(),
      api.fetchFriends(),
      api.fetchChatPartners(),
      api.fetchSentInvitations(),
    ]);

    console.log("fetched all user data");
    const allBlockedUsers = await api.fetchAllBlockedUsers();
    const blockedIds = new Set(allBlockedUsers.map((user) => user.id));

    const friendIds = new Set(friends.map((user: User) => user.id));
    const pendingIds = new Set<number>();
    for (const inv of sentInvitations) {
      if (inv.type === "friendship") {
        inv.recipientIds.forEach((id: number) => pendingIds.add(id));
      }
    }

    const onlineSet = new Set(onlineUserIds);
    const chatPartnerIds = new Set(chatPartners.map((user) => user.id));

    const visibleUsers = allUsers.filter((user) => {
      if (user.id === currentUserId) return false;
      if (blockedIds.has(user.id)) return false;

      if (options?.excludeChatPartners && chatPartnerIds.has(user.id)) {
        return false;
      }

      if (options?.onlyChatPartners && !chatPartnerIds.has(user.id)) {
        return false;
      }

      return true;
    });

    for (const user of visibleUsers) {
      const isOnline = onlineSet.has(user.id);
      const isFriend = friendIds.has(user.id);
      const isPending = pendingIds.has(user.id);

      const avatar = avatarComponent(user, 64, {
        clickable: true,
        online: isOnline,
        isFriend,
      });

      const item = dom.create(`
        <li class="group flex justify-between items-center p-4 border border-accentColour hover:text-darkerBackground border-[0.2rem] rounded-2xl hover:bg-secondary hover:text-darkerBackground" data-id="${user.id}">
        <div class="flex items-center gap-3">
          <div class="flex   items-center gap-3 relative" data-id="avatar-container">
           
            
           
          </div> 
          <span class="chat-row-badge hidden absolute -top-2 -right-2 text-white text-[1rem] font-bold px-2 py-0.5 rounded-full">0</span> 
          <span class="text-lightText  font-headline group-hover:text-darkerBackground font-bold">${user.username}</span></div>
          <div class="flex items-center gap-3 relative">
            <button class="text-lightText hover:text-gray-300 px-2 py-1" data-id="options-btn-${user.id}">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
    <circle cx="12" cy="5" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <circle cx="12" cy="19" r="2"/>
  </svg>
</button>
            <div class="hidden absolute right-0 mt-8 w-[18rem] bg-white border border-gray-300 rounded shadow-lg z-10" data-id="menu-${user.id}">
              <button class="block w-full px-4 py-2 text-left text-darkerBackground  font-headline font-bold hover:bg-gray-100" data-action="match-${user.id}">
              Invite to a Match</button>
              <button class="block w-full px-4 py-2 text-left text-darkerBackground  font-headline font-bold hover:bg-gray-100" data-action="friend-${user.id}">${
                isFriend ? "Remove Friendship" : "Send Friend Request"
              }</button>
              <button class="block w-full px-4 py-2 text-left text-darkerBackground font-headline font-bold hover:bg-gray-100" data-action="block-${user.id}">Block user</button>
            </div>
          </div>
        </li>
      `);

      const avatarContainer = item.querySelector(
        '[data-id="avatar-container"]',
      ) as HTMLElement;
      if (avatarContainer) dom.mount(avatarContainer, avatar, false);

      const optionButton = item.querySelector(
        `[data-id="options-btn-${user.id}"]`,
      );
      const menu = item.querySelector(`[data-id="menu-${user.id}"]`);

      // --- option button and drop-down menu ---
      let menuHideTimeout: number | undefined = undefined;
      optionButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        if (menu?.classList.contains("hidden")) menu.classList.remove("hidden");
      });

      menu?.addEventListener("mouseleave", () => {
        menuHideTimeout = window.setTimeout(() => {
          menu?.classList.add("hidden");
        }, 100);
      });

      menu?.addEventListener("mouseenter", () => {
        if (menuHideTimeout) clearTimeout(menuHideTimeout);
      });

      item
        .querySelector(`[data-action="chat-${user.id}"]`)
        ?.addEventListener("click", async () => {
          const chat = await chatComponent(user);
          dom.navigateTo(chat, "sidebar-chat-content");
        });

      item
        .querySelector(`[data-action="match-${user.id}"]`)
        ?.addEventListener("click", async () => {
          console.log(`Match invite to ${user.username}`);
          const response = await fetch("/api/invitations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              senderId: String(window.app.state.user?.id),
              recipientIds: [user.id],
              type: "match",
            }),
          });
          if (response.ok) {
            alert("Match invitation sent successfully!");
          } else {
            const error = await response.json();
            alert(
              `Failed to send invitation: ${error.message || "Unknown error"}`,
            );
          }
        });

      const friendBtn = item.querySelector(
        `[data-action="friend-${user.id}"]`,
      ) as HTMLButtonElement;
      friendBtn.disabled = isPending;
      if (!isFriend && !isPending) {
        friendBtn.addEventListener("click", async () => {
          await api.requestFriendship([user.id]);
          friendBtn.textContent = "Friend Request Sent";
          friendBtn.disabled = true;
          friendBtn.classList.add("opacity-50", "cursor-not-allowed");
        });
      } else if (isFriend) {
        friendBtn.addEventListener("click", async () => {
          await api.removeFriendship(user.id);
          window.dispatchEvent(new Event("friendship-status-updated"));
        });
      }

      item
        .querySelector(`[data-action="block-${user.id}"]`)
        ?.addEventListener("click", async () => {
          if (confirm(`Block ${user.username}?`)) {
            const success = await api.blockUser(user.id);
            if (success) item.remove();
          }
        });

      container.appendChild(item);
    }
  } catch (err) {
    console.error("Error rendering user list:", err);
    container.appendChild(
      dom.create(`<li class="text-error">Failed to load users.</li>`),
    );
  }
}

export default renderUsers;

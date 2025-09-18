import dom from '../../shared/dom.js';
import newChatComponent from './newChatComponent.js';
import blockedUsersComponent from './blockedUsersComponent.js';
import renderUsers from '../../shared/util/renderUserList.js';



// =============================================================================
// Component
// =============================================================================

async function currentChatsComponent(): Promise<HTMLElement> {
    const container = dom.create(`
        <div class="max-w-md mx-auto p-4 space-y-4">
            <div class="flex justify-end items-center">
                <button data-id="blocked-users" class="text-[0.9rem] text-redColour hover:underline">Blocked Users</button>
            </div>
            <h2 class="text-[1.1rem] text-secondaryText font-headline font-bold">Your Conversations</h2>
                <ul data-id="chat-list" class="space-y-2">
                <!-- Chat items will be injected here -->
                </ul>
            <button 
            type="submit" 
            class="animationBtn border-8 border-secondary flex w-full justify-center rounded-full bg-transparent font-headline px-3 py-3 font-bold text-sm/6 text-lightText focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span class="fill-bg"></span>
            <span class="button-content">Start New Chat</span>
          </button>
        </div>
    `);


// =============================================================================
// Query Selectors
// =============================================================================


    const chatList = container.querySelector('[data-id="chat-list"]') as HTMLElement;
    const blockedButton = container.querySelector('[data-id="blocked-users"]') as HTMLButtonElement;



// =============================================================================
// Unread message logic
// =============================================================================

    const showRowUnread = (row: HTMLElement, count: number) => {
        const badge = row.querySelector(".chat-row-badge") as HTMLElement;
        
        if (count <= 0) {
          // Hide if nothing unread
            row.classList.remove("bg-red-100");
            badge.classList.add("hidden");
            return;
        }

        row.classList.add("bg-red-100");
        badge.textContent = String(count);
        badge.classList.remove("hidden");
    };


    const clearRowUnread = (row: HTMLElement) => {
        row.classList.remove("bg-red-100");
        const badge = row.querySelector(".chat-row-badge") as HTMLElement;
        badge.classList.add("hidden");
    };

    const unreadListener = (ev: Event) => {
        const { partnerId, unread } = (ev as CustomEvent).detail;
        const row = chatList.querySelector(`[data-id="${partnerId}"]`) as HTMLElement;
        if (!row) return;
        unread > 0 ? showRowUnread(row, unread) : clearRowUnread(row);
    };


// =============================================================================
// Event Listeners
// =============================================================================

    window.addEventListener("unread-update", unreadListener);

    blockedButton.addEventListener('click', async () => {
        const blockedView = await blockedUsersComponent(`Back to chats`);
        dom.navigateTo(blockedView, "sidebar-chat-content");
    });


    container.querySelectorAll('.animationBtn').forEach(btn => {
        btn.addEventListener('click', async () => {
        btn.classList.add('clicked');
        const newChat = await newChatComponent();
        dom.navigateTo(newChat, "sidebar-chat-content");
    });
    });


// =============================================================================
// Render Users: 
// =============================================================================


    try {
        await renderUsers(chatList, { onlyChatPartners: true });
    } catch (err) {
        console.error("Failed to render chat user list:", err);
        chatList.appendChild(dom.create(`<li class="text-error">Failed to load conversations.</li>`));
    }

    try {
        for (const userId in window.app?.state?.unreadByUser ?? {}) 
        {
            const row = chatList.querySelector(`[data-id="${userId}"]`) as HTMLElement;
            if (row) 
                showRowUnread(row, window.app.state.unreadByUser[userId]);
        }
    } catch (err) {
        console.warn("Unread badge rendering failed:", err);
    }

    return container;
}

export default currentChatsComponent;

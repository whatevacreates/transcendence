import dom from '../../shared/dom.js';
import newPeopleComponent from './newPeopleComponent.js';
import blockedUsersComponent from '../chat/blockedUsersComponent.js';
import renderUsers from '../../shared/util/renderConnectionsList.js';


// =============================================================================
// Component
// =============================================================================

async function currentPeopleComponent(): Promise<HTMLElement> {
    const container = dom.create(`
        <div class="max-w-md mx-auto p-4 space-y-4">
            <div class="flex justify-end items-center">
                <button data-id="blocked-users" class="text-[0.9rem] text-redColour hover:underline">Blocked Users</button>
            </div>
            <h2 class="text-[1.1rem] text-secondaryText font-headline font-bold">Manage Connections</h2>
                

            <div data-id="people-list" class="space-y-2"></div>
        </div>
    `);


// =============================================================================
// Query Selectors
// =============================================================================


    const peopleList = container.querySelector('[data-id="people-list"]') as HTMLElement;
    const startNewPeopleButton = container.querySelector('[data-id="start-new-people"]') as HTMLButtonElement;
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
        const badge = row.querySelector(".people-row-badge") as HTMLElement;
        badge.classList.add("hidden");
    };

    const unreadListener = (ev: Event) => {
        const { partnerId, unread } = (ev as CustomEvent).detail;
        const row = peopleList.querySelector(`[data-id="${partnerId}"]`) as HTMLElement;
        if (!row) return;
        unread > 0 ? showRowUnread(row, unread) : clearRowUnread(row);
    };


// =============================================================================
// Event Listeners
// =============================================================================

    window.addEventListener("unread-update", unreadListener);

    blockedButton.addEventListener('click', async () => {
        const blockedView = await blockedUsersComponent(`Back to people list`);
        dom.navigateTo(blockedView, "sidebar-people-content");
    });

    /*startNewChatButton.addEventListener("click", async () => {
        const newChat = await newChatComponent();
        dom.navigateTo(newChat, "sidebar-chat-content");
    });*/



// =============================================================================
// Render Users: 
// =============================================================================


    try {
        await renderUsers(peopleList, { onlyChatPartners: true });
    } catch (err) {
        console.error("Failed to render people user list:", err);
        peopleList.appendChild(dom.create(`<li class="text-error">Failed to load conversations.</li>`));
    }

    try {
        for (const userId in window.app?.state?.unreadByUser ?? {}) 
        {
            const row = peopleList.querySelector(`[data-id="${userId}"]`) as HTMLElement;
            if (row) 
                showRowUnread(row, window.app.state.unreadByUser[userId]);
        }
    } catch (err) {
        console.warn("Unread badge rendering failed:", err);
    }

    await renderUsers(peopleList, {excludeChatPartners: false});

    return container;
}

export default currentPeopleComponent;

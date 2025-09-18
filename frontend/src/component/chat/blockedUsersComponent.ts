import dom from '../../shared/dom.js';
import api from '../../shared/api/api.js';
import newChatComponent from './newChatComponent.js';
import avatarComponent from '../profile/avatarComponent.js';
import User from '../../shared/interface/User.js';
import currentChatsComponent from './currentChatsComponent.js';
import currentPeopleComponent from '../people/currentPeopleComponent.js';


// =============================================================================
// Component
// =============================================================================

async function blockedUsersComponent(backLabel: string): Promise<HTMLElement> {
    const container = dom.create(`
        <div class="max-w-md mx-auto p-4 space-y-4">
            <div class="flex justify-between items-center">
                <button data-id="back-button" class="font-headline font-bold text-accentColour hover:underline text-[1rem]">← ${backLabel}</button>
            </div>
            <h2 class="text-[1.3rem] text-redColour font-headline">Blocked Users</h2>
            <div data-id="blocked-list" class="space-y-2"></div>
        </div>
    `);


// =============================================================================
// Query Selectors
// =============================================================================

    const backButton = container.querySelector('[data-id="back-button"]') as HTMLElement;
    const list = container.querySelector('[data-id="blocked-list"]')!;


// =============================================================================
// Event Listeners
// =============================================================================

    backButton.addEventListener('click', async () => {
        const currentChats = await currentChatsComponent();
        const peopleChats = await currentPeopleComponent();
        backLabel === `Back to chats` ? dom.navigateTo(currentChats, "sidebar-chat-content") : dom.navigateTo(peopleChats, "sidebar-people-content");
    });

// =============================================================================
// Get Blocked users list: 
// =============================================================================

    const rawUsers = await api.fetchBlockedUsers();
    const users: User[] = rawUsers ?? [];  
    if (!users || users.length === 0) {
        list.textContent = "You haven't blocked anyone.";
        return container;
    }

    for (const user of users) {
        const avatar = avatarComponent(user, 64, { clickable: true });
        
        const row = dom.create(`
            <div class="flex items-center justify-between p-3 border border-accentColour hover:text-darkerBackground border-[0.2rem] rounded-2xl">
                <div class="flex items-center gap-3" data-id="avatar-cell">
                    <span class="text-primary font-medium">${user.username}</span>
                </div>
                <button class="text-lightText hover:text-greenColour mr-4" title="Unblock User" data-id="unblock-${user.id}">
                    <svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 34.57 37.76"
     width="29" height="29"
     fill="none"
     stroke="currentColor" stroke-width="3"
     stroke-linecap="round" stroke-linejoin="round"
     aria-hidden="true" role="img">
  <!-- Shackle -->
  <path d="M25.71,6.49c-.79-2.58-3.49-4.49-6.71-4.49h-3.2c-3.83,0-6.94,2.7-6.94,6.04v4.69"/>
  <!-- Body -->
  <path d="M9,13.31H25.57A7,7,0,0,1,32.57,20.31V28.76A7,7,0,0,1,25.57,35.76H9A7,7,0,0,1,2,28.76V20.31A7,7,0,0,1,9,13.31Z"/>
  <!-- Keyhole -->
  <path d="M21.18,24.54A3.89,3.89,0,1,1,13.40,24.54A3.89,3.89,0,1,1,21.18,24.54Z"/>
</svg>

                </button>
            </div>
        `);

        // --- Query Selectors ---
        const unblockButton = row.querySelector(`[data-id="unblock-${user.id}"]`) as HTMLButtonElement;
        const avatarCell = row.querySelector('[data-id="avatar-cell"]') as HTMLElement;
        avatarCell.prepend(avatar);

        // --- Event Listeners ---
        unblockButton?.addEventListener('click', async () => {
            const confirmed = confirm(`Unblock ${user.username}?`);
            if (confirmed) {
                const success = await api.unblockUser(user.id);
                if (success) row.remove();
            }
        });

        list.appendChild(row);
    }

    return container;
}

export default blockedUsersComponent;


import dom from "../../shared/dom.js";
import blockedUsersComponent from "./blockedUsersComponent.js";
import currentChatsComponent from "./currentChatsComponent.js";
import renderUsers from "../../shared/util/renderUserList.js";

// =============================================================================
// Component
// =============================================================================

async function newChatComponent(): Promise<HTMLElement> {
  const container = dom.create(`
    <div class="max-w-md mx-auto p-4 space-y-4">
      <div class="flex justify-between items-center">
        <button data-id="back-button" class="text-accentColour font-bold font-headline hover:underline text-[0.9rem]">← Back to current chats</button>
        <button data-id="blocked-users" class="text-redColour text-[0.9rem] hover:underline">Blocked Users</button>
      </div>
      
      <div class="flex items-center space-x-2">
        <h2 class="text-xl text-primary font-semibold">Start a New Chat</h2>
      </div>
      
      <div data-id="user-list" class="space-y-2"></div>
    </div>
    `);

  // =============================================================================
  // Query Selectors
  // =============================================================================
  const userList = container.querySelector('[data-id="user-list"]') as HTMLElement;
  const backButton = container.querySelector('[data-id="back-button"]') as HTMLButtonElement;
  const blockedButton = container.querySelector('[data-id="blocked-users"]') as HTMLButtonElement;

  // =============================================================================
  // Event Listeners
  // =============================================================================

  backButton.addEventListener("click", async () => {
    const backView = await currentChatsComponent();
    dom.navigateTo(backView, "sidebar-chat-content");
  });

  blockedButton.addEventListener("click", async () => {
    const blockedView = await blockedUsersComponent(`Back to chats`);
    dom.navigateTo(blockedView, "sidebar-chat-content");
  });

  await renderUsers(userList, { excludeChatPartners: true });

  return container;
}

export default newChatComponent;

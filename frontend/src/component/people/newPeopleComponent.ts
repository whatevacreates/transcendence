import dom from "../../shared/dom.js";
import blockedUsersComponent from "../chat/blockedUsersComponent.js";
import currentPeopleComponent from "./currentPeopleComponent.js";
import renderUsers from "../../shared/util/renderUserList.js";

// =============================================================================
// Component
// =============================================================================

async function newPeopleComponent(): Promise<HTMLElement> {
  const container = dom.create(`
    <div class="max-w-md mx-auto p-4 space-y-4">
      <div class="flex justify-between items-center">
        <button data-id="back-button" class="text-accent hover:underline text-sm">← Back to current chats</button>
        <button data-id="blocked-users" class="text-sm text-accent hover:underline">Blocked Users</button>
      </div>
      
      <div class="flex items-center space-x-2">
        <h2 class="text-[1rem] text-primary font-semibold">Your friends</h2>
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
    const backView = await currentPeopleComponent();
    dom.navigateTo(backView, "sidebar-people-content");
  });

  blockedButton.addEventListener("click", async () => {
    const blockedView = await blockedUsersComponent(`Back to people list`);
    dom.navigateTo(blockedView, "sidebar-people-content");
  });

  await renderUsers(userList);

  return container;
}

export default newPeopleComponent;

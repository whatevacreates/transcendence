import dom from '../../shared/dom.js';

function chatIconComponent(): HTMLElement {

  // =============================================================================
  // Component
  // =============================================================================

  const component = dom.create(`
    <div>
      <button data-id="chat-icon" type="button" class="relative rounded-full p-1 px-2 ">
        <span class="absolute -inset-1.5"></span>
        <span class="sr-only">View notifications</span>

        <!-- Chat icon -->
        <svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 35.62 27.27"
     width="29" height="29"
     fill="none"
     stroke="currentColor" stroke-width="3" stroke-miterlimit="10"
     aria-hidden="true" role="img">
  <path d="M34.12,11.85v-.19c0-5.61-4.55-10.16-10.16-10.16h-12.3C6.05,1.5,1.5,6.05,1.5,11.66h0c0,5.61,4.55,10.16,10.16,10.16h12.16s.06,0,.09.02l7.14,3.9c.14.08.31-.04.29-.2l-.86-5.88c0-.06.02-.13.07-.17,2.18-1.83,3.57-4.57,3.57-7.64h0Z"/>
</svg>

        <!-- Chat badge -->
        <span data-id="chat-badge" hidden class="hidden absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">0</span>
      </button>
    </div>
  `);

  // =============================================================================
  // State
  // =============================================================================

  window.app.state.unreadMessageCount = 0;

  // =============================================================================
  // DOM Selectors
  // =============================================================================

  const chatIconSelector = component.querySelector('[data-id="chat-icon"]') as HTMLElement;
  const chatBadgeSelector = component.querySelector('[data-id="chat-badge"]') as HTMLElement;

  // =============================================================================
  // Events
  // =============================================================================

  // --- Listen event : New notification ---
    // Prevent event duplication for the "new event" little red badge thing
  if (!window.app.chatListenerAdded) {
    const handleChat = (event: Event) => {
      const { data } = (event as CustomEvent<{data: { recipientId: number | string; userId: number | string}}>).detail;
    
      const currentUserId = Number(window.app.state.user?.id);
      const recipientId   = Number(data.recipientId);
      const senderId      = Number(data.userId);
      const activeChat = window.app.state.activeChatPartnerId;

      
      // make sure user doesnt get notifications when he/she is the sender (or if the chat was already open):
      if (!currentUserId) return;
      if (recipientId !== currentUserId || senderId === currentUserId) return;
      if (senderId === activeChat) return;

      // update global unread message counter in the app.state
      window.app.state.unreadMessageCount = (window.app.state.unreadMessageCount ?? 0) + 1;
      const current = window.app.state.unreadByUser[senderId] ?? 0;
      window.app.state.unreadByUser[senderId] = current + 1;

      // broadcast event that this chat partner has +1 unread message 
      window.dispatchEvent(new CustomEvent("unread-update", {
          detail: { partnerId: senderId, unread: current + 1 },
        })
      );
    
      const badge = document.querySelector('[data-id="chat-badge"]') as HTMLElement;
      if (badge) {
        badge.textContent = String(window.app.state.unreadMessageCount);
        badge.classList.remove("hidden");
      }
    };
  
    window.addEventListener("chat", handleChat);
    window.app.chatListenerAdded = true;
  }


  // --- Listen event : Reset notification ---
  window.addEventListener("chat-badge-reset", (event) => {
    window.app.state.unreadMessageCount = 0;
    if (chatBadgeSelector)
      chatBadgeSelector.classList.add("hidden");
  });

  // --- Dispatch event : Toggle right sidebar ---
  if (chatIconSelector) {
    chatIconSelector.addEventListener("click", () => {
      window.dispatchEvent(new Event("sidebar-chat-toggle"));
      window.dispatchEvent(new Event("chat-badge-reset"));
    });
  }

  return component;
}

export default chatIconComponent;
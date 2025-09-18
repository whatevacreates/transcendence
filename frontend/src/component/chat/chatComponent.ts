import dom from '../../shared/dom.js';
import { ChatPacket } from "../../websocket/WsPacket.js";
import websocketManager from "../../websocket/WebsocketManager.js";
import currentChatsComponent from './currentChatsComponent.js';
import Message from '../../shared/interface/Message.js';
import User from '../../shared/interface/User.js';
import avatarComponent from '../profile/avatarComponent.js';
import api from '../../shared/api/api.js';
import escapeHtml from '../../shared/util/escapeHtml.js';


// =============================================================================
// Chat Component : Message component
// =============================================================================

async function chatComponent(recipient: User): Promise<HTMLElement> {
  
  const createChatMessage = (message: Message): HTMLElement => {
    const currentUser = window.app?.state?.user;
    const isSent = message.type === 'sent';
    const avatarUser: User = isSent ? (currentUser as User) : recipient;
    const avatar = avatarComponent(avatarUser, 32, { clickable: true });
  
    const messageContent = dom.create(`
      <div class="flex ${isSent ? 'justify-end' : 'justify-start'} items-end gap-2">
  <div class="${isSent ? 'bg-accentColour text-background font-headline font-bold' : 'bg-secondaryText text-darkerBackground font-headline font-bold'} 
              rounded-lg p-3 max-w-[100%] min-w-[60%] break-words">
      <p class="text-[0.8rem] text-background font-bold font-headline mb-1">${escapeHtml(message.user)}</p>
      <p class="text-[1rem] text-darkerBackground">${escapeHtml(message.content)}</p>
      <span class="text-[0.8rem] ${isSent ? 'text-background font-headline' : 'text-background font-headline'}">${message.time}</span>
  </div>
</div>`);
  
    // --- Message element: Wrap avatar and chat bubble  ---
    const messageRow = document.createElement('div');
    messageRow.className = `w-full flex mb-2 ${isSent ? 'justify-end' : 'justify-start'}`;

    const inner = document.createElement('div');
    inner.className = `flex items-end gap-2 ${isSent ? 'flex-row-reverse' : ''}`;
  
    inner.appendChild(avatar);
    inner.appendChild(messageContent);
    messageRow.appendChild(inner);
  
    return messageRow;
  };

// =============================================================================
// Chat Container 
// =============================================================================
  
    const chatContainer = dom.create(`
      <div class="w-full h-[92vh] flex flex-col px-4">
        <div class="shrink-0 p-2">
          <button data-id="back-button" class="text-accentColour font-bold hover:underline">← Back to current chats</button>
        </div>
    
        <!-- Scrollable message container -->
        <div class="flex-1  overflow-y-auto flex flex-col space-y-2 px-2" data-id="message-container"></div>
    
        <!-- Message input -->
        <div class="shrink-0 p-2">
          <div class="flex items-center space-x-2">
            <input type="text" id="messageInput" class="bg-lightText flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-headline text-darkerBackground " placeholder="Type a message..." />
            <button id="sendButton"  class="px-4 py-2 bg-secondaryText text-darkerBackground rounded-lg 
         font-bold font-headline 
         filter hover:brightness-110 active:brightness-110 
         active:scale-95 active:translate-y-[1px] 
         transition-transform duration-150 focus:outline-none">Send</button>
          </div>
        </div>
      </div>
    `);
  
// =============================================================================
// Query Selectors 
// =============================================================================

  const sendButton = chatContainer.querySelector('#sendButton') as HTMLButtonElement;
  const messageInput = chatContainer.querySelector('#messageInput') as HTMLInputElement;
  const messageContainer = chatContainer.querySelector('[data-id="message-container"]') as HTMLElement;
  const backButton = chatContainer.querySelector('[data-id="back-button"]') as HTMLButtonElement;


// =============================================================================
// Event Listeners 
// =============================================================================

  backButton.addEventListener('click', async () => {
    window.app.state.activeChatPartnerId = null;
    const backView = await currentChatsComponent();
    dom.navigateTo(backView, "sidebar-chat-content");
  });

  // --- Scroll to Bottom function ---
  function scrollToBottom() {
      console.log("scrollToBottom called", messageContainer.scrollHeight);
      messageContainer.scrollTop = messageContainer.scrollHeight;
  };
  

// =============================================================================
// Load Chat History 
// =============================================================================

  const loadChatHistory = async () => {
    try {
      const history = await api.fetchChatHistory(recipient.id);
      console.log("history: ", history);

      history.forEach((msg: any) => {
        const currentUserId = window.app?.state?.user?.id;
        const type = msg.userId === currentUserId ? 'sent' : 'received';

        const message: Message = {
          content: msg.content,
          user: type === 'sent' ? window.app?.state?.user?.username || "You" : recipient.username,
          time: new Date(msg.time).toLocaleTimeString(),
          type,
        };

        const messageElement = createChatMessage(message);
        dom.mount(messageContainer, messageElement, false);
      });
    } catch (err) {
      console.error("Failed to load private messages:", err);
    }
  };


// =============================================================================
// Send Message:
// =============================================================================

  sendButton.addEventListener('click', () => {
    const content = messageInput.value.trim();
    const user = window.app?.state?.user;

    if (!user) {
      console.error("User is not logged in");
      return;
    }
    if (content) {
      const chatPacket = new ChatPacket("message", {
        content,
        userId: user.id,
        recipientId: recipient.id
      });
      console.log("chatpacket.recipientId : ", chatPacket.data.recipientId)

      websocketManager.send(chatPacket);

      const localMessage: Message = {
        content,
        user: user.username,
        time: new Date().toLocaleTimeString(),
        type: 'sent'
      };

      dom.mount(messageContainer, createChatMessage(localMessage), false);
      scrollToBottom();
      messageInput.value = '';
    }
  });


// =============================================================================
// Handle Incoming Messages:  
// =============================================================================

    function handleChatEvent(event: Event) {
      const { data } = (event as CustomEvent).detail;
    
      const currentUserId = window.app?.state?.user?.id;
    
      const isRelevant =
        (data.userId === recipient.id && data.recipientId === currentUserId) ||
        (data.recipientId === recipient.id && data.userId === currentUserId);
    
      if (!isRelevant) return;
      
      // --- Avoid echoed messages ---
      if (data.userId == currentUserId) return
    
      const receivedMessage: Message = {
        content: data.content,
        user: data.userId,
        time: new Date(data.createdAt || Date.now()).toLocaleTimeString(),
        type: 'received'
      };
  
      dom.mount(messageContainer, createChatMessage(receivedMessage), false);
      scrollToBottom();
    }
    
  window.addEventListener("chat", handleChatEvent);

  // --- Event Listeners ---
  window.addEventListener("ws:open", () => console.log("WebSocket connected"));
  window.addEventListener("ws:close", () => console.log("WebSocket disconnected"));
  window.addEventListener("ws:error", () => console.log("WebSocket error"));

  // --- Load Messages ---
  await loadChatHistory();
  
  
  // --- Set Recipient as chat partner in State ---
  window.app.state.activeChatPartnerId = recipient.id;

  // --- Clear unread messages ---

// --- Clear unread messages ---
window.app.state.unreadByUser[recipient.id] = 0;

window.app.state.unreadMessageCount = Object.values(window.app.state.unreadByUser)
  .reduce((sum: number, val: number) => sum + val, 0);

window.dispatchEvent(new CustomEvent("unread-update", {
  detail: { partnerId: recipient.id, unread: 0 }
}));

window.dispatchEvent(new Event("chat-badge-reset"));


  // --- scroll to bottom ---
  requestAnimationFrame(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 0);
  });
  
  return chatContainer;
}

export default chatComponent;


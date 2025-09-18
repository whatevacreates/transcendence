import router from "./router.js";
import User from "./shared/interface/User.js";
import api from "./shared/api/api.js";
import websocketManager from "./websocket/WebsocketManager.js";
import {
  updateNotifBadge,
  handleNotificationEvent,
  retrieveNotifs
} from "./shared/util/notifTool.js";

// global.d.ts
export {};

declare global {
  interface Window {
    app: {
      router?: any;
      state: {
        user?: User | null;
        unreadMessageCount?: number;
        notificationCount: number;
        unreadByUser: Record<number, number>;
        activeChatPartnerId?: number | null;
      };
      selector?: Record<string, HTMLElement | null>;
      notifications: Notification[];
      chatListenerAdded: boolean;
    };
  }
}

let state: {
  user: User | null;
  unreadMessageCount: number;
  notificationCount: number;
  unreadByUser: Record<number, number>;
  activeChatPartnerId?: number | null;
} = {
  user: null,
  unreadMessageCount: 0,
  notificationCount: 0,
  unreadByUser: {},
  activeChatPartnerId: null,
};

interface Notification {
  interactive: boolean;
  invitationId?: string;
  content: string;
  user: string;
  time: string;
  context: "friendship" | "match" | "tournament";
  notifId: number;
}
const notifications: Notification[] = [];

window.app = window.app || {};
window.app.router = router;
window.app.state = state;
window.app.notifications = notifications;
window.app.chatListenerAdded = false;

window.app.selector = {
  title1: document.querySelector("title"),
  title2: document.querySelector('[data-id="title"]'),
  navbar: document.querySelector('[data-id="navbar"]'),
  view: document.querySelector('[data-id="view"]'),
  sidebarNotification: document.querySelector(
    '[data-id="sidebar-notification"]',
  ),
  sidebarChat: document.querySelector('[data-id="sidebar-chat"]'),
  sidebarPeople: document.querySelector('[data-id="sidebar-people"]')
};

window.addEventListener("DOMContentLoaded", async () => {
  await api.getCurrentUser();

  if (window.app.state.user) {
    websocketManager.connect();
    await retrieveNotifs();
  }
      //retrieve pending notifications from backend and listen for new notifications
  // prevent loading /login if user already logged in
  // if (window.app.state.user && location.pathname === "/login") {
  //   history.replaceState({}, "", "/");
  // }

  // --- set notification-related listeners once at entry point  ---
  window.addEventListener("notif-badge-update", (event) => {
    updateNotifBadge();
  });
  window.addEventListener("notification", handleNotificationEvent);

  router.init();
});

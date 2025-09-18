import interactiveNotifComponent from "../../component/notification/interactiveNotifComponent.js";
import textNotifComponent from "../../component/notification/textNotifComponent.js";
import notificationComponent from "../../component/notification/notificationComponent.js";
import dom from "../dom.js";

interface Notification {
  interactive: boolean;
  invitationId?: string;
  content: string;
  user: string;
  time: string;
  context: "friendship" | "match" | "tournament";
  notifId: number;
}

async function retrieveNotifs() {
  try {
    const response = await fetch("/api/notifications", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const pastNotifs: Notification[] = await response.json();
      window.app.state.notificationCount = pastNotifs.length;
      window.dispatchEvent(new Event("notif-badge-update"));
      //test
      console.log("retrived unread notifications");
      console.log("pastNotifs: ", pastNotifs);
      //
      window.app.notifications = [];
      window.app.notifications.push(...pastNotifs);
    }
  } catch (err) {
    console.error("Failed to load notifications");
  }
}

function renderNotifs() {
  const notificationElement = notificationComponent(window.app.notifications);
  const sidebarNotificationContent = document.querySelector(
    '[data-id="sidebar-notification-content"]',
  ) as HTMLElement;
  if (sidebarNotificationContent) {
    sidebarNotificationContent.innerHTML = "";
    //test
    console.log("ready to mount notification component");
    if (window.app.notifications.length === 0)
    {
       console.log("no past notifs to render");
       sidebarNotificationContent.innerHTML = `<h2 class="italic font-bold font-headline text-secondaryText">No new notifications 🎉</h2>`;
       return;
    }
     
    // i need to add this element <h2> with no notification to display to sidebar notification content
    dom.mount(sidebarNotificationContent, notificationElement);
  }
}

async function handleNotificationEvent(event: Event) {
  //test
  const packet = (event as CustomEvent).detail;
  console.log("Notification received: ", packet);
  //
  //update notification num badge
  //test
  console.log("notification received, ready to update notificationCount...");
  //
  //window.app.state.notificationCount++;
  try {
    const response = await fetch("/api/notifications", {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const currentNotifs: Notification[] = await response.json();
      window.app.notifications = [];
      window.app.notifications.push(...currentNotifs);
      renderNotifs();
      window.app.state.notificationCount = currentNotifs.length;
      //test
      console.log(
        "current notifs number: ",
        window.app.state.notificationCount,
      );
      //
      window.dispatchEvent(new Event("notif-badge-update"));
    }
  } catch (err) {
    console.error("Failed to get current notifications");
  }
}

function updateNotifBadge() {
  const notificationBadge = document.querySelector(
    '[data-id="notification-badge"]',
  );

  if (!notificationBadge) {
    //console.warn("Notification badge element not found in DOM");
    return;
  }

  const count = window.app?.state?.notificationCount || 0;

  if (count !== 0) {
    notificationBadge.textContent = String(count);
    notificationBadge.classList.remove("hidden");
  } else {
    notificationBadge.classList.add("hidden");
  }
}

function updateNotifStack(notifId: number) {
  const index = window.app.notifications.findIndex(
    (notif) => notif.notifId === notifId,
  );
  if (index !== -1) window.app.notifications.splice(index, 1);
}

export {
  retrieveNotifs,
  handleNotificationEvent,
  updateNotifBadge,
  updateNotifStack,
  renderNotifs,
};

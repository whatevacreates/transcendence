import dom from "../../shared/dom.js";
import textNotifComponent from "./textNotifComponent.js";
import interactiveNotifComponent from "./interactiveNotifComponent.js";

interface Notification {
  interactive: boolean;
  invitationId?: string;
  content: string;
  user: string;
  time: string;
  context: "friendship" | "match" | "tournament";
  notifId: number;
}

function notificationComponent(notifications: Notification[]): HTMLElement {
  const container = dom.create(`
        <div class="max-w-md mx-auto">
            <div class="flex flex-col space-y-2" data-id="notification-container">
                <!-- Notifications will be appended here -->
            </div>
        </div>
    `);

  const containerElement = container.querySelector(
    '[data-id="notification-container"]',
  ) as HTMLElement;

  // =============================================================================
  // Render unhandled Notifications:
  // =============================================================================
  notifications.forEach((notification) => {
    let notifElement;

    if (notification.interactive) {
      notifElement = interactiveNotifComponent(notification);
    } else notifElement = textNotifComponent(notification);

    dom.mount(containerElement, notifElement, false);
  });

  return container;
}

export default notificationComponent;

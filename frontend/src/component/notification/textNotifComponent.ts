import dom from "../../shared/dom.js";
import api from "../../shared/api/api.js";
import { updateNotifStack } from "../../shared/util/notifTool.js";

// Define the Notification interface
interface TextNotification {
  interactive: boolean;
  content: string;
  user: string;
  time: string;
  context: "friendship" | "match" | "tournament";
  notifId: number;
}

function textNotifComponent(notification: TextNotification): HTMLElement {
  if (!notification || !notification.context) {
    console.error(
      "Invalid notification passed to textNotifComponent:",
      notification,
    ); // 🛠️ Added guard clause
    return dom.create(`<div class="text-redColour">Invalid notification</div>`);
  }

  const bgColor =
    notification.context === "friendship"
      ? `<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 45.43 38.96"
     width="22" height="22"
     fill="none"
     stroke="currentColor" stroke-width="3.8"
     aria-hidden="true" role="img">
  <path d="M24.05,37.46v-3.09c0-4.53-3.71-8.25-8.25-8.25h-6.06c-4.53,0-8.25,3.71-8.25,8.25v3.09"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12.78" cy="14.44" r="7.93" stroke-miterlimit="10"/>
  <path d="M43.93,32.45v-3.09c0-4.53-3.71-8.25-8.25-8.25h-6.06c-4.07,0-7.48,3-8.13,6.89"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32.66" cy="9.43" r="7.93" stroke-miterlimit="10"/>
</svg>`
      : notification.context === "match"
      ? `<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 66.16 33.97"
     width="40" height="40"
     fill="none"
     stroke="currentColor" stroke-width="2.8"
     aria-hidden="true" role="img">
  
  <!-- Wheels -->
  <circle cx="56.3" cy="24.49" r="2.87" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="9.86" cy="24.49" r="2.87" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Controller outline -->
  <path d="M29.74,1.52c3.25-.01,6.77-.09,10.01.13,2.72.18,5.66.23,7.9,2,
           5.7,4.5,10.37,10.3,14.51,16.22,1.82,2.6,3.18,5.38,2.13,8.61
           -.75,2.29-3.08,3.76-5.41,3.96-1.99.17-3.99-.44-5.77-1.35
           s-3.4-2.11-5.07-3.21c-3.94-2.6-8.27-4.62-13.01-5.11
           -1.18-.12-3.3-.06-3.89,0-4.74.49-9.07,2.51-13.01,5.11
           -1.67,1.1-3.29,2.3-5.07,3.21s-3.78,1.52-5.77,1.35
           c-2.32-.2-4.66-1.67-5.41-3.96-1.05-3.23.31-6.01,2.13-8.61
           4.14-5.93,8.81-11.72,14.51-16.22,2.24-1.77,5.18-1.81,7.9-2,
           3.24-.22,6.76-.14,10.01-.13"
        stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Left "X" -->
  <line x1="28.46" y1="7.93" x2="20.4" y2="15.99" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="20.4" y1="7.93" x2="28.46" y2="15.99" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Right "+" -->
  <path d="M43.59,9.8h-1.61v-1.61c0-1.19-.97-2.16-2.16-2.16s-2.16.97-2.16,2.16v1.61h-1.61
           c-1.19,0-2.16.97-2.16,2.16s.97,2.16,2.16,2.16h1.61v1.61
           c0,1.19.97,2.16,2.16,2.16s2.16-.97,2.16-2.16v-1.61h1.61
           c1.19,0,2.16-.97,2.16-2.16s-.97-2.16-2.16-2.16Z"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 66.16 33.97"
     width="40" height="40"
     fill="none"
     stroke="currentColor" stroke-width="2.8"
     aria-hidden="true" role="img">
  
  <!-- Wheels -->
  <circle cx="56.3" cy="24.49" r="2.87" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="9.86" cy="24.49" r="2.87" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Controller outline -->
  <path d="M29.74,1.52c3.25-.01,6.77-.09,10.01.13,2.72.18,5.66.23,7.9,2,
           5.7,4.5,10.37,10.3,14.51,16.22,1.82,2.6,3.18,5.38,2.13,8.61
           -.75,2.29-3.08,3.76-5.41,3.96-1.99.17-3.99-.44-5.77-1.35
           s-3.4-2.11-5.07-3.21c-3.94-2.6-8.27-4.62-13.01-5.11
           -1.18-.12-3.3-.06-3.89,0-4.74.49-9.07,2.51-13.01,5.11
           -1.67,1.1-3.29,2.3-5.07,3.21s-3.78,1.52-5.77,1.35
           c-2.32-.2-4.66-1.67-5.41-3.96-1.05-3.23.31-6.01,2.13-8.61
           4.14-5.93,8.81-11.72,14.51-16.22,2.24-1.77,5.18-1.81,7.9-2,
           3.24-.22,6.76-.14,10.01-.13"
        stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Left "X" -->
  <line x1="28.46" y1="7.93" x2="20.4" y2="15.99" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="20.4" y1="7.93" x2="28.46" y2="15.99" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Right "+" -->
  <path d="M43.59,9.8h-1.61v-1.61c0-1.19-.97-2.16-2.16-2.16s-2.16.97-2.16,2.16v1.61h-1.61
           c-1.19,0-2.16.97-2.16,2.16s.97,2.16,2.16,2.16h1.61v1.61
           c0,1.19.97,2.16,2.16,2.16s2.16-.97,2.16-2.16v-1.61h1.61
           c1.19,0,2.16-.97,2.16-2.16s-.97-2.16-2.16-2.16Z"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  // Notification without action buttons


const element = dom.create(`
  <div class="border border-[0.2rem] border-lightText
              font-headline font-bold rounded-2xl w-full max-w-sm mx-auto
              overflow-hidden shadow-md ring-1 ring-black/10">

    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-4  border-b-[0.1rem]  border-lightText bg-darkerBackground text-lightText font-bold">
      <div class="flex items-center gap-2">
      
       <div class="flex items-center gap-4">
      <span class="capitalize">${notification.context}</span>
      ${bgColor}
</div>
      </div>

      <!-- Close button -->
      <button data-id="close-btn" class="p-1 rounded hover:bg-white/10 active:bg-white/20 transition">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" 
             fill="none" stroke="currentColor" stroke-width="2" 
             class="w-5 h-5 text-lightText">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M14 6l-8 8" />
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="p-4  text-lightText font-bold font-headline">
      <span class="block">${notification.content}</span>
      <!--<p class="text-xs leading-3 pt-1 text-gray-500">${notification.time}</p>-->
    </div>
  </div>
`);


  const currentUserId = window.app.state.user?.id;
  const closeBtn = element.querySelector('[data-id="close-btn"]');
  closeBtn?.addEventListener("click", async () => {
    await api.deleteHandledNotif(notification.notifId, currentUserId);
    element.remove();
    updateNotifStack(notification.notifId);
    if (
      window.app.state.notificationCount &&
      window.app.state.notificationCount > 0
    )
      window.app.state.notificationCount--;
    window.dispatchEvent(new Event("notif-badge-update"));
  });

  return element;
}

export default textNotifComponent;

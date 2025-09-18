// interactiveNotifComponent.ts
import dom from "../../shared/dom.js";
import api from "../../shared//api/api.js";
import { updateNotifStack } from "../../shared/util/notifTool.js";

// Define the expected notification type
interface InteractiveNotification {
  interactive: boolean;
  invitationId?: string;
  content: string;
  user: string;
  time: string;
  context: "friendship" | "match" | "tournament";
  notifId: number;
}

function interactiveNotifComponent(
  notification: InteractiveNotification,
): HTMLElement {
  const bgColor =
    notification.context === "friendship"
      ? "accentColour"
      : notification.context === "match"
      ? "secondaryText"
      : "secondaryText";

  
  const pictogram =
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
     stroke="currentColor" stroke-width="3.5"
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
     stroke="currentColor" stroke-width="3.5"
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
  



  // Notification with Accept/Decline buttons
const element = dom.create(`
  <div class="rounded-2xl w-full max-w-sm mx-auto my-8 overflow-hidden 
              border border-[0.2rem] border-${bgColor} shadow-md ring-1 ring-black/10">

    <!-- Header -->
    <div class="relative flex items-center justify-between px-4 py-3 font-bold font-headline
                text-${bgColor} border-b-[0.1rem] border-${bgColor} rounded-t">

      <!-- left: type + pictogram -->
      <div class="flex items-center gap-3 leading-none">
        <span class="capitalize">${notification.context}</span>
        <span class="inline-flex items-center justify-center">
          ${
            pictogram
              .replace('<svg', '<svg class="shrink-0 align-middle"')
              .replace('stroke="#', 'stroke="currentColor"')
          }
        </span>
      </div>

      <!-- right: action circles -->
      <div class="flex items-center gap-2">
      <button 
  data-id="decline-btn"
  aria-label="Decline"
  class="relative inline-flex items-center justify-center w-10 h-10 rounded-full
         border-2 border-redColour text-redColour
         active:scale-95 hover:bg-redColour/10 focus:outline-none group">

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
       fill="none" stroke="currentColor" stroke-width="2.5"
       class="w-5 h-5">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l8 8M14 6l-8 8"/>
  </svg>

  <!-- Tooltip -->
  <span 
    class="absolute bottom-full translate-y-6 mt-5 px-2 py-1 text-[0.8rem] font-headline font-bold text-darkerBackground bg-redColour rounded 
           opacity-0 group-hover:opacity-100 transition-opacity">
    Decline?
  </span>
</button>


        <button 
  data-id="accept-btn" 
  aria-label="Accept"
  class="relative inline-flex items-center justify-center mx-1 w-10 h-10 rounded-full
         bg-greenColour text-darkerBackground
         active:scale-95 hover:brightness-110 focus:outline-none group">

  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38.97 25.35"
       fill="none" stroke="currentColor" stroke-width="5"
       class="w-5 h-5">
    <polyline points="1.5 10.22 4.95 13.67 15.13 23.85 37.47 1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <!-- Tooltip -->
  <span 
    class="absolute bottom-full mb-0 translate-y-6 px-2 py-1 text-[0.8rem] text-darkerBackground 
           bg-greenColour rounded opacity-0 group-hover:opacity-100 transition-opacity">
    Accept
  </span>
</button>

      </div>
    </div>

    <!-- Body -->
    <div class="p-4 text-lightText font-bold font-headline rounded-b">
      <span class="block">${notification.content}</span>
    </div>
  </div>
`);


  const currentUserId = window.app.state.user?.id;
  const senderId = notification.user;
  // Button event listeners
  element
    .querySelector('[data-id="accept-btn"]')
    ?.addEventListener("click", async () => {
      try {
        //In case of mutually sent invitation: From backend's notification database, delete notification of this invitation in order to update other user's notif list
        //test
        console.log(
          "query backend for possible mutual invitation between users: ",
          currentUserId,
          parseInt(senderId, 10),
        );
        //
        await api.deleteNotifForMutualInvitation(
          currentUserId,
          parseInt(senderId, 10),
        );
        await api.deleteMutualInvitation(currentUserId, parseInt(senderId, 10));

        await api.acceptInvitation(notification.invitationId);
        await api.deleteHandledNotif(notification.notifId, currentUserId);
        element.remove();
		updateNotifStack(notification.notifId);
        if (
          window.app.state.notificationCount &&
          window.app.state.notificationCount > 0
        )
          window.app.state.notificationCount--;
        window.dispatchEvent(new Event("notif-badge-update"));
      } catch (err) {
        // console.error(err);
        const error = err as { status?: number; message?: string }; //Type assertion
        // 🟡 If error is 404 (invitation no longer exists), remove the notification anyway
        if (error?.message?.includes("404") || error?.status === 404) {
          alert("This invitation no longer exists. Unable to accept it.");
          await api.deleteHandledNotif(notification.notifId, currentUserId);
          element.remove(); // <-- Added this
          updateNotifStack(notification.notifId);
          if (
            window.app.state.notificationCount &&
            window.app.state.notificationCount > 0
          )
            window.app.state.notificationCount--;
          window.dispatchEvent(new Event("notif-badge-update"));
        }
      }
    });

  element
    .querySelector('[data-id="decline-btn"]')
    ?.addEventListener("click", async () => {
      try {
        //In case of mutually sent invitation: From backend's notification database, delete notification about this invitation in order to update other user's notif list
        await api.deleteNotifForMutualInvitation(
          currentUserId,
          parseInt(senderId, 10),
        );
        await api.deleteMutualInvitation(currentUserId, parseInt(senderId, 10));

        await api.declineInvitation(notification.invitationId);
        //test
        console.log(
          "declined invitation, ready to delete handled notification",
        );
        //
        await api.deleteHandledNotif(notification.notifId, currentUserId);
        element.remove();
        updateNotifStack(notification.notifId);
        if (
          window.app.state.notificationCount &&
          window.app.state.notificationCount > 0
        )
          window.app.state.notificationCount--;
        window.dispatchEvent(new Event("notif-badge-update"));
      } catch (err) {
        // console.error(err);
        const error = err as { status?: number; message?: string }; //Type assertion
        // 🟡 If error is 404 (invitation no longer exists), remove the notification anyway
        if (error?.message?.includes("404") || error?.status === 404) {
          alert("This invitation no longer exists. Unable to decline it.");
          await api.deleteHandledNotif(notification.notifId, currentUserId);
          element.remove();
          updateNotifStack(notification.notifId);
          if (
            window.app.state.notificationCount &&
            window.app.state.notificationCount > 0
          )
            window.app.state.notificationCount--;
          window.dispatchEvent(new Event("notif-badge-update"));
        }
      }
    });

  return element;
}

export default interactiveNotifComponent;

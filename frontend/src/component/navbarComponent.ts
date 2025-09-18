import dom from "../shared/dom.js";
import avatarComponent from "./profile/avatarComponent.js";
import notificationIconComponent from "./notification/notificationIconComponent.js";
import chatIconComponent from "./chat/chatIconComponent.js";
import peopleIconComponent from "./people/peopleIconComponent.js";
import router from "../router.js";
import websocketManager from "../websocket/WebsocketManager.js";
import api from "../shared/api/api.js";
import currentChatsComponent from "./chat/currentChatsComponent.js";
import currentPeopleComponent from "./people/currentPeopleComponent.js";
import { updateNotifBadge } from "../shared/util/notifTool.js";

type NavbarComponent = {
  component: HTMLElement;
  update: (route: string) => void;
};

async function navbarComponent(): Promise<NavbarComponent> {
  await api.getCurrentUser();
  const myUsername = window.app.state.user?.username;
  const component = dom.create(`
    <nav class="bg-darkerBackground relative py-4">
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
               <div class="homeBtn absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0">

<svg 
 xmlns="http://www.w3.org/2000/svg"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 width="336px" height="384px">
<image  x="50%" y="50%" width="36"  transform="translate(-18,-18)" xlink:href="data:img/png;base64,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" />
</svg>
            </div>
        <div class="flex h-16 items-center justify-between">
          <!-- Left side: Logo and main links -->
          <div class="flex items-center ">
   
            <!-- Desktop menu (hidden on mobile) -->
            <div class="hidden md:block">
              <div class="flex items-baseline space-x-4">
                <a data-id="navbar-link" href="/pong">Train to Pong</a>
				        <a data-id="navbar-link" href="/invitation">Start a Match</a>
                <a data-id="navbar-link" href="/ranking">Ranking</a>
              </div>
            </div>
          </div>

          

          <!-- Right side: User profile and notifications -->
          <div class="hidden md:block">

            <div class="ml-4 flex items-center md:ml-6">
               <div data-id="people-icon"><!-- People icon --></div>

              <div data-id="chat-icon"><!-- Chat icon --></div>

              <div data-id="notification-icon"><!-- Notification --></div>

                <!-- Profile dropdown -->
                <div class="relative ml-3 group">
                  <div>
                    <button
                      type="button"
                      class="relative flex max-w-xs items-center  bg-transparent text-sm "
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span class="sr-only">Open user menu</span>
                      <div data-id="user-avatar"></div>
                    </button>
                  </div>

                  <!-- DROPDOWN menu -->
                                <div
                class="invisible opacity-0 absolute right-0 z-10 px-8 py-8  mt-4 w-80 origin-top-right bg-darkerBackground transition-all duration-200 ease-in-out group-hover:visible group-hover:opacity-100 flex flex-col"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <a href="/profile" 
                  class="block px-4 py-2 text-[1.1rem] text-lightText hover:text-accentColour font-bold font-headline " 
                  role="menuitem">
                  Your Stats (${myUsername})
                </a>

                <a href="/settings" 
                  class="block px-4 py-4 text-[1.1rem] text-lightText hover:text-accentColour  font-bold font-headline  " 
                  role="menuitem">
                  Settings
                </a>

                <!-- spacer pushes Sign out down -->
                <div class="flex-grow"></div>
                <a data-id="signout-button" 
                  class="cursor-pointer px-4 py-2 text-[1.1rem] font-bold text-lightText hover:text-accentColour font-headline" 
                  role="menuitem">
                  Sign out
                </a>
              </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `);

  // --- Selectors ---
  const navbarLinksSelector = component.querySelectorAll(
    '[data-id="navbar-link"]'
  );
  const notificationIconSelector = component.querySelector(
    '[data-id="notification-icon"]'
  ) as HTMLElement;
  const avatarSelector = component.querySelector(
    '[data-id="user-avatar"]'
  ) as HTMLElement;
  const chatIconSelector = component.querySelector(
    '[data-id="chat-icon"]'
  ) as HTMLElement;
  const peopleIconSelector = component.querySelector(
    `[data-id="people-icon"]`
  ) as HTMLElement
  const signoutSelector = component.querySelector(
    '[data-id="signout-button"'
  ) as HTMLElement;

  const homeBtn = component.querySelector(".homeBtn") as HTMLElement;

  // --- Update notif badge ---
  updateNotifBadge();

  // --- eventListeners ---
  signoutSelector.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      const data = await api.logout();
      // disconnect websocket
      websocketManager.disconnect();
      // clear frontend user state
      window.app.state.user = null;
      // clear notifications
      window.app.notifications = [];
      // clear all registered events
      dom.cleanupEvents();

      alert(data.message || "You are now logged out.");
      router.go("/login");
    } catch (error) {
      alert((error as Error).message);
    }
  });

  const profileLinkSelector = component.querySelector(
    '[data-id="nav-profile-link"]'
  ) as HTMLElement;

  profileLinkSelector?.addEventListener("click", (event) => {
    event.preventDefault();
    const user = window.app?.state?.user;
    if (user) {
      router.go("/profile", true); // triggers reload and sets correct view
    }
  });

  homeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    router.go("/", true);
  });

  // --- Sub-components ---
  // --- Avatar ---
  if (avatarSelector && window.app.state.user)
    dom.mount(avatarSelector, avatarComponent(window.app.state.user, 48));

  // --- Notification ---
  if (notificationIconSelector) {
    //test
    console.log("rendering notification icon - notification badge...");
    //
    dom.mount(notificationIconSelector, notificationIconComponent());
  }

  // --- Chat icon ---
  if (chatIconSelector) {
    dom.mount(chatIconSelector, chatIconComponent());
    chatIconSelector.addEventListener("click", async () => {
      const currentChats = await currentChatsComponent();
      dom.navigateTo(currentChats, "sidebar-chat-content");
    });
  }

  // --- People icon ---
  if (peopleIconSelector)
  {
    dom.mount(peopleIconSelector, peopleIconComponent());
    peopleIconSelector.addEventListener("click", async() => {
      const currentPeople = await currentPeopleComponent();
      dom.navigateTo(currentPeople, "sidebar-people-content");
    } )
  }

  // --- Update navbar component ---
  const update = (route: string): void => {
    let isHighlighted = false;
    const defaultLinkClasses =
      "rounded-md px-3 py-2 text-[1.1rem] font-bold  font-headline text-lightText hover:text-accentColour hover:lightText";
    const activeLinkClasses =
      "rounded-md  px-3 py-2 text-[1.1rem] font-bold font-headline text-secondaryText";

    navbarLinksSelector.forEach((link) => {
      if (link.getAttribute("href") === route) {
        isHighlighted = true;
        link.className = activeLinkClasses;
      } else link.className = defaultLinkClasses;
    });

    if (!isHighlighted) navbarLinksSelector[0].className = activeLinkClasses;
  };

  return {
    component,
    update,
  };
}

export default navbarComponent;

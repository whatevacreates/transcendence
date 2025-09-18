import dom from "./shared/dom.js";
import api from "./shared/api/api.js";
import renderUsers from "./shared/util/renderUserList.js";
import { renderNotifs } from "./shared/util/notifTool.js";
import User from "./shared/interface/User.js";

// --- Importing components ---
import navbarComponent from "./component/navbarComponent.js";
import sidebarComponent from "./component/sidebarComponent.js";
import currentChatsComponent from "./component/chat/currentChatsComponent.js";
import currentPeopleComponent from "./component/people/currentPeopleComponent.js"
import notificationComponent from "./component/notification/notificationComponent.js";

// --- Importing views ---
import loginView from "./view/loginView.js";
import registerView from "./view/registerView.js";
import rankingView from "./view/rankingView.js";
import invitationView from "./view/invitationView.js";
import pongView from "./view/pongView.js";
import profileView from "./view/profileView.js";
import settingsView from "./view/settingsView.js";

// --- Routes ---
const routes = [
  { title: "Pong", uri: "/", view: pongView, protected: true },
  { title: "Login", uri: "/login", view: loginView, protected: false },
  { title: "Register", uri: "/register", view: registerView, protected: false },
  { title: "Ranking", uri: "/ranking", view: rankingView, protected: true },
  {
    title: "Start a Match",
    uri: "/invitation",
    view: invitationView,
    protected: true,
  },
  { title: "Profile", uri: "/profile", view: profileView, protected: true },
  { title: "Settings", uri: "/settings", view: settingsView, protected: true },
];

// --- Types ---
interface Notification {
  interactive: boolean;
  invitationId?: string;
  content: string;
  user: string;
  time: string;
  context: "friendship" | "match" | "tournament";
  notifId: number;
}

const Router = {
  currentRoute: window.location.pathname, // Track current route

  init: () => {
    // websocketManager.connect();

    window.addEventListener("ws:redirect", (event) => {
      Router.go("/");
    });

    // Improved link handling
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        event.preventDefault();
        const href = anchor.getAttribute("href");
        if (href) Router.go(href);
      }
    });

    // Enhanced popstate handling
    window.addEventListener("popstate", (event) => {
      if (event.state?.route) {
        Router.go(event.state.route, false);
      } else {
        Router.go(location.pathname, false);
      }
    });

    // Initialize with proper state
    history.replaceState({ route: location.pathname }, "", location.pathname);
    Router.go(location.pathname, false);
  },

  go: async (route: string, addToHistory = true): Promise<void> => {
    dom.cleanupEvents();

    await api.getCurrentUser();

    // Normalize route (remove trailing slashes)
    route = route.replace(/\/+$/, "") || "/";

    const targetRoute = routes.find((r) => r.uri === route);
    const isProtected = targetRoute?.protected ?? false;

    // Handle route protection and auth redirects
    if (isProtected && !window.app.state.user) {
      if (Router.currentRoute !== "/login") {
        history.replaceState({ route: "/login" }, "", "/login");
        return Router.go("/login", false);
      }
      return;
    }

    if (
      !isProtected &&
      (route === "/login" || route === "/register") &&
      window.app.state.user
    ) {
      if (Router.currentRoute !== "/") {
        history.replaceState({ route: "/" }, "", "/");
        return Router.go("/", false);
      }
      return;
    }

    // Update history if needed
    if (addToHistory) {
      history.pushState({ route }, "", route);
    }

    Router.currentRoute = route;

    // Rest of your view rendering code...
    //const routeObj = routes.find(r => r.uri === route) || routes[0];

    const routeObj = routes.find((r) => r.uri === route);

    if (!routeObj) {
      if (route !== "/") {
        return Router.go("/");
      }
      return;
    }

    let view;
    if (route === "/profile") {
      const stateUser = history.state?.user;
      view = await routeObj.view(stateUser);
    } else {
      view = await routeObj.view();
    }

    if (view) {
      // --- Set title (always) ---
      if (
        window.app.selector &&
        window.app.selector.title1 &&
        window.app.selector.title2
      ) {
        window.app.selector.title1.textContent = routeObj.title;
        window.app.selector.title2.textContent = routeObj.title;
      }

      if (routeObj.protected) {
        // --- Set navbar ---
        const navbar = await navbarComponent();
        if (window.app.selector)
          dom.mount(window.app.selector.navbar, navbar.component);
        navbar.update(route);

        // --- Set notification sidebar ---
        if (window.app.selector) {
          dom.mount(
            window.app.selector.sidebarNotification,
            sidebarComponent({
              identifier: "notification",
              title: "Notification",
            }),
          );
        }
        renderNotifs();

        // --- Set chat sidebar ---
        if (window.app.selector) {
          dom.mount(
            window.app.selector.sidebarChat,
            sidebarComponent({
              identifier: "chat",
              title: "Chat",
            }),
          );
        }

        if(window.app.selector)
        {
          dom.mount(
            window.app.selector.sidebarPeople,
            sidebarComponent({
              identifier: "people",
              title: "People",
            })
          );
        }

        const sidebarChatContent = document.querySelector(
          '[data-id="sidebar-chat-content"]',
        ) as HTMLElement;

        const sidebarPeopleContent = document.querySelector (
          '[data-id="sidebar-people-content"]',
        ) as HTMLElement;

        if (sidebarChatContent) {
          // const chatElement = chatComponent();
          const chatElement = await currentChatsComponent();
          dom.mount(sidebarChatContent, chatElement);

          window.addEventListener("friendship-status-updated", () => {
            //test
            console.log(
              "renderUsers to update friendship status triggered by dispatched event",
            );
            //
            const userList = document.querySelector(
              '[data-id="user-list"]',
            ) as HTMLElement;
            if (userList) renderUsers(userList);
          });
        }
        if(sidebarPeopleContent)
        {
          const peopleElement = await currentPeopleComponent();
          dom.mount(sidebarPeopleContent, peopleElement);
          window.addEventListener("friendship-status-updated", () => {
            const userList = document.querySelector(
              '[data-id="user-list"]',
            ) as HTMLElement;
            if (userList) renderUsers(userList);
          })
        }
      } else {
        // --- Clear navbar and sidebars on public pages ---
        if (
          window.app.selector &&
          window.app.selector.navbar &&
          window.app.selector.sidebarNotification &&
          window.app.selector.sidebarChat &&
          window.app.selector.sidebarPeople
        ) {
          window.app.selector.navbar.innerHTML = "";
          window.app.selector.sidebarNotification.innerHTML = "";
          window.app.selector.sidebarChat.innerHTML = "";
          window.app.selector.sidebarPeople.innerHTML = "";
        }
      }

      // --- Set view ---
      if (window.app.selector && window.app.selector.view) {
        window.app.selector.view.innerHTML = "";
        dom.mount(window.app.selector.view, view);
      }
    }

    // --- Reset scrollbar ---
    window.scrollX = 0;
  },

  goToProfile: (user: User) => {
    const encoded = encodeURIComponent(JSON.stringify(user));
    history.pushState({ route: "/profile", user }, "", "/profile");
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: { route: "/profile", user } }),
    );
  },
};

export default Router;

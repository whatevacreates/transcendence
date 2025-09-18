import dom from "../../shared/dom.js";

function notificationIconComponent(): HTMLElement {
  // =============================================================================
  // Component
  // =============================================================================

  const component = dom.create(`
    <div>
      <button data-id="notification-bell" type="button" class="relative rounded-full p-1 text-lightText hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
        <span class="absolute -inset-1.5"></span>
        <span class="sr-only">View notifications</span>

        <!-- Invitation icon (bell) -->
       <svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 27.83 34.47"
     width="28" height="28"
     fill="none"
     stroke="currentColor" stroke-width="3" stroke-miterlimit="10"
     aria-hidden="true" role="img">
  <path d="M16.28,5.95c.31-.46.49-1,.49-1.59,0-1.58-1.28-2.85-2.85-2.85s-2.85,1.28-2.85,2.85c0,.39.08.77.22,1.11"/>
  <path d="M8.75,27.8c0,2.85,2.31,5.16,5.16,5.16s5.16-2.31,5.16-5.16"/>
  <path d="M25.83,21.69c-.37-.74-.87-1.41-1.34-2.09-1.05-1.52-2.05-3.25-2.56-5.04-.36-1.29-.5-2.63-.84-3.93-.28-1.09-.88-2.12-1.62-2.98-.73-.84-1.64-1.51-2.65-1.97-.26-.12-1.91-.81-3.31-.58h0c-1.16.06-2.29.52-2.5.62-1.01.46-1.92,1.13-2.65,1.97-.74.85-1.34,1.88-1.62,2.98-.33,1.3-.47,2.64-.84,3.93-.51,1.79-1.51,3.52-2.56,5.04-.47.68-.97,1.35-1.34,2.09-1.62,3.26.93,7.16,4.53,7.16.25,0,.86.03,1.09,0l12.59-.04c.24.03.85,0,1.09,0,3.59,0,6.14-3.9,4.53-7.16Z"/>
</svg>

        
        <!-- Invitation notification badge -->
        <span data-id="notification-badge" hidden class="hidden absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">0</span>
      </button>
    </div>
  `);

  // =============================================================================
  // State
  // =============================================================================

  //window.app.state.notificationCount = 0;

  // =============================================================================
  // DOM Selectors
  // =============================================================================

  const notificationBadgeSelector = component.querySelector(
    '[data-id="notification-badge"]',
  ) as HTMLElement;
  const notificationBellSelector = component.querySelector(
    '[data-id="notification-bell"]',
  ) as HTMLElement;

  if (notificationBadgeSelector && window.app.state.notificationCount !== 0) {
    notificationBadgeSelector.textContent = String(
      window.app.state.notificationCount,
    );
    notificationBadgeSelector.classList.remove("hidden");
  }

  // --- Listen event : Reset notification ---
  //window.addEventListener("notification-reset", (event) => {
  //updateNotifBadge();
  //});

  // --- Dispatch event ---
  if (notificationBellSelector) {
    notificationBellSelector.addEventListener("click", () => {
      window.dispatchEvent(new Event("sidebar-notification-toggle"));
    });
  }

  return component;
}

export default notificationIconComponent;

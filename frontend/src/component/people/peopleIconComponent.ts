import dom from '../../shared/dom.js';

function peopleIconComponent(): HTMLElement {

  // =============================================================================
  // Component
  // =============================================================================

  const component = dom.create(`
    <div>
      <button data-id="people-icon" type="button" class="relative rounded-full p-1 px-2 ">
        <span class="absolute -inset-1.5"></span>
        <span class="sr-only">View notifications</span>

<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 45.43 38.96"
     width="33" height="33"
     fill="none"
     stroke="currentColor" stroke-width="3.6"
     aria-hidden="true" role="img">
  <path d="M24.05,37.46v-3.09c0-4.53-3.71-8.25-8.25-8.25h-6.06c-4.53,0-8.25,3.71-8.25,8.25v3.09"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12.78" cy="14.44" r="7.93" stroke-miterlimit="10"/>
  <path d="M43.93,32.45v-3.09c0-4.53-3.71-8.25-8.25-8.25h-6.06c-4.07,0-7.48,3-8.13,6.89"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="32.66" cy="9.43" r="7.93" stroke-miterlimit="10"/>
</svg>

        <span data-id="people-badge" hidden class="hidden absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">0</span>
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

  const peopleIconSelector = component.querySelector('[data-id="people-icon"]') as HTMLElement;
  const peopleBadgeSelector = component.querySelector('[data-id="people-badge"]') as HTMLElement;

  // --- Dispatch event : Toggle right sidebar ---
  if (peopleIconSelector) {
    peopleIconSelector.addEventListener("click", () => {
      window.dispatchEvent(new Event("sidebar-people-toggle"));
    });
  }

  return component;
}

export default peopleIconComponent;
import dom from "../shared/dom.js";

interface SidebarProps {
  identifier: String;
  title?: String;
}

function sidebarComponent(props: SidebarProps): HTMLElement
{
  // =============================================================================
  // Component
  // =============================================================================

  let {identifier, title = "Default"} = props;

  const component = dom.create(`
    <div class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true" style="display: none;">
      <!--
        Background backdrop, show/hide based on slide-over state.

        Entering: "ease-in-out duration-500"
          From: "opacity-0"
          To: "opacity-100"
        Leaving: "ease-in-out duration-500"
          From: "opacity-100"
          To: "opacity-0"
      -->
      <div class="fixed inset-0 bg-darkerBackground/50 transition-opacity" aria-hidden="true"></div>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <!--
              Slide-over panel, show/hide based on slide-over state.

              Entering: "transform transition ease-in-out duration-500 sm:duration-700"
                From: "translate-x-full"
                To: "translate-x-0"
              Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
                From: "translate-x-0"
                To: "translate-x-full"
            -->
            <div class="pointer-events-auto relative w-screen max-w-md">
              <!--
                Close button, show/hide based on slide-over state.

                Entering: "ease-in-out duration-500"
                  From: "opacity-0"
                  To: "opacity-100"
                Leaving: "ease-in-out duration-500"
                  From: "opacity-100"
                  To: "opacity-0"
              -->
              <div class="absolute py-6 right-5 ">
                <button type="button" class="relative rounded-md text-lightText hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden">
                  <span class="absolute -inset-2.5"></span>
                  <span class="sr-only">Close panel</span>
                  <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke-width="3" rounded-full stroke="currentColor" aria-hidden="true" data-slot="icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="panel flex h-full flex-col overflow-y-auto border-l-[1px] border-accentColour bg-darkerBackground py-6">
                <div class="px-6 sm:px-6">
                  <h2 class="font-headline text-[1.3rem] font-bold text-lightText" id="slide-over-title">${title}</h2>
                </div>
                <div data-id="sidebar-${identifier}-content" class="relative mt-4 flex-1 px-4 sm:px-6">
                  <!-- Sidebar content -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);

  // =============================================================================
  // State
  // =============================================================================

  let isOpen = false;

  // =============================================================================
  // DOM Selectors
  // =============================================================================

  const sidebarCloseButtonSelector = component.querySelector("button");
  const panel = component.querySelector(".panel");

  // =============================================================================
  // Events
  // =============================================================================

  // --- Dispatch event : Toggle right sidebar ---
  if (sidebarCloseButtonSelector) {
    sidebarCloseButtonSelector.addEventListener("click", () => {
      window.dispatchEvent(new Event(`sidebar-${identifier}-toggle`));
    });
  }

  component.addEventListener("click", (e) => {
  if (!isOpen) return;
  const target = e.target as Node;
  if (panel && !panel.contains(target)) {
    window.dispatchEvent(new Event(`sidebar-${identifier}-toggle`));
  }
});







  // --- Listen event : Toggle right sidebar ---
  window.addEventListener(`sidebar-${identifier}-toggle`, (event) => {
    isOpen = !isOpen;
    component.style.display = isOpen ? 'block' : 'none';
  });


  return component;
}

export default sidebarComponent;
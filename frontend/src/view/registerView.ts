import dom from "../shared/dom.js";
import registerComponent from "../component/user/registerComponent.js";

function RegisterView(): HTMLElement {
  const registerView = dom.create(`
    <div class="min-h-full">
      <main>
        <div data-id="register" class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"></div>
      </main>
    </div>
  `);

  // --- Selectors ---
  const registerSelector : HTMLElement | null = registerView.querySelector('[data-id="register"]');

  // --- Loading and mounting nested components ---
  const registerForm = registerComponent();

  if (registerSelector)
    dom.mount(registerSelector, registerForm);

  return registerView;
}

export default RegisterView;
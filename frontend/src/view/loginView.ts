import dom from "../shared/dom.js";
import loginComponent from "../component/user/loginComponent.js";

function LoginView(): HTMLElement {
    const loginView = dom.create(`
        <div class="min-h-full">
            <main>
                <div data-id="register" class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 bg-transparent"></div>
            </main>
        </div>
        `);

  // --- Selectors ---
    const loginSelector : HTMLElement | null = loginView.querySelector('[data-id="register"]');

  // --- Loading and mounting nested components ---
    const loginForm = loginComponent();

    if (loginSelector)
        dom.mount(loginSelector, loginForm);

    return loginView;
}

export default LoginView;
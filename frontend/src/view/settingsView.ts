import dom from '../shared/dom.js';
import settingsComponent from '../component/profile/settingsComponent.js';
import User from '../shared/interface/User.js';
import api from '../shared/api/api.js';

// optional user parameter
async function settingsView(user?: User): Promise<HTMLElement> {
    const settingsView = dom.create(`
        <div class="p-8 space-y-4 text-primary">
            <div data-id="settings-component"></div>
        </div>
    `)
    
    const settingsSelector: HTMLElement | null = settingsView.querySelector('[data-id="settings-component"]');

    
    let resolvedUser = user;
    if (!resolvedUser) {
        await api.getCurrentUser();
        resolvedUser = window?.app?.state?.user ?? undefined;
    }

    if (!resolvedUser) {
        console.warn("No user found, settings cannot be rendered.");
        return settingsView; // or show a "Not logged in" message
    }
    const component = await settingsComponent(resolvedUser);
    
    if (settingsSelector)
        dom.mount(settingsSelector, component);

    return settingsView;
    
}

export default settingsView;
import dom from '../shared/dom.js';
import profileComponent from '../component/profile/profileComponent.js';
import User from '../shared/interface/User.js';
import api from '../shared/api/api.js';


// optional user parameter
async function ProfileView(user?: User): Promise<HTMLElement> {
    const profileView = dom.create(`
        <div class="p-8 space-y-6  min-h-screen text-primary">
            <div data-id="profile-component"></div>
        </div>
    `)
    
    const profileSelector: HTMLElement | null = profileView.querySelector('[data-id="profile-component"]');

    let resolvedUser = user;
    if (!resolvedUser) {
        await api.getCurrentUser();
        resolvedUser = window?.app?.state?.user ?? undefined;
    }

    if (!resolvedUser) {
        console.warn("No user found, profile cannot be rendered.");
        return profileView; 
    }
    const component = await profileComponent(resolvedUser);
    
    if (profileSelector)
        dom.mount(profileSelector, component);

    return profileView;
    
}

export default ProfileView;
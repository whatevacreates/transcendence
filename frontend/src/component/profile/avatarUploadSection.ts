import dom from '../../shared/dom.js';
import User from '../../shared/interface/User.js';
import avatarComponent from './avatarComponent.js';
import api from '../../shared/api/api.js';
import validate from '../../shared/util/validate.js';

// =============================================================================
// Component: 
// =============================================================================

function avatarUploadSection(user: User): HTMLElement {
    const container = dom.create(`
        <div class="flex flex-col items-center gap-2">
            <div data-id="avatar-slot"></div>
            <button class="text-secondaryText text-[1.1rem] font-bold font-headline hover:underline" data-id="edit-avatar-button">Edit Avatar</button>
        </div>
    `);

// =============================================================================
// Query Selectors: 
// =============================================================================

    const avatarSlot = container.querySelector('[data-id="avatar-slot"]') as HTMLElement;
    dom.mount(avatarSlot, avatarComponent(user));

    const editButton = container.querySelector('[data-id="edit-avatar-button"]')!;
    const fileInput = dom.create(`<input type="file" accept="image/*" style="display:none" />`) as HTMLInputElement;

    container.appendChild(fileInput);

// =============================================================================
// Event Listeners: 
// =============================================================================

    editButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const error = validate.isValidImage(file);
        if (error) {
            alert(error);
            return;
        }

        try {
            await api.uploadAvatar(file);
            const avatarImg = avatarSlot.querySelector('img');
            if (avatarImg) {
                avatarImg.src = `/api/user/avatar/${user.id}?t=${Date.now()}`;
            }
        } catch (err) {
            console.error('Avatar upload failed', err);
            alert('Failed to upload avatar');
        }
    });

    return container;
}

export default avatarUploadSection;
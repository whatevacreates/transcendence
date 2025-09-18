import dom from '../../shared/dom.js';
import User from '../../shared/interface/User.js';
import api from '../../shared/api/api.js';
import avatarUploadSection from './avatarUploadSection.js';
import createEditableField from './editableField.js';

async function settingsComponent(user: User): Promise<HTMLElement> {
    await api.getCurrentUser();

// =============================================================================
// Component: 
// =============================================================================

    const container = dom.create(`
        <div class="flex flex-col md:flex-row items-start gap-6 p-6 bg-darkerBackground rounded-xl  w-full max-w-4xl mx-auto" data-id="settings-container">
            <!-- Avatar Slot -->
            <div class="flex flex-col items-center gap-2 flex-shrink-0" data-id="avatar-section"></div>

            <!-- Editable Fields -->
            <div class="flex flex-col gap-4 w-full text-sm text-darkerBackground" data-id="info-container"></div>
        </div>
    `);

// =============================================================================
// Query Selectors: 
// =============================================================================

    const avatarElement = container.querySelector('[data-id="avatar-section"]')!;
    const infoContainer = container.querySelector('[data-id="info-container"]')!;
    
    
    avatarElement.appendChild(avatarUploadSection(user));
    infoContainer.appendChild(createEditableField('username', user.username));
    infoContainer.appendChild(createEditableField('password', '••••••••'));

    return container;
}

export default settingsComponent;

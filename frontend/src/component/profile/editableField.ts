import dom from '../../shared/dom.js';
import escapeHtml from '../../shared/util/escapeHtml.js';
import validate from '../../shared/util/validate.js';
import api from '../../shared/api/api.js';

// =============================================================================
// Component
// =============================================================================

function createEditableField(key: 'username' | 'password', initialValue: string): HTMLElement {
    const container = dom.create(`
        <div class="flex  justify-between items-center border-b pb-2" data-id="field-${key}">
            <div>
                <div class="text-[0.9rem] text-accentColour font-bold font-headline">${capitalize(key)}</div>
                <div class="text-[1.1rem] text-lightText font-bold font-headline" data-id="value-${key}">${escapeHtml(initialValue)}</div>
            </div>
            <button class="font-headline font-bold text-accentColour text-[1.1rem] hover:underline" data-id="edit-${key}-button">Edit</button>
        </div>
    `);

    let valueElement = container.querySelector(`[data-id="value-${key}"]`)! as HTMLElement;
    const button = container.querySelector(`[data-id="edit-${key}-button"]`)! as HTMLButtonElement;
    let isEditing = false;

    async function handleSave(input: HTMLInputElement) {
        const newValue = input.value.trim();
        const validation = key === 'username'
            ? validate.validateUsername(newValue)
            : validate.validatePassword(newValue);

        if (!validation.valid) {
            alert(validation.error);
            resetToDisplay(initialValue, input); 
            return;
        }

        try {
            const result = await api.updateUser(window.app.state.user!.id, key, newValue);
            if (!result.ok) {
                alert(result.message || "Unable to update user");
                resetToDisplay(initialValue, input);
                return;
            }
            const newDisplay = dom.create(`<div data-id="value-${key}">${key === 'password' ? '••••••••' : escapeHtml(newValue)}</div>`);
            input.replaceWith(newDisplay);
            button.textContent = 'Edit';
            valueElement = newDisplay;
            isEditing = false;
        } catch (err: any) {
            alert("Something went wrong. Please try again.");
            resetToDisplay(initialValue, input);
        }
    }

    function resetToDisplay(value: string, input: HTMLElement) {
        const originalDisplay = dom.create(`<div data-id="value-${key}">${key === 'password' ? '••••••••' : escapeHtml(value)}</div>`);
        button.textContent = 'Edit';
        input.replaceWith(originalDisplay);
        valueElement = originalDisplay;
        isEditing = false;
    }


    function handleEdit() {
        if (isEditing) return;

        const input = dom.create(`
            <input type="${key === 'password' ? 'password' : 'text'}"
                    value="${key === 'password' ? '' : valueElement.textContent || ''}"
                    class="border rounded px-2 py-1 text-[1.1rem] w-full font-headline font-lightText"
                    data-id="input-${key}" />
        `) as HTMLInputElement;

        valueElement.replaceWith(input);
        button.textContent = 'Save';
        isEditing = true;

        button.onclick = null;
        button.onclick = () => handleSave(input);
    }

    button.addEventListener('click', handleEdit);

    return container;
}


// =============================================================================
// Utils:
// =============================================================================

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export default createEditableField;
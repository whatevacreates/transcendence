import ValidationResult from '../interface/ValidationResult.js';

function validateUsername(username: string): ValidationResult {
    const maxUsernameLength = 16;
    if (!username) return { valid: false, error: "Username is required." };
    if (username.length > maxUsernameLength) {
        return { valid: false, error: `Username must be at most ${maxUsernameLength} characters long.` };
    }
    return { valid: true };
}

function validatePassword(password: string): ValidationResult {
    const maxPasswordLength = 16;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{1,}$/;

    if (!password) return { valid: false, error: "Password is required." };
    if (password.length > maxPasswordLength) {
        return { valid: false, error: `Password must be at most ${maxPasswordLength} characters long.` };
    }
    if (!passwordRegex.test(password)) {
        return { valid: false, error: "Password must contain at least one letter and one digit." };
    }
    return { valid: true };
}

function isValidImage(file: File): string | null {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        return "Only JPG, PNG, GIF, and WEBP files are allowed.";
    }
    if (file.name.toLowerCase().endsWith('.svg')) {
        return "SVG files are not allowed.";
    }
    if (file.size > maxSize) {
        return "File is too large. Maximum size is 2MB.";
    }
    return null;
}

function validateAlias(alias: string): ValidationResult {
    const maxAliasLength = 16;

    if (!alias || typeof alias !== "string") {
        return { valid: false, error: "Alias is required." };
    }

    //  Basic XSS handling (HTML tags)
    const sanitized = alias.replace(/<[^>]*>?/gm, "").trim();

    if (sanitized.length === 0) {
        return { valid: false, error: "Alias cannot be empty or only contain HTML." };
    }

    if (sanitized.length > maxAliasLength) {
        return { valid: false, error: `Alias must be at most ${maxAliasLength} characters.` };
    }

    return { valid: true };
}


const validate = {
    validateUsername,
    validatePassword,
    isValidImage,
    validateAlias
};

export default validate;

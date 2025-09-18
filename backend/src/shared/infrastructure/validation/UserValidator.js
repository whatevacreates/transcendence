function validateUsername(username) {
    const maxUsernameLength = 16;
    if (!username) 
        return { valid: false, error: "Username is required." };
    if (username.length > maxUsernameLength) {
        return { valid: false, error: `Username must be at most ${maxUsernameLength} characters long.` };
    }
    return { valid: true };
}

function validatePassword(password) {
    const minPasswordLength = 6;
    const maxPasswordLength = 16;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{1,}$/;

    if (!password) 
        return { valid: false, error: "Password is required." };
    if (password.length < minPasswordLength) {
        return { valid: false, error: `Password must be at least ${minPasswordLength} characters long.` };
    }
    if (password.length > maxPasswordLength) {
        return { valid: false, error: `Password must be at most ${maxPasswordLength} characters long.` };
    }
    if (!passwordRegex.test(password)) {
        return { valid: false, error: "Password must contain at least one letter and one digit." };
    }
    return { valid: true };
}

const validate = {
    validateUsername,
    validatePassword
};

export default validate;
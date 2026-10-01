const bcrypt = require("bcrypt");

function generatePassword(length = 10) {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";

    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return password;
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

module.exports = {
    generatePassword,
    hashPassword,
    comparePassword
};

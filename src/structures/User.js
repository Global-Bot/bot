const { User } = require('discord.js');

// get User.mention - Returns the mention of a user
Object.defineProperty(User.prototype, 'mention', {
    get() {
        return `<@${this.id}>`;
    }
});

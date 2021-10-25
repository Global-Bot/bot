const { User } = require('discord.js');
const Inventory = require("../core/classes/Inventory");

// get User.mention - Returns the mention of a user
Object.defineProperty(User.prototype, 'mention', {
    get() {
        return `<@${this.id}>`;
    }
});

Object.defineProperty(User.prototype, 'inventory', {
    get() {
        return new Inventory(this.id);
    }
})

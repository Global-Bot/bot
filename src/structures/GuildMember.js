const {GuildMember} = require("discord.js");
const EconomyProfile = require("../core/classes/EconomyProfile");
const ReputationProfile = require("../core/classes/ReputationProfile");
const Inventory = require("../core/classes/Inventory");

Object.defineProperty(GuildMember.prototype, 'economy', {
    get() {
        return new EconomyProfile(this.id);
    }
})

Object.defineProperty(GuildMember.prototype, 'reputation', {
    get() {
        return new ReputationProfile(this.id);
    }
})

Object.defineProperty(GuildMember.prototype, 'isBooster', {
    get() {
        return this.premiumSinceTimestamp;
    }
})

Object.defineProperty(GuildMember.prototype, 'inventory', {
    get() {
        return new Inventory(this.id);
    }
})
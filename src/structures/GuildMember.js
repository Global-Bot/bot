const {GuildMember} = require("discord.js");
const EconomyProfile = require("../core/classes/EconomyProfile");
const ReputationProfile = require("../core/classes/ReputationProfile");

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
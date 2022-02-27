const {GuildMember} = require("discord.js");
const EconomyProfile = require("../core/classes/EconomyProfile");
const ReputationProfile = require("../core/classes/ReputationProfile");
const Inventory = require("../core/classes/Inventory");
const Levelling = require("../core/classes/Levelling");
const Gender = require("../core/classes/Gender");
const Country = require("../core/classes/Country");
const About = require("../core/classes/About");
const Blacklist = require("../core/classes/Blacklist");

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

Object.defineProperty(GuildMember.prototype, 'levelling', {
    get() {
        return new Levelling(this.id);
    }
})

Object.defineProperty(GuildMember.prototype, 'gender', {
    get() {
        return new Gender(this.id);
    }
})

Object.defineProperty(GuildMember.prototype, 'country', {
    get() {
        return new Country(this.id);
    }
})

Object.defineProperty(GuildMember.prototype, 'about', {
    get() {
        return new About(this.id);
    }
})

Object.defineProperty(GuildMember.prototype, 'blacklist', {
    get() {
        return new Blacklist(this.id);
    }
})

Object.defineProperty(GuildMember.prototype, 'upgrades', {
    async get() {
        const inventory = await new Inventory(this.id);
        if (inventory.errored) return [];
        
        return inventory.getItemsByType("upgrade").filter(item => item.inUse);
    }
})

const { User } = require('discord.js');
const Inventory = require("../core/classes/Inventory");
const Levelling = require("../core/classes/Levelling");
const Gender = require("../core/classes/Gender");
const Country = require("../core/classes/Country");
const About = require("../core/classes/About");
const ReputationProfile = require("../core/classes/ReputationProfile");
const Blacklist = require("../core/classes/Blacklist");
const EconomyProfile = require("../core/classes/EconomyProfile");

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

Object.defineProperty(User.prototype, 'levelling', {
    get() {
        return new Levelling(this.id);
    }
})

Object.defineProperty(User.prototype, 'gender', {
    get() {
        return new Gender(this.id);
    }
})

Object.defineProperty(User.prototype, 'country', {
    get() {
        return new Country(this.id);
    }
})

Object.defineProperty(User.prototype, 'about', {
    get() {
        return new About(this.id);
    }
})

Object.defineProperty(User.prototype, 'reputation', {
    get() {
        return new ReputationProfile(this.id);
    }
})

Object.defineProperty(User.prototype, 'blacklist', {
    get() {
        return new Blacklist(this.id);
    }
})

Object.defineProperty(User.prototype, 'economy', {
    get() {
        return new EconomyProfile(this.id);
    }
})

const {GuildMember} = require("discord.js");
const EconomyProfile = require("../core/classes/EconomyProfile");

Object.defineProperty(GuildMember.prototype, 'economy', {
    get() {
        return new EconomyProfile(this.id);
    }
})
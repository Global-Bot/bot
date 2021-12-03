const Base = require("./Base")

class Levelling extends Base {
    constructor(user_id) {
        super();

        this.id = user_id;
    }





    async fetch() {
        return await this.models.xp.findOne({ where: { user: this.id }, raw: true }) || await this.models.xp.create({ user: this.id });
    }
    
    async update(row) {
        await this.fetch();
        return await this.models.xp.update(row, { where: { user: this.id }, raw: true });
    }
    




    async getXP() {
        return await this.fetch().then(user => user.xp);
    }

    async setXP(xp) {
        await this.update({ xp });
        return this.getXP();
    }

    async addXP(xp) {
        return await this.setXP(await this.getXP() + xp)
    }
    
    async takeXP(xp) {
        return await this.setXP(await this.getXP() - xp)
    }





    getXPCooldown() {
        const cooldown = global.XPCooldowns.get(this.id);
        if (!cooldown) return false;
        return !((Date.now() - cooldown) > this.config.levelling.XPMessage.cooldown);
    }

    setXPCooldown() {
        return global.XPCooldowns.set(this.id, Date.now())
    }





    async getBlacklisted() {
        return await this.fetch().then(user => user.blacklisted);
    }

    async setBlacklisted(blacklisted) {
        await this.update({ blacklisted });
        return this.getBlacklisted();
    }

    async addBlacklisted() {
        return await this.setBlacklisted(true);
    }

    async takeBlacklisted() {
        return await this.setBlacklisted(false);
    }





    getLevelXP(n) {
        if (n == 0) return 0;
          
        return 7 * (n ** 2) + 53 * n + 25;
    }

    getXPLevel(xp) {
        let level = 0;

        while (xp >= this.getLevelXP(level)) {
            level += 1;
        }

        level -= 1;

        return level < 0 ? 0 : level;
    }

    getLevelStars(n) {
        return 10 * n;
    }

    generateXP() {
        const max = this.config.levelling.XPMessage.max;
        const min = this.config.levelling.XPMessage.min;
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    async processXPMessage(event) {
        const { message, guild } = event;
        if (!message || message.author.bot || !guild) return;

        if (await this.getBlacklisted() || this.getXPCooldown()) return;

        const userXP    = await this.getXP();
        const userLevel = this.getXPLevel(userXP);

        if (userLevel >= this.config.levelling.Limits.level) return;

        await this.addXP(this.generateXP());

        this.setXPCooldown();

        const newUserXP    = await this.getXP();
        const newUserLevel = this.getXPLevel(newUserXP);

        if (newUserLevel != userLevel) {
            this.processLevelUp(event, newUserLevel);
        }
    }

    async processLevelUp(event, newUserLevel) {
        const { message } = event;
        
        const user = message.author.mention;
        const level = newUserLevel;

        await this.processRewardStars(event, level);
        
        const reward = this.config.levelling.LevelRewards[newUserLevel];
        if (reward) {
            const guild = global.client.guilds.cache.get(this.config.base_guild);
            if (!guild) {
                this.sendLevelMessage(event, false, { user, level });
                return this.logger.error("Levelling: Base guild not found", "levellingBaseGuildError");
            }
            
            const role = guild.roles.cache.get(reward);
            if (!role) {
                this.sendLevelMessage(event, false, { user, level });
                return this.logger.error(`Levelling: Reward role "${reward}" for level ${newUserLevel} not found`, "levellingRewardRoleError");
            }
            
            globalEvents.emit("addRole", reward, this.id);
            
            return this.sendLevelMessage(event, true, { user, role, level });
        }

        this.sendLevelMessage(event, false, { user, level });
    }

    async processRewardStars(event, level) {
        const { message } = event;

        const user        = message.author;
        const userEconomy = await user.economy;
        if (userEconomy.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        const levelStars  = this.getLevelStars(level);
        await userEconomy.add(levelStars);
    }

    sendLevelMessage(event, receivedReward, { user, role, level }) {
        const { message } = event;
        
        const levelMessage = this.config.levelling.LevelAnnounce[receivedReward ? "rewardRoleMessage" : "levelMessage"]
        .replace('{user}', user)
        .replace('{role}', role)
        .replace('{level}', level)
        
        return this.sendMessage(message.channel, {
            embed: {
                description: levelMessage
            }
        })
    }





    async XPBoost() {
        return 0;
    }





    async getMessages() {
        return await this.fetch().then(user => user.messages);
    }

    async setMessages(messages) {
        await this.update({ messages });
        return this.getMessages();
    }

    async addMessages(messages) {
        return await this.setMessages(await this.getMessages() + messages);
    }

    async takeMessages(messages) {
        return await this.setMessages(await this.getMessages() - messages);
    }





    async getWeeklyMessages() {
        return await this.fetch().then(user => user.weeklyMessages);
    }

    async setWeeklyMessages(weeklyMessages) {
        await this.update({ weeklyMessages });
        return this.getWeeklyMessages();
    }

    async addWeeklyMessages(weeklyMessages) {
        return await this.setWeeklyMessages(await this.getWeeklyMessages() + weeklyMessages);
    }

    async takeWeeklyMessages(weeklyMessages) {
        return await this.setWeeklyMessages(await this.getWeeklyMessages() - weeklyMessages);
    }
}

module.exports = Levelling;

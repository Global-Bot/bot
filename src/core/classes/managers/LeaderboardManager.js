const { MessageEmbed, Message } = require("discord.js");
const Base = require("../Base");
const TYPES = ['stars', 'messages']

class LeaderboardManager extends Base {
    constructor(global) {
        super(global);
        this.settings = this.config.leaderboardSettings;
        this._guildID = this.config.base_guild;
        this.topUsers = {};
        this.database = this.models.leaderboard;
        
        setTimeout(() => {this.init();}, 5000)
        setInterval(() => {this.init()}, 60000*5)
    }
    
    async startTimer() {
        while(true) {
            let time = this.calculateTime();
            this.logger.info(`Leaderboard Time: ${time}ms`)
            await new Promise(res => setTimeout(res, time));
            for(let type of TYPES) {
                let {table, order, role} = this.DBS[type]
                let getLeaderboardData = await this.models[table].findAll({order: [[order, 'DESC']]});
                let winner = getLeaderboardData[0];
                
                let guild = this.client.guilds.cache.get(this._guildID);
                if(!guild) return;
                let roleObject = guild.roles.cache.get(role);
                if(!role) continue;
                for(let mem of roleObject.members.values()) {
                    mem.roles.remove(role).catch(() => {});
                }
                winner.roles.add(role).catch(() => {});
            }
            await this.models.economy.update({weeklyStars: 0})
            await this.models.xp.update({weeklyMessages: 0})
        }
    }
    
    calculateTime() {
        let now = this.moment();
        let today = now.isoWeekday();
        let wantDate = this.moment().set({hour: 18, minute: 0, second: 0, millisecond: 0})
        const dayINeed = 6; // Saturday
        if (today < dayINeed) { 
            wantDate = wantDate.isoWeekday(dayINeed)
        } else if(today > dayINeed || today == dayINeed && now.get("hour") >= 18) {
            wantDate = wantDate.add(1, 'weeks').isoWeekday(dayINeed);
        }
        
        let distance = wantDate.valueOf() - now.valueOf()
        return distance;
    }
    
    async init() {
        for(let type of TYPES) {
            let getData = await this.database.findOne({where: {type}});
            let guild = this.client.guilds.cache.get(this._guildID);
            if(!guild) return;
            let channel = getData ? guild.channels.cache.get(getData.channel_id) : guild.channels.cache.get(this.settings.defaultChannel);
            if(!channel) return;
            let getMessage = getData ? await channel.messages.fetch(getData.message_id) : undefined;
            
            if(!getMessage) {
                getMessage = await this.sendMessage(channel, {embed: new MessageEmbed});
            }
            
            let {table, order} = this.DBS[type]
            let getLeaderboardData = await this.models[table].findAll({order: [[order, 'DESC']]});
            
            let format = this.format(type, getLeaderboardData, this.DBS[type]);
            
            getMessage.edit({embeds: [format]});
            
            if(getData) {
                this.database.update({channel_id: channel.id, message_id: getMessage.id}, {where: {type}})
            } else {
                this.database.create({channel_id: channel.id, message_id: getMessage.id, type})
            }
            return;
        }
    }
    
    format(type, leaderboard, typeData) {
        let topTen = leaderboard.splice(0, 10);
        
        let wording = [
            `**__Global's Weekly ${this.utils.firstUppercase(type)} Leaderboard:__**`,
            ``,
            `**Current Member of the week!** - ${topTen[0] ? `<@${topTen[0].id}>` : "..."}`,
            ``,
            `**__\`Rankings:\`__** ${topTen.map((item,i) => `\n${i + 1}. <@${item.id}> **\`-\` ${typeData.emoji ? typeData.emoji : ""} ${this.utils.commas(item[typeData.order])}**`).join("")}`, 
            ``,
            `At the end of the week, the member top user on this leaderboard will receive <@&${typeData.role}>`,
            ``,
            `Last updated: <t:${Math.round(new Date().getTime()/1000)}:R>\nResets: <t:${Math.round(this.moment().set("day", 6).toDate().getTime()/1000)}:R>`
        ]
        
        this.topUsers[type] = topTen[0] || "";
        
        let finalString = wording.join("\n")
        
        let embed = new MessageEmbed()
        .setDescription(finalString)
        .setThumbnail(this.client.user.avatarURL())
        .setColor('PURPLE');
        
        return embed;
    }
    
    get DBS() {
        return {
            "stars":    {table: "economy", order: "weeklyStars",    role: "916406700767064064", emoji: this.config.emojis.get("star")},
            "messages": {table: "xp",      order: "weeklyMessages", role: "916406797659680839", emoji: null},
        }
    }
}

module.exports = LeaderboardManager;
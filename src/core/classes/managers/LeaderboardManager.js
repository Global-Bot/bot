const { MessageEmbed, Message } = require("discord.js");
const Base = require("../Base");
const TYPES = ['stars']

class LeaderboardManager extends Base {
    constructor(global) {
        super(global);
        this.settings = this.config.leaderboardSettings;
        this._guildID = this.config.base_guild;
        this.database = this.models.leaderboard;
        
        setTimeout(() => {this.init();}, 5000)
        setInterval(() => {this.init()}, 60000*5)
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
        
        let wording = [`**__Global's Weekly ${this.utils.firstUppercase(type)} Leaderboard:__**`,
        ``,
        `**Current Member of the week!** - ${topTen[0] ? `<@${topTen[0].id}>` : "..."}`,
        ``,
        `**__\`Rankings:\`__** ${topTen.map((item,i) => `\n${i + 1}. <@${item.id}> **\`-\` ${typeData.emoji ? typeData.emoji : ""} ${this.utils.commas(item[typeData.order])}**`).join("")}`, 
        ``,
        `At the end of the week, the member top user on this leaderboard will receive <@&${typeData.role}>`,
        ``,
        `Last updated: <t:${Math.round(new Date().getTime()/1000)}:R>\nResets: <t:${Math.round(this.moment().set("day", 6).toDate().getTime()/1000)}:R>`
        ]

        let finalString = wording.join("\n")

        let embed = new MessageEmbed()
        .setDescription(finalString)
        .setThumbnail(this.client.user.avatarURL())
        .setColor('PURPLE');

        return embed;
    }
    
    get DBS() {
        return {
            "stars": {table: "economy", order: "stars", role: "878760379587653653", emoji: this.config.emojis.get("star")}
        }
    }
}

module.exports = LeaderboardManager;
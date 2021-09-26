const Base = require("../Base");

class LotteryManager extends Base {
    constructor(global) {
        super(global);
        this.startTimer();
    }
    
    async getStats(user_id) {
        let getLotteryEntries = await this.fetch();
        let totalTickets = 0;
        let userTickets = getLotteryEntries.filter(user => user.id == user_id);
        userTickets = userTickets[0] ? userTickets[0]?.tickets : 0;
        
        for(let entry of getLotteryEntries) {
            totalTickets = totalTickets + entry.tickets;
        }
        
        let totalJackpot = this.config.lottery.ticketPrice * totalTickets || 0;
        
        return {totalTickets, totalJackpot, userTickets}
    }
    
    async fetch() {
        return await this.models.lottery.findAll({raw: true});
    }
    
    async addTickets(user_id, tickets) {
        if(!user_id || !tickets) return false;
        let getUserID = await this.models.lottery.findOne({where: {id: user_id}}) || await this.models.lottery.create({id: user_id});
        let newTickets = parseInt(getUserID.tickets) + parseInt(tickets);
        return this.models.lottery.update({tickets: newTickets}, {where: {id: user_id}})
    }
    
    async processLottery() {
        let guild = this.client.guilds.cache.get(this.config.base_guild) // [UPDATE]
        if(!guild) return this.error(undefined, "Lottery: No guild found!")
        let entries = [];
        let getLotteryEntries = await this.fetch();
        
        for(let entry of getLotteryEntries) {
            for(let i = 0; i < entry.tickets; i++) {
                entries.push(entry.id);
            }
        }

        if(entries.length == 0) return this.error(undefined, "Lottery: No entries!")
        
        let winner = entries.random();
        this.logger.info(`Winner: ${winner}`)
        let getUser = await guild.members.fetch(winner).catch(() => {});
        let i = 0;

        while(!getUser && i < 5) {
            winner = entries.random();
            getUser = await guild.members.fetch(winner).catch(() => {});
            i++;
        }

        this.models.lottery.destroy({truncate: true});
        if(!getUser) return this.error(undefined, "Lottery: No winner!")

        let userEconomyData = await getUser.economy;
        let jackpot = entries.length * this.config.lottery.ticketPrice;
        userEconomyData.add(jackpot);

        let getChannel = guild.channels.cache.get(this.config.lottery.channel);
        if(!getChannel) return this.error(undefined, "Lottery: No channel found!")
        
        const embed = {
            title: "Lottery Results",
            description: `**Winning Ticket Number**: \`#${entries.findIndex(entry => entry == winner) + 1}\`\n**Winner**: ${getUser.toString()}\n**Jackpot Winnings**: \`${jackpot}\` ${this.config.emojis.get("star")}`,
            thumbnail: {
                url: guild.iconURL()
            }
        }
        
        return this.sendMessage(getChannel, {embed})
    }

    calculateTime() {
        let now = this.moment();
        let today = now.isoWeekday();
        let wantDate = this.moment().set({hour: 18, minute: 0, second: 0, millisecond: 0})
        const dayINeed = 6; // Saturday
        if (today < dayINeed) { 
            wantDate = this.moment().isoWeekday(dayINeed)
        } else if(today > dayINeed || today == dayINeed && today.get("hour") >= 18) {
            wantDate = this.moment().add(1, 'weeks').isoWeekday(dayINeed);
        }
        
        let distance = wantDate.valueOf() - now.valueOf()
        return distance;
    }
    
    async startTimer() {
        while(true) {
            let time = this.calculateTime();
            this.logger.info(`Lottery Timer: ${time}ms`)
            await new Promise(res => setTimeout(res, time));
            await this.processLottery();
        }
    }
    
}

module.exports = LotteryManager;
const Base = require("../Base");

class BoostReactionManager extends Base {
    constructor(global) {
        super(global);
        this.database = this.models.boostReact;
        this.update();
        this._cached = [];
    }

    async update() {
        this._cached = await this.database.findAll({raw: true})
        return this._cached;
    }

    async includesEmojiTrigger(content) {
        if(!this._cached) {await this.update()}
        let emoji;
        content = content.toLowerCase();
        for(let entry of this._cached) {if(content.includes(entry.word)) {emoji = entry.reaction}}
        return emoji;
    }

    async addEmoji(user_id, emoji, word) {
        if(!emoji || !word) return false;
        await this.database.destroy({where: {id: user_id}});
        await this.database.create({id: user_id, reaction: emoji, word});
        this.update();
        return;
    }

    async clearEmoji(user_id) {
        if(!user_id) return;
        await this.database.destroy({where: {id: user_id}});
        this.update();
        return true;
    }
}

module.exports = BoostReactionManager;
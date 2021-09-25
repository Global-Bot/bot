class InteractionData {
    constructor(base, customID) {
        this.models = base.models;

        this.customID = customID;
    }

    async get() {
        if (!this.customID) return null;

        const data = await this.models.interaction.findOne({ where: { id: this.customID } });
        return data && data.data ? data.data : data;
    }
    
    async has() {
        return !!await this.get();
    }
    
    async set(data) {
        return await this.models.interaction.create({ id: this.customID, data });
    }

}

module.exports = InteractionData;

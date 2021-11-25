const Base = require("./Base")
const EconomyProfile = require("./EconomyProfile");

class Inventory extends Base {
    constructor(user_id) {
        super();
        this.id = user_id;
        this.contents = [];
        return (async () => {
            let getInvData = await this.fetch();
            if (!Array.isArray(getInvData)) {
                this.errored = true;
            } else {
                for (const item of getInvData) {
                    this.contents.push(item);
                }
            }
            return this;
        })()
    }
    
    async fetch() {
        return await this.models.inventory.findAll({ where: { user: this.id }, raw: true });
    }
    
    getItemsByName(name) {
        return this.contents.filter(item => item.itemID.toLowerCase() == name.toLowerCase());
    }
    
    getItemsByNameAndType(name, type) {
        let items = this.getItemsByName(name);
        if (type) {
            items = items.filter(item => item.type == type);
        }
        
        return items;
    }
    
    quantity(name, type) {
        if (!name) return 0;
        
        const items = this.getItemsByNameAndType(name, type);
        const quantity = items.reduce((prev, curr) => prev + curr.quantity, 0);
        
        return quantity;
    }
    
    has(name, type) {
        if (!name) return false;
        
        const items = this.getItemsByNameAndType(name, type);
        
        return items.length > 0;
    }
    
    get(...args) {
        return this.getItemsByNameAndType(...args)[0] || null;
    }
    
    async save() {
        let inventory = await this.fetch();
        if (!Array.isArray(inventory)) { this.errored = true }
        
        for (const item of inventory) {
            const where = { user: this.id, itemID: item.itemID, type: item.type };

            if (this.has(item.itemID, item.type)) {
                if (this.quantity(item.itemID, item.type) != item.quantity) {
                    await this.models.inventory.update(this.get(item.itemID, item.type), { where, raw: true });
                } else {
                    continue;
                }
            } else {
                await this.models.inventory.destroy({ where, raw: true })
            }
        }

        const addedItems = this.contents.filter(item => !inventory.some(i => i.itemID == item.itemID && i.type == item.type));
        for (const item of addedItems) {
            await this.models.inventory.create({ user: this.id, itemID: item.itemID, quantity: item.quantity, type: item.type, inUse: false });
        }

        return true;
    }
    
    async set(name, type, quantity) {
        quantity = parseFloat(quantity);
        if (isNaN(quantity)) return this.contents;

        const items = this.contents.filter(item => !(item.itemID == name && item.type == type));
        if (quantity >= 1) {
            items.push({ itemID: name, quantity, type });
        }
        
        this.contents = items;
        await this.save();
        
        return this.contents;
    }
    
    async add(name, type, quantity = 1) {
        quantity = parseFloat(quantity);
        if (isNaN(quantity)) return this.contents;

        quantity = this.quantity(name, type) + quantity;
        if (quantity > Number.MAX_SAFE_INTEGER) quantity = Number.MAX_SAFE_INTEGER;
        
        return await this.set(name, type, quantity)
    }
    
    async take(name, type, quantity = 1) {
        quantity = parseFloat(quantity);
        if (isNaN(quantity)) return this.contents;
        
        quantity = this.quantity(name, type) - quantity;
        if (quantity < 0) quantity = 1;
        
        return await this.set(name, type, quantity)
    }

    async clear() {
        this.contents = [];
        return await this.save();
    }

    
    async isInUse(item) {
        if (!item || item.itemID == undefined || item.type == undefined) return false;

        const dbItem = await this.models.inventory.findOne({ where: { user: this.id, itemID: item.itemID, type: item.type }, raw: true });
        if (!dbItem || dbItem.inUse == undefined || dbItem.inUse == null) return false;

        return !!dbItem.inUse;
    }

    async toggleInUse(item) {
        if (!item || item.itemID == undefined || item.type == undefined) return false;

        const dbItem = await this.models.inventory.findOne({ where: { user: this.id, itemID: item.itemID, type: item.type }, raw: true });
        if (!dbItem || dbItem.inUse == undefined || dbItem.inUse == null) return false;
        
        const update = await this.models.inventory.update({ inUse: !dbItem.inUse }, { where: { user: this.id, itemID: dbItem.itemID, type: dbItem.type }, raw: true });
        if (!update) return false;

        return true;
    }
    
    
    async give(item, receiver) {
        if (!item || item.itemID == undefined || item.type == undefined) return false;

        const receiverInventory = await receiver.inventory;
        if (receiverInventory.errored) return false;

        const take = await this.take(item.itemID, item.type, 1);
        if (!take) return false;


        const add = await receiverInventory.add(item.itemID, item.type, 1);
        if (!add) return false;

        return true;
    }

    async use(item) {
        if (!item || item.itemID == undefined || item.type == undefined) return false;

        switch (item.type) {
            case 'role':
                const dbItem = await this.models.role.findOne({ where: { id: item.itemID }, raw: true });
                if (!dbItem || dbItem.role == undefined || dbItem.role == null) return false;
                
                const inUse = await this.isInUse(item);
                globalEvents.emit(!inUse ? 'addRole' : 'removeRole', dbItem.role, this.id);

                const toggleInUse = await this.toggleInUse(item);
                if (!toggleInUse) return false;
                break;

            case 'crate':
                const crateDbItem = await this.models.crate.findOne({ where: { id: item.itemID }, raw: true });
                if (!crateDbItem) return false;
                
                await Promise.all(
                    crateDbItem.contains.map(crateItem => this.add(crateItem.id, crateItem.type, crateItem.quantity))
                );

                await this.take(item.itemID, item.type, 1);
                break;
        }
        
        return true;
    }

    async sell(item) {
        if (!item || item.itemID == undefined || item.type == undefined) return false;

        const model = this.models[item.type];
        if (!model) return false;

        const dbItem = await model.findOne({ where: { id: item.itemID } });
        if (!dbItem || dbItem.price == undefined || dbItem.price == null) return false;

        const giveback = Math.max(0, dbItem.price * 0.75);
        if (!isNaN(giveback) && giveback != 0) {
            const economy = await (new EconomyProfile(this.id));
            if(economy.errored) return false;
            
            await economy.add(giveback)
        };

        const take = await this.take(item.itemID, item.type, 1);
        if (!take) return false;

        return {
            item,
            price: giveback
        };
    }
}

module.exports = Inventory;

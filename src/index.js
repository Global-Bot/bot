require('dotenv').config();

const Global = require('./core/Global');
const options = {};

if (process.env.shardCount) {
    options.shardCount = parseInt(process.env.shardCount, 10);
}

const global = new Global();
global.init(options);

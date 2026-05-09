const Database = require('better-sqlite3');

const db = new Database('./shop.db');

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    totalSpent INTEGER DEFAULT 0,
    ordersCount INTEGER DEFAULT 0,
    lastOrder INTEGER DEFAULT 0,
    invites INTEGER DEFAULT 0,
    leaves INTEGER DEFAULT 0,
    legitInvites INTEGER DEFAULT 0
)
`).run();

module.exports = db;
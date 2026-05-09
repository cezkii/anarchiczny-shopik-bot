```js
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(`${client.user.tag} ONLINE`);
});

client.login(process.env.TOKEN);
```

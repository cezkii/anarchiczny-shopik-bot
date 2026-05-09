```js id="92k21a"
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
    console.log(client.user.tag + ' ONLINE');
});

client.login(process.env.TOKEN);
```

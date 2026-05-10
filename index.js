const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
ChannelType,
PermissionsBitField,
Events,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
SlashCommandBuilder,
REST,
Routes
} = require("discord.js");

const fs = require("fs");

const client = new Client({

intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]

});

const TOKEN =
process.env.TOKEN;

const CLIENT_ID =
process.env.CLIENT_ID;

const GUILD_ID =
process.env.GUILD_ID;

const CHANNELS = {

TICKETS:
"1502358629402284234",

LEGIT:
"1502356815495692440",

WELCOME:
"1502652604973318376",

PAYMENTS:
"1502648184714039486",

CLIENT_PANEL:
"1502649421136003132",

DROP:
"1502655319392915466",

GIVEAWAYS:
"1502654052318707782"

};

const ROLES = {

LIMIT50:
"1502388117309755542",

LIMIT100:
"1502388253691744399",

LIMIT200:
"1502388290265944085",

NOLIMIT:
"1502388310394540092",

TICKET:
"1502363051003871282",

HELPER:
"1502601578400579604",

SKUP:
"1502761459371737108",

CLIENT:
"1502661344455823431",

CLIENT250:
"1502663222258307294",

CLIENT200:
"1502664307169689738",

CLIENT500:
"1502665546922197042"

};

let db = {

users: {},
tickets: {},
cooldowns: {},
invites: {},
giveaways: {}

};

if (
fs.existsSync(
"./database.json"
)
) {

db = JSON.parse(
fs.readFileSync(
"./database.json"
)
);

}

function saveDB() {

fs.writeFileSync(
"./database.json",
JSON.stringify(
db,
null,
2
)
);

}
async function getCategory(
guild,
name
) {

let category =
guild.channels.cache.find(
c =>
c.type ===
ChannelType.GuildCategory &&
c.name === name
);

if (!category) {

category =
await guild.channels.create({

name: name,

type:
ChannelType.GuildCategory

});

}

return category;

}

async function deleteEmptyCategory(
channel
) {

const parent =
channel.parent;

if (!parent) return;

const channels =
parent.children.cache.filter(
c =>
c.id !== channel.id
);

if (
channels.size <= 0
) {

await parent.delete()
.catch(() => {});

}

}

client.once(
Events.ClientReady,
async () => {

console.log(
`${client.user.tag} ONLINE`
);

const commands = [

new SlashCommandBuilder()
.setName("zapro")
.setDescription(
"Pokazuje ilość zaproszeń"
),

new SlashCommandBuilder()
.setName("konkurs")
.setDescription(
"Tworzy konkurs"
)
.addStringOption(
o =>
o
.setName("nagroda")
.setDescription("Nagroda")
.setRequired(true)
)
.addIntegerOption(
o =>
o
.setName("wygrani")
.setDescription("Liczba wygranych")
.setRequired(true)
)
.addStringOption(
o =>
o
.setName("czas")
.setDescription("Np 1h")
.setRequired(true)
)

].map(
c => c.toJSON()
);

const rest =
new REST({
version: "10"
}).setToken(TOKEN);

await rest.put(

Routes.applicationGuildCommands(
CLIENT_ID,
GUILD_ID
),

{
body: commands
}

);

console.log(
"Komendy zarejestrowane"
);
const ticketChannel =
await client.channels.fetch(
CHANNELS.TICKETS
);

const messages =
await ticketChannel.messages.fetch({
limit: 10
});

const exists =
messages.find(
m =>
m.author.id === client.user.id
);

if (!exists) {

const embed =
new EmbedBuilder()

.setColor("#1e2a38")

.setTitle(
"🎫 TICKETY SHOPIKA"
)

.setDescription(`
Wybierz rodzaj ticketu
`);

const menu =
new StringSelectMenuBuilder()

.setCustomId(
"ticket_select"
)

.setPlaceholder(
"Wybierz opcję"
)

.addOptions([

{
label:
"ZAKUP WALUTY",
value:
"buy",
emoji:
"💰"
},

{
label:
"SKUP",
value:
"sell",
emoji:
"💵"
},

{
label:
"POMOC",
value:
"help",
emoji:
"🆘"
}

]);

const row =
new ActionRowBuilder()
.addComponents(menu);

await ticketChannel.send({

embeds: [embed],

components: [row]

});

}

});
client.on(
Events.InteractionCreate,
async interaction => {

if (
interaction.isStringSelectMenu()
) {

if (
interaction.customId ===
"ticket_select"
) {

const already =
Object.values(
db.tickets
).find(
t =>
t.owner ===
interaction.user.id
);

if (already) {

return interaction.reply({

content:
"❌ Masz już ticket",

ephemeral: true

});

}

const value =
interaction.values[0];

if (value === "buy") {

const paymentMenu =
new StringSelectMenuBuilder()

.setCustomId(
"payment_select"
)

.setPlaceholder(
"Wybierz metodę płatności"
)

.addOptions([

{
label:
"BLIK NA NR",
value:
"BLIK NA NR"
},

{
label:
"KOD BLIK",
value:
"KOD BLIK"
},

{
label:
"PSC Z PARAGONEM",
value:
"PSC Z PARAGONEM"
},

{
label:
"PSC BEZ PARAGONU",
value:
"PSC BEZ PARAGONU"
},

{
label:
"MYPSC",
value:
"MYPSC"
},

{
label:
"PAYPAL",
value:
"PAYPAL"
},

{
label:
"CS2 SKINS",
value:
"CS2 SKINS"
}

]);

const row =
new ActionRowBuilder()
.addComponents(
paymentMenu
);

return interaction.reply({

content:
"Wybierz metodę płatności",

components: [row],

ephemeral: true

});

}
if (
interaction.customId ===
"payment_select"
) {

const payment =
interaction.values[0];

const modal =
new ModalBuilder()

.setCustomId(
`buy_${payment}`
)

.setTitle(
"ZAKUP WALUTY"
);

const amount =
new TextInputBuilder()

.setCustomId(
"buy_amount"
)

.setLabel(
"Za ile kupujesz?"
)

.setStyle(
TextInputStyle.Short
)

.setRequired(true);

modal.addComponents(

new ActionRowBuilder()
.addComponents(amount)

);

return interaction.showModal(
modal
);

}

}

if (
interaction.isModalSubmit()
) {

if (
interaction.customId.startsWith(
"buy_"
)
) {

const payment =
interaction.customId.replace(
"buy_",
""
);

const amount =
Number(
interaction.fields.getTextInputValue(
"buy_amount"
)
);

let categoryName =
"NO LIMIT";

let pingRole =
`<@&${ROLES.NOLIMIT}>`;

if (amount <= 50) {

categoryName =
"LIMIT 50";

pingRole =
`<@&${ROLES.LIMIT50}>`;

}

else if (amount <= 100) {

categoryName =
"LIMIT 100";

pingRole =
`<@&${ROLES.LIMIT100}>`;

}

else if (amount <= 200) {

categoryName =
"LIMIT 200";

pingRole =
`<@&${ROLES.LIMIT200}>`;

}
const category =
await getCategory(
interaction.guild,
categoryName
);

const ticket =
await interaction.guild.channels.create({

name:
`zakup-${interaction.user.username}`,

type:
ChannelType.GuildText,

parent:
category.id,

topic:
`${interaction.user.id}|${amount}|${payment}`,

permissionOverwrites: [

{
id:
interaction.guild.id,

deny: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id:
interaction.user.id,

allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id:
ROLES.TICKET,

allow: [
PermissionsBitField.Flags.ViewChannel
]
}

]

});

db.tickets[
ticket.id
] = {

owner:
interaction.user.id

};

saveDB();

await ticket.send({

content:
pingRole,

embeds: [

new EmbedBuilder()
.setColor("Green")
.setTitle(
"💸 NOWE ZAMÓWIENIE"
)
.setDescription(`

Kupujący:
${interaction.user}

Kwota:
${amount} zł

Płatność:
${payment}

`)

],

components: [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"claim_ticket"
)
.setLabel(
"PRZEJMIJ"
)
.setStyle(
ButtonStyle.Success
),

new ButtonBuilder()
.setCustomId(
"send_legit"
)
.setLabel(
"WYSTAW LEGITKĘ"
)
.setStyle(
ButtonStyle.Primary
),

new ButtonBuilder()
.setCustomId(
"close_ticket"
)
.setLabel(
"ZAMKNIJ"
)
.setStyle(
ButtonStyle.Danger
)

)

]

});

return interaction.reply({

content:
`✅ Ticket utworzony ${ticket}`,

ephemeral: true

});

}

}

});
client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isChatInputCommand()
) return;

if (
interaction.commandName ===
"zapro"
) {

const invites =
db.invites[
interaction.user.id
] || 0;

return interaction.reply({

content:
`📨 Masz ${invites} zaproszeń`,

ephemeral: true

});

}

if (
interaction.commandName ===
"konkurs"
) {

if (
!interaction.member.roles.cache.has(
ROLES.HELPER
)
) {

return interaction.reply({

content:
"❌ Brak permisji",

ephemeral: true

});

}

const nagroda =
interaction.options.getString(
"nagroda"
);

const wygrani =
interaction.options.getInteger(
"wygrani"
);

const czas =
interaction.options.getString(
"czas"
);

const channel =
await client.channels.fetch(
CHANNELS.GIVEAWAYS
);

await channel.send({

embeds: [

new EmbedBuilder()
.setColor("Green")
.setTitle(
"🎉 NOWY KONKURS"
)
.setDescription(`

🎁 Nagroda:
${nagroda}

🏆 Wygrani:
${wygrani}

⏰ Czas:
${czas}

Kliknij przycisk poniżej.

`)

],

components: [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"join_giveaway"
)
.setLabel(
"DOŁĄCZ"
)
.setStyle(
ButtonStyle.Success
)

)

]

});

return interaction.reply({

content:
"✅ Konkurs utworzony",

ephemeral: true

});

}

});
client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isButton()
) return;

if (
interaction.customId ===
"claim_ticket"
) {

return interaction.reply({

content:
`✅ Ticket przejęty przez ${interaction.user}`

});

}

if (
interaction.customId ===
"send_legit"
) {

const topic =
interaction.channel.topic.split("|");

const buyerId =
topic[0];

const amount =
Number(topic[1]);

const payment =
topic[2];

const legitChannel =
await client.channels.fetch(
CHANNELS.LEGIT
);

await legitChannel.send({

embeds: [

new EmbedBuilder()
.setColor("Green")
.setTitle(
"✅ NOWA LEGITKA"
)
.setDescription(`

Kupujący:
<@${buyerId}>

Sprzedawca:
${interaction.user}

Kwota:
${amount} zł

Płatność:
${payment}

`)

]

});

if (
!db.users[buyerId]
) {

db.users[buyerId] = {

spent: 0,
orders: 0

};

}

db.users[buyerId].spent +=
amount;

db.users[buyerId].orders += 1;

saveDB();
delete db.tickets[
interaction.channel.id
];

saveDB();

await interaction.reply({

content:
"✅ Legitka wystawiona",

ephemeral: true

});

const currentChannel =
interaction.channel;

setTimeout(async () => {

await currentChannel.delete()
.catch(() => {});

await deleteEmptyCategory(
currentChannel
);

}, 3000);

}

if (
interaction.customId ===
"close_ticket"
) {

delete db.tickets[
interaction.channel.id
];

saveDB();

await interaction.reply({

content:
"🗑️ Ticket zamykany",

ephemeral: true

});

const currentChannel =
interaction.channel;

setTimeout(async () => {

await currentChannel.delete()
.catch(() => {});

await deleteEmptyCategory(
currentChannel
);

}, 3000);

}

if (
interaction.customId ===
"join_giveaway"
) {

return interaction.reply({

content:
"🎉 Dołączyłeś do konkursu",

ephemeral: true

});

}

});

client.login(TOKEN);
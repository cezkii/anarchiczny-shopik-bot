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
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent

]

});

const TOKEN =
process.env.TOKEN;

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

INVITES:
"1502650236324024421",

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
invites: {},
cooldowns: {}

};

if (
fs.existsSync("./database.json")
) {

db = JSON.parse(
fs.readFileSync("./database.json")
);

}

function saveDB() {

fs.writeFileSync(
"./database.json",
JSON.stringify(db, null, 2)
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

if (channels.size <= 0) {

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
"Pokazuje zaproszenia"
),

new SlashCommandBuilder()
.setName("konkurs")
.setDescription(
"Tworzy konkurs"
)
.addStringOption(o =>
o
.setName("nagroda")
.setDescription("Nagroda")
.setRequired(true)
)
.addIntegerOption(o =>
o
.setName("wygrani")
.setDescription("Ilość wygranych")
.setRequired(true)
)
.addStringOption(o =>
o
.setName("czas")
.setDescription("Czas")
.setRequired(true)
)

].map(c => c.toJSON());

const rest =
new REST({
version: "10"
}).setToken(TOKEN);

await rest.put(

Routes.applicationCommands(
client.user.id
),

{ body: commands }

);

console.log(
"Komendy zarejestrowane"
);
const ticketChannel =
await client.channels.fetch(
CHANNELS.TICKETS
);

const ticketMessages =
await ticketChannel.messages.fetch({
limit: 20
});

const ticketExists =
ticketMessages.find(
m =>
m.author.id ===
client.user.id
);

if (!ticketExists) {

await ticketChannel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle(
"🎫 TICKETY SHOPIKA"
)
.setDescription(
"Wybierz temat ticketu"
)

],

components: [

new ActionRowBuilder()
.addComponents(

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
"💸"
},

{
label:
"POMOC",
value:
"help",
emoji:
"🆘"
}

])

)

]

});

}

const paymentChannel =
await client.channels.fetch(
CHANNELS.PAYMENTS
);

const paymentMessages =
await paymentChannel.messages.fetch({
limit: 20
});

const paymentExists =
paymentMessages.find(
m =>
m.author.id ===
client.user.id
);

if (!paymentExists) {

await paymentChannel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle(
"💳 METODY PŁATNOŚCI"
)
.setDescription(`

📲 BLIK ➜ 0%

🔢 KOD BLIK ➜ 10%

🧾 PSC ➜ 15%

🅿️ PAYPAL ➜ 12%

🔫 SKINS ➜ 40%

`)

]

});

}
const clientPanel =
await client.channels.fetch(
CHANNELS.CLIENT_PANEL
);

const panelMessages =
await clientPanel.messages.fetch({
limit: 20
});

const panelExists =
panelMessages.find(
m =>
m.author.id ===
client.user.id
);

if (!panelExists) {

await clientPanel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle(
"📊 PANEL KLIENTA"
)
.setDescription(
"Kliknij przycisk poniżej"
)

],

components: [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"client_stats"
)
.setLabel(
"SPRAWDŹ WYDATKI"
)
.setStyle(
ButtonStyle.Primary
)

)

]

});

}

const dropChannel =
await client.channels.fetch(
CHANNELS.DROP
);

const dropMessages =
await dropChannel.messages.fetch({
limit: 20
});

const dropExists =
dropMessages.find(
m =>
m.author.id ===
client.user.id
);

if (!dropExists) {

await dropChannel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle(
"🎁 DROP SHOPIKA"
)
.setDescription(
"Kliknij przycisk aby losować"
)

],

components: [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId(
"drop_button"
)
.setLabel(
"LOSUJ DROP"
)
.setStyle(
ButtonStyle.Success
)

)

]

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

const modal =
new ModalBuilder()
.setCustomId(
"buy_modal"
)
.setTitle(
"ZAKUP"
);

const amount =
new TextInputBuilder()
.setCustomId(
"buy_amount"
)
.setLabel(
"Kwota zakupu"
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

const payment =
new TextInputBuilder()
.setCustomId(
"buy_payment"
)
.setLabel(
"Metoda płatności"
)
.setStyle(
TextInputStyle.Short
)
.setRequired(true);

modal.addComponents(

new ActionRowBuilder()
.addComponents(amount),

new ActionRowBuilder()
.addComponents(payment)

);

return interaction.showModal(
modal
);

}

if (value === "sell") {

const modal =
new ModalBuilder()
.setCustomId(
"sell_modal"
)
.setTitle(
"SKUP"
);

const amount =
new TextInputBuilder()
.setCustomId(
"sell_amount"
)
.setLabel(
"Ile sprzedajesz?"
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
}
});
client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isModalSubmit()
) return;

if (
interaction.customId ===
"buy_modal"
) {

const amount =
parseInt(
interaction.fields.getTextInputValue(
"buy_amount"
)
);

const payment =
interaction.fields.getTextInputValue(
"buy_payment"
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

db.tickets[ticket.id] = {
owner: interaction.user.id
};

saveDB();
await ticket.send({

content: pingRole,

embeds: [

new EmbedBuilder()
.setColor("Green")
.setTitle(
"NOWE ZAMÓWIENIE"
)
.setDescription(`

Kupujący:
${interaction.user}

Kwota:
${amount} zł

Metoda:
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

if (
interaction.customId ===
"sell_modal"
) {

const amount =
interaction.fields.getTextInputValue(
"sell_amount"
);

const category =
await getCategory(
interaction.guild,
"SKUP"
);

const ticket =
await interaction.guild.channels.create({

name:
`skup-${interaction.user.username}`,

type:
ChannelType.GuildText,

parent:
category.id,

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
ROLES.SKUP,

allow: [
PermissionsBitField.Flags.ViewChannel
]
}

]

});

db.tickets[ticket.id] = {
owner: interaction.user.id
};

saveDB();
await ticket.send({

content:
`<@&${ROLES.SKUP}>`,

embeds: [

new EmbedBuilder()
.setColor("Green")
.setTitle(
"NOWY SKUP"
)
.setDescription(`

Użytkownik:
${interaction.user}

Kwota:
${amount}

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

});
client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isButton()
) return;

if (
interaction.customId ===
"send_legit"
) {

const channel =
interaction.channel;

const topic =
channel.topic.split("|");

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

Metoda:
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

const member =
await interaction.guild.members.fetch(
buyerId
);

await member.roles.add(
ROLES.CLIENT
).catch(() => {});

if (
db.users[buyerId].spent >= 200
) {

await member.roles.add(
ROLES.CLIENT200
).catch(() => {});

}

if (
db.users[buyerId].spent >= 250
) {

await member.roles.add(
ROLES.CLIENT250
).catch(() => {});

}

if (
db.users[buyerId].spent >= 500
) {

await member.roles.add(
ROLES.CLIENT500
).catch(() => {});

}delete db.tickets[
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
"client_stats"
) {

const data =
db.users[
interaction.user.id
];

if (!data) {

return interaction.reply({

content:
"❌ Brak zakupów",

ephemeral: true

});

}

return interaction.reply({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle(
"📊 PANEL KLIENTA"
)
.setDescription(`

💸 Wydane:
${data.spent} zł

🛒 Zamówienia:
${data.orders}

`)

],

ephemeral: true

});

}
if (
interaction.customId ===
"drop_button"
) {

const cooldown =
db.cooldowns[
interaction.user.id
];

if (
cooldown &&
Date.now() < cooldown
) {

const minutes =
Math.floor(
(cooldown - Date.now())
/ 60000
);

return interaction.reply({

content:
`❌ Poczekaj ${minutes} minut`,

ephemeral: true

});

}

db.cooldowns[
interaction.user.id
] = Date.now() + 10800000;

saveDB();

const random =
Math.random();

let reward = null;

if (random <= 0.0001) {

reward =
"100 TYSIĘCY";

}

else if (random <= 0.01) {

reward =
"BONUS 10%";

}

else if (random <= 0.02) {

reward =
"BONUS 5%";

}

if (!reward) {

return interaction.reply({

content:
"❌ Nic nie wygrałeś",

ephemeral: true

});

}

return interaction.reply({

content:
`🎉 Wygrałeś ${reward}`,

ephemeral: true

});

}

});
client.on(
Events.GuildMemberAdd,
async member => {

if (
!db.invites[
member.user.id
]
) {

db.invites[
member.user.id
] = 0;

}

saveDB();

const welcomeChannel =
await client.channels.fetch(
CHANNELS.WELCOME
);

await welcomeChannel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle(
"👋 NOWY UŻYTKOWNIK"
)
.setDescription(`

Witaj ${member}

Miłego pobytu na shopie 🎉

`)

]

});

});

client.login(TOKEN);
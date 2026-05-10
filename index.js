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
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildMembers
]
});

const TOKEN = process.env.TOKEN;

const CHANNELS = {
TICKETS: "1502358629402284234",
LEGIT: "1502356815495692440",
WELCOME: "1502652604973318376",
PAYMENTS: "1502648184714039486",
CLIENT_PANEL: "1502649421136003132",
INVITES: "1502650236324024421",
DROP: "1502655319392915466",
GIVEAWAYS: "1502654052318707782"
};

const ROLES = {
LIMIT50: "1502388117309755542",
LIMIT100: "1502388253691744399",
LIMIT200: "1502388290265944085",
NOLIMIT: "1502388310394540092",
TICKET: "1502363051003871282",
HELPER: "1502601578400579604",
SKUP: "1502761459371737108",
CLIENT: "1502661344455823431",
CLIENT250: "1502663222258307294",
CLIENT200: "1502664307169689738",
CLIENT500: "1502665546922197042"
};

let db = {
users: {},
tickets: {},
cooldowns: {},
invites: {}
};

if (fs.existsSync("./database.json")) {

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

async function getCategory(guild, name) {

let category =
guild.channels.cache.find(
c =>
c.type === ChannelType.GuildCategory &&
c.name === name
);

if (!category) {

category =
await guild.channels.create({
name,
type: ChannelType.GuildCategory
});

}

return category;

}

async function deleteEmptyCategory(channel) {

const category =
channel.parent;

if (!category) return;

const left =
category.children.cache.filter(
c =>
c.type === ChannelType.GuildText
);

if (left.size <= 1) {

setTimeout(async () => {

await category.delete()
.catch(() => {});

}, 4000);

}

}
client.once("clientReady", async () => {

console.log(`${client.user.tag} ONLINE`);

const commands = [

new SlashCommandBuilder()
.setName("zapro")
.setDescription("Sprawdź zaproszenia"),

new SlashCommandBuilder()
.setName("konkurs")
.setDescription("Stwórz konkurs")
.addStringOption(o =>
o
.setName("nagroda")
.setDescription("Nagroda")
.setRequired(true)
)
.addIntegerOption(o =>
o
.setName("wygrani")
.setDescription("Ilu wygranych")
.setRequired(true)
)
.addStringOption(o =>
o
.setName("czas")
.setDescription("Np 24h")
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
{
body: commands
}
);

const ticketChannel =
await client.channels.fetch(
CHANNELS.TICKETS
);

const ticketEmbed =
new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("ANARCHICZNY SHOPIK - TICKETY")
.setDescription("Wybierz temat ticketu");

const ticketMenu =
new StringSelectMenuBuilder()
.setCustomId("ticket_select")
.setPlaceholder("Wybierz temat")
.addOptions([
{
label: "ZAKUP WALUTY",
value: "buy",
emoji: "💰"
},
{
label: "SKUP",
value: "sell",
emoji: "💵"
},
{
label: "INNE",
value: "other",
emoji: "🆘"
}
]);

await ticketChannel.send({
embeds: [ticketEmbed],
components: [
new ActionRowBuilder()
.addComponents(ticketMenu)
]
});

const paymentChannel =
await client.channels.fetch(
CHANNELS.PAYMENTS
);

await paymentChannel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("💳 METODY PŁATNOŚCI")
.setDescription(`
🧾 PSC Z PARAGONEM ➜ 15%
🔐 PSC BEZ PARAGONU ➜ 20%
🔐 MYPSC ➜ 25%
📲 BLIK NA NR TEL ➜ 0%
🔢 KOD BLIK ➜ 10%
🔫 CS2 SKINS ➜ 40%
🅿️ PAYPAL ➜ 12%
`)

]

});

const clientPanel =
await client.channels.fetch(
CHANNELS.CLIENT_PANEL
);

await clientPanel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("PANEL KLIENTA")
.setDescription(
"Kliknij przycisk poniżej aby sprawdzić wydatki"
)

],

components: [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("client_stats")
.setLabel("SPRAWDŹ WYDATKI")
.setStyle(ButtonStyle.Primary)

)

]

});
const dropChannel =
await client.channels.fetch(
CHANNELS.DROP
);

await dropChannel.send({

embeds: [

new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("DROP SHOPIKA")
.setDescription(
"Kliknij przycisk aby odebrać drop"
)

],

components: [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("drop_button")
.setLabel("LOSUJ DROP")
.setStyle(ButtonStyle.Success)

)

]

});

console.log(
"Panele utworzone"
);

});

client.on(
Events.InteractionCreate,
async interaction => {

if (
interaction.isChatInputCommand()
) {

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
`
📨 Zaproszenia:
${invites}

✅ Legit:
${invites}
`,
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
"❌ Tylko helper",
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

const embed =
new EmbedBuilder()
.setColor("Green")
.setTitle("🎉 KONKURS")
.setDescription(`
🎁 Nagroda:
${nagroda}

🏆 Wygrani:
${wygrani}

⏰ Czas:
${czas}
`);

const button =
new ButtonBuilder()
.setCustomId("join_giveaway")
.setLabel("DOŁĄCZ")
.setStyle(ButtonStyle.Success);

const giveawayChannel =
await client.channels.fetch(
CHANNELS.GIVEAWAYS
);

await giveawayChannel.send({

embeds: [embed],

components: [

new ActionRowBuilder()
.addComponents(button)

]

});

return interaction.reply({
content:
"✅ Konkurs utworzony",
ephemeral: true
});

}

}

if (
interaction.isStringSelectMenu()
) {
if (
interaction.customId ===
"ticket_select"
) {

const already =
Object.values(db.tickets)
.find(
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

const menu =
new StringSelectMenuBuilder()
.setCustomId(
"payment_select"
)
.setPlaceholder(
"Wybierz płatność"
)
.addOptions([
{
label:
"BLIK NA NR TEL",
value:
"BLIK NA NR TEL"
},
{
label:
"KOD BLIK",
value:
"KOD BLIK"
},
{
label:
"PSC",
value:
"PSC"
},
{
label:
"PAYPAL",
value:
"PAYPAL"
}
]);

return interaction.reply({

content:
"Wybierz płatność",

components: [

new ActionRowBuilder()
.addComponents(menu)

],

ephemeral: true

});

}

}

if (
interaction.isStringSelectMenu()
) {

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
.setCustomId("amount")
.setLabel(
"Za ile kupujesz?"
)
.setStyle(
TextInputStyle.Short
);

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
parseInt(
interaction.fields.getTextInputValue(
"amount"
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
db.tickets[ticket.id] = {
owner: interaction.user.id
};

saveDB();

const embed =
new EmbedBuilder()
.setColor("Green")
.setTitle("NOWE ZAMÓWIENIE")
.setDescription(`
Kupujący:
${interaction.user}

Kwota:
${amount} zł

Metoda:
${payment}
`);

const buttons =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("claim_ticket")
.setLabel("PRZEJMIJ")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("send_legit")
.setLabel("WYSTAW LEGITKĘ")
.setStyle(ButtonStyle.Primary),

new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("ZAMKNIJ")
.setStyle(ButtonStyle.Danger)

);

await ticket.send({
content: pingRole,
embeds: [embed],
components: [buttons]
});

return interaction.reply({
content:
`✅ Ticket utworzony ${ticket}`,
ephemeral: true
});

}

}

if (interaction.isButton()) {

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
.setTitle("NOWA LEGITKA")
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

if (!db.users[buyerId]) {

db.users[buyerId] = {
spent: 0,
orders: 0
};

}

db.users[buyerId].spent += amount;
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
db.users[buyerId].spent >= 250
) {

await member.roles.add(
ROLES.CLIENT250
).catch(() => {});

}

if (
db.users[buyerId].spent >= 200
) {

await member.roles.add(
ROLES.CLIENT200
).catch(() => {});

}

if (
db.users[buyerId].spent >= 500
) {

await member.roles.add(
ROLES.CLIENT500
).catch(() => {});

}

delete db.tickets[
interaction.channel.id
];

saveDB();

await deleteEmptyCategory(
interaction.channel
);

await interaction.reply({
content:
"✅ Legitka wystawiona"
});

setTimeout(async () => {

await interaction.channel.delete()
.catch(() => {});

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

await deleteEmptyCategory(
interaction.channel
);

await interaction.reply({
content:
"🗑️ Ticket zamknięty"
});

setTimeout(async () => {

await interaction.channel.delete()
.catch(() => {});

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
"❌ Brak wydatków",
ephemeral: true
});

}

return interaction.reply({
content:
`
💸 Wydane:
${data.spent} zł

🛒 Zamówienia:
${data.orders}
`,
ephemeral: true
});

}

}

});

client.login(TOKEN);

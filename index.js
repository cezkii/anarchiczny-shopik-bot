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
TextInputStyle
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
cooldowns: {}
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

client.once("clientReady", async () => {

console.log(`${client.user.tag} ONLINE`);

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
new ActionRowBuilder().addComponents(ticketMenu)
]
});

const paymentChannel =
await client.channels.fetch(
CHANNELS.PAYMENTS
);

const paymentEmbed =
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
`);

await paymentChannel.send({
embeds: [paymentEmbed]
});

const clientChannel =
await client.channels.fetch(
CHANNELS.CLIENT_PANEL
);

const clientEmbed =
new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("PANEL KLIENTA")
.setDescription(
"Kliknij przycisk poniżej aby sprawdzić wydatki"
);

const clientButton =
new ButtonBuilder()
.setCustomId("client_stats")
.setLabel("SPRAWDŹ WYDATKI")
.setStyle(ButtonStyle.Primary);

await clientChannel.send({
embeds: [clientEmbed],
components: [
new ActionRowBuilder().addComponents(clientButton)
]
});
const dropChannel =
await client.channels.fetch(
CHANNELS.DROP
);

const dropEmbed =
new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("DROP SHOPIKA")
.setDescription(
"Kliknij przycisk poniżej aby losować nagrodę"
);

const dropButton =
new ButtonBuilder()
.setCustomId("drop_button")
.setLabel("LOSUJ DROP")
.setStyle(ButtonStyle.Success);

await dropChannel.send({
embeds: [dropEmbed],
components: [
new ActionRowBuilder().addComponents(dropButton)
]
});

});

client.on(
Events.GuildMemberAdd,
async member => {

const channel =
await client.channels.fetch(
CHANNELS.WELCOME
);

const embed =
new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("WITAMY")
.setDescription(`
${member}

Cieszymy się że dołączasz na naszego shopa 🥳
`);

await channel.send({
embeds: [embed]
});

}
);

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
Object.values(db.tickets)
.find(
t =>
t.owner === interaction.user.id
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
"Wybierz metodę"
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
"CS2 SKINS",
value:
"CS2 SKINS"
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
"Wybierz metodę płatności",
components: [
new ActionRowBuilder()
.addComponents(menu)
],
ephemeral: true
});

}

if (value === "sell") {

const modal =
new ModalBuilder()
.setCustomId("sell_modal")
.setTitle("SKUP");

const amount =
new TextInputBuilder()
.setCustomId("amount")
.setLabel("Kwota")
.setStyle(
TextInputStyle.Short
);

const payment =
new TextInputBuilder()
.setCustomId("payment")
.setLabel("Forma płatności")
.setStyle(
TextInputStyle.Short
);

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
if (value === "other") {

const modal =
new ModalBuilder()
.setCustomId("other_modal")
.setTitle("POMOC");

const reason =
new TextInputBuilder()
.setCustomId("reason")
.setLabel("W czym pomóc?")
.setStyle(
TextInputStyle.Paragraph
);

modal.addComponents(
new ActionRowBuilder()
.addComponents(reason)
);

return interaction.showModal(
modal
);

}

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
.setTitle("ZAKUP");

const amount =
new TextInputBuilder()
.setCustomId("amount")
.setLabel("Za ile kupujesz?")
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

if (interaction.isModalSubmit()) {

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
`<@&${ROLES.LIMIT50}> <@&${ROLES.NOLIMIT}>`;

}

else if (amount <= 100) {

categoryName =
"LIMIT 100";

pingRole =
`<@&${ROLES.LIMIT100}> <@&${ROLES.NOLIMIT}>`;

}

else if (amount <= 200) {

categoryName =
"LIMIT 200";

pingRole =
`<@&${ROLES.LIMIT200}> <@&${ROLES.NOLIMIT}>`;

}

const category =
await getCategory(
interaction.guild,
categoryName
);

const channel =
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
},

{
id:
ROLES.NOLIMIT,

allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id:
ROLES.LIMIT50,

allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id:
ROLES.LIMIT100,

allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id:
ROLES.LIMIT200,

allow: [
PermissionsBitField.Flags.ViewChannel
]
}

]

});
db.tickets[channel.id] = {
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
.setLabel("PRZEJMIJ TICKET")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("send_legit")
.setLabel("WYSTAW LEGITKĘ")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("ZAMKNIJ")
.setStyle(ButtonStyle.Danger)

);

await channel.send({
content: pingRole,
embeds: [embed],
components: [buttons]
});

return interaction.reply({
content:
`✅ Ticket utworzony ${channel}`,
ephemeral: true
});

}

if (
interaction.customId ===
"sell_modal"
) {

return interaction.reply({
content:
"✅ System skupu działa",
ephemeral: true
});

}

if (
interaction.customId ===
"other_modal"
) {

return interaction.reply({
content:
"✅ Ticket pomocy utworzony",
ephemeral: true
});

}

}

if (interaction.isButton()) {

if (
interaction.customId ===
"claim_ticket"
) {

const topic =
interaction.channel.topic?.split("|");

if (!topic) return;

const buyerId =
topic[0];

await interaction.channel.permissionOverwrites.set([

{
id:
interaction.guild.id,

deny: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id:
buyerId,

allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
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

]);

return interaction.reply({
content:
`✅ Ticket przejął ${interaction.user}`
});

}

if (
interaction.customId ===
"send_legit"
) {

const topic =
interaction.channel.topic?.split("|");

if (!topic) return;

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

const embed =
new EmbedBuilder()
.setColor("Green")
.setTitle("NOWA TRANSAKCJA")
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
.setTimestamp();

await legitChannel.send({
embeds: [embed]
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

await interaction.reply({
content:
"✅ Legitka wystawiona"
});

setTimeout(async () => {

const parent = interaction.channel.parent;

await interaction.channel.delete()
.catch(() => {});

if (parent) {

const channelsLeft =
parent.children.cache.filter(
c => c.id !== interaction.channel.id
);

if (channelsLeft.size === 0) {

await parent.delete()
.catch(() => {});

}

}

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
"🗑️ Zamykanie..."
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
db.users[interaction.user.id];

if (!data) {

return interaction.reply({
content:
"❌ Nie masz wydatków",
ephemeral: true
});

}

const avg =
Math.floor(
data.spent / data.orders
);

return interaction.reply({
content:
`
💸 Wydane:
${data.spent} zł

🛒 Zamówienia:
${data.orders}

📊 Średnia:
${avg} zł
`,
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

return interaction.reply({
content:
"❌ Spróbuj ponownie za 3h",
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

reward = "100 TYSIĘCY";

}

else if (random <= 0.01) {

reward = "BONUS 10%";

}

else if (random <= 0.02) {

reward = "BONUS 5%";

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

}

});

(async () => {
await require("./commands")(client, TOKEN);
})();

client.login(TOKEN);
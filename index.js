const {
Client,
GatewayIntentBits,
Partials,
PermissionsBitField,
ChannelType,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
EmbedBuilder,
StringSelectMenuBuilder,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
Events,
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
],
partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;

const IDS = {
TICKET_PANEL: "1502358629402284234",
CLIENT_PANEL: "1502649421136003132",
LEGIT: "1502356815495692440",
WELCOME: "1502652604973318376",
PAYMENTS: "1502648184714039486",
DROP: "1502655319392915466",
INVITES: "1502650236324024421",
GIVEAWAY: "1502654052318707782",

LIMIT50: "1502388117309755542",
LIMIT100: "1502388253691744399",
LIMIT200: "1502388290265944085",
NOLIMIT: "1502388310394540092",

HELPER: "1502601578400579604",
SKUP: "1502761459371737108",
TICKET: "1502363051003871282",

CLIENT: "1502661344455823431",
CLIENT250: "1502663222258307294",
CLIENT200: "1502664307169689738",
CLIENT500: "1502665546922197042"
};

if (!fs.existsSync("./database.json")) {
fs.writeFileSync("./database.json", JSON.stringify({
spent: {},
drops: {},
tickets: {},
invites: {}
}, null, 2));
}

function loadDB() {
return JSON.parse(fs.readFileSync("./database.json"));
}

function saveDB(data) {
fs.writeFileSync("./database.json", JSON.stringify(data, null, 2));
}

function addSpent(userId, amount) {
const db = loadDB();

if (!db.spent[userId]) {
db.spent[userId] = {
total: 0,
count: 0,
last: 0
};
}

db.spent[userId].total += amount;
db.spent[userId].count += 1;
db.spent[userId].last = amount;

saveDB(db);
}

function paymentEmbed() {
return new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("💳 METODY PŁATNOŚCI ANARCHICZNEGO SHOPIKA 💳")
.setDescription(`
🧾 PSC Z PARAGONEM ➜ 15%
🔐 PSC BEZ PARAGONU ➜ 20%
🔐 MYPSC ➜ 25%
📲 BLIK NA NR ➜ 0%
🔢 KOD BLIK ➜ 10%
🔫 CS2 SKINS ➜ 40%
🅿️ PAYPAL ➜ 12%
`);
}

function ticketPanelEmbed() {
return new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("ANARCHICZNY SHOPIK - TICKETY")
.setDescription("Wybierz temat ticketu.");
}

function clientPanelEmbed() {
return new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("PANEL KLIENTA")
.setDescription("Kliknij przycisk poniżej aby sprawdzić swoje wydatki.");
}

client.once("ready", async () => {
console.log(`${client.user.tag} ONLINE`);

const guilds = client.guilds.cache;

for (const guild of guilds.values()) {

const paymentChannel = guild.channels.cache.get(IDS.PAYMENTS);

if (paymentChannel) {
await paymentChannel.bulkDelete(20).catch(() => {});

await paymentChannel.send({
embeds: [paymentEmbed()]
});
}

const ticketChannel = guild.channels.cache.get(IDS.TICKET_PANEL);

if (ticketChannel) {

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_menu")
.setPlaceholder("Wybierz temat")
.addOptions([
{
label: "💰 Zakup waluty",
value: "buy"
},
{
label: "💵 Skup",
value: "sell"
},
{
label: "🆘 Inne",
value: "other"
}
]);

await ticketChannel.bulkDelete(20).catch(() => {});

await ticketChannel.send({
embeds: [ticketPanelEmbed()],
components: [
new ActionRowBuilder().addComponents(menu)
]
});
}

const clientPanel = guild.channels.cache.get(IDS.CLIENT_PANEL);

if (clientPanel) {

const button = new ButtonBuilder()
.setCustomId("check_spent")
.setLabel("SPRAWDŹ SWOJE WYDATKI")
.setStyle(ButtonStyle.Primary);

await clientPanel.send({
embeds: [clientPanelEmbed()],
components: [
new ActionRowBuilder().addComponents(button)
]
});
}
}
});
client.on(Events.GuildMemberAdd, async member => {

const channel = member.guild.channels.cache.get(IDS.WELCOME);

if (!channel) return;

const embed = new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("WITAMY NA SERWERZE")
.setDescription(`${member}

Cieszymy się że dołączyłeś na naszego shopa 🥳`);

channel.send({
embeds: [embed]
});
});

client.on(Events.InteractionCreate, async interaction => {

if (interaction.isButton()) {

if (interaction.customId === "check_spent") {

const db = loadDB();

const spent = db.spent[interaction.user.id];

if (!spent) {

const embed = new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("BRAK WYDATKÓW")
.setDescription(`${interaction.user}

Nie masz jeszcze żadnych wydatków.`);

return interaction.reply({
embeds: [embed],
ephemeral: true
});
}

const avg = Math.floor(spent.total / spent.count);

const embed = new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("PANEL KLIENTA")
.setDescription(`
👤 Klient: ${interaction.user}

💸 Łączne wydatki: ${spent.total} zł
📦 Ilość zakupów: ${spent.count}
📊 Średnia zakupu: ${avg} zł
🧾 Ostatni wydatek: ${spent.last} zł
`);

return interaction.reply({
embeds: [embed],
ephemeral: true
});
}

if (interaction.customId.startsWith("claim_")) {

const channel = interaction.channel;

const member = interaction.member;

await channel.permissionOverwrites.set([
{
id: interaction.guild.roles.everyone.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: IDS.TICKET,
allow: [PermissionsBitField.Flags.ViewChannel]
},
{
id: member.id,
allow: [PermissionsBitField.Flags.ViewChannel]
},
{
id: channel.topic,
allow: [PermissionsBitField.Flags.ViewChannel]
}
]);

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle("TICKET PRZEJĘTY")
.setDescription(`
Kupujący:
<@${channel.topic}>

Sprzedawca:
${member}
`);

return interaction.reply({
embeds: [embed]
});
}

if (interaction.customId.startsWith("close_")) {

if (
!interaction.member.roles.cache.has(IDS.TICKET) &&
!interaction.member.roles.cache.has(IDS.HELPER)
) {
return interaction.reply({
content: "Brak permisji.",
ephemeral: true
});
}

await interaction.reply("Usuwam ticket...");

setTimeout(() => {
interaction.channel.delete().catch(() => {});
}, 3000);
}

if (interaction.customId.startsWith("legit_")) {

const split = interaction.customId.split("_");

const userId = split[1];
const amount = Number(split[2]);
const method = split[3];

const legitChannel = interaction.guild.channels.cache.get(IDS.LEGIT);

if (legitChannel) {

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle("NOWA TRANSAKCJA")
.setDescription(`
Kupujący:
<@${userId}>

Sprzedawca:
${interaction.user}

Kwota:
${amount} zł

Metoda:
${method}
`)
.setTimestamp();

await legitChannel.send({
embeds: [embed]
});
}

addSpent(userId, amount);

const member = await interaction.guild.members.fetch(userId);

if (member) {

await member.roles.add(IDS.CLIENT).catch(() => {});

const db = loadDB();
const total = db.spent[userId].total;

if (total >= 250) {
member.roles.add(IDS.CLIENT250).catch(() => {});
}

if (total >= 200) {
member.roles.add(IDS.CLIENT200).catch(() => {});
}

if (total >= 500) {
member.roles.add(IDS.CLIENT500).catch(() => {});
}
}

await interaction.reply({
content: "Wystawiono legitkę."
});

setTimeout(() => {
interaction.channel.delete().catch(() => {});
}, 3000);
}
}
});
client.on(Events.GuildMemberAdd, async member => {

const channel = member.guild.channels.cache.get(IDS.WELCOME);

if (!channel) return;

const embed = new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("WITAMY NA SERWERZE")
.setDescription(`${member}

Cieszymy się że dołączyłeś na naszego shopa 🥳`);

channel.send({
embeds: [embed]
});
});

client.on(Events.InteractionCreate, async interaction => {

if (interaction.isButton()) {

if (interaction.customId === "check_spent") {

const db = loadDB();

const spent = db.spent[interaction.user.id];

if (!spent) {

const embed = new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("BRAK WYDATKÓW")
.setDescription(`${interaction.user}

Nie masz jeszcze żadnych wydatków.`);

return interaction.reply({
embeds: [embed],
ephemeral: true
});
}

const avg = Math.floor(spent.total / spent.count);

const embed = new EmbedBuilder()
.setColor("#0b1d51")
.setTitle("PANEL KLIENTA")
.setDescription(`
👤 Klient: ${interaction.user}

💸 Łączne wydatki: ${spent.total} zł
📦 Ilość zakupów: ${spent.count}
📊 Średnia zakupu: ${avg} zł
🧾 Ostatni wydatek: ${spent.last} zł
`);

return interaction.reply({
embeds: [embed],
ephemeral: true
});
}

if (interaction.customId.startsWith("claim_")) {

const channel = interaction.channel;

const member = interaction.member;

await channel.permissionOverwrites.set([
{
id: interaction.guild.roles.everyone.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: IDS.TICKET,
allow: [PermissionsBitField.Flags.ViewChannel]
},
{
id: member.id,
allow: [PermissionsBitField.Flags.ViewChannel]
},
{
id: channel.topic,
allow: [PermissionsBitField.Flags.ViewChannel]
}
]);

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle("TICKET PRZEJĘTY")
.setDescription(`
Kupujący:
<@${channel.topic}>

Sprzedawca:
${member}
`);

return interaction.reply({
embeds: [embed]
});
}

if (interaction.customId.startsWith("close_")) {

if (
!interaction.member.roles.cache.has(IDS.TICKET) &&
!interaction.member.roles.cache.has(IDS.HELPER)
) {
return interaction.reply({
content: "Brak permisji.",
ephemeral: true
});
}

await interaction.reply("Usuwam ticket...");

setTimeout(() => {
interaction.channel.delete().catch(() => {});
}, 3000);
}

if (interaction.customId.startsWith("legit_")) {

const split = interaction.customId.split("_");

const userId = split[1];
const amount = Number(split[2]);
const method = split[3];

const legitChannel = interaction.guild.channels.cache.get(IDS.LEGIT);

if (legitChannel) {

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle("NOWA TRANSAKCJA")
.setDescription(`
Kupujący:
<@${userId}>

Sprzedawca:
${interaction.user}

Kwota:
${amount} zł

Metoda:
${method}
`)
.setTimestamp();

await legitChannel.send({
embeds: [embed]
});
}

addSpent(userId, amount);

const member = await interaction.guild.members.fetch(userId);

if (member) {

await member.roles.add(IDS.CLIENT).catch(() => {});

const db = loadDB();
const total = db.spent[userId].total;

if (total >= 250) {
member.roles.add(IDS.CLIENT250).catch(() => {});
}

if (total >= 200) {
member.roles.add(IDS.CLIENT200).catch(() => {});
}

if (total >= 500) {
member.roles.add(IDS.CLIENT500).catch(() => {});
}
}

await interaction.reply({
content: "Wystawiono legitkę."
});

setTimeout(() => {
interaction.channel.delete().catch(() => {});
}, 3000);
}
}
});
// ====================== BUTTONS ======================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isButton()) return;

// ===== PRZEJMIJ =====

if (interaction.customId === "take_ticket") {

const channel = interaction.channel;

const perms = channel.permissionOverwrites.cache;

const has50 = perms.has(ROLES.LIMIT50);
const has100 = perms.has(ROLES.LIMIT100);
const has200 = perms.has(ROLES.LIMIT200);
const hasNoLimit = perms.has(ROLES.NOLIMIT);

const newPerms = [

{
id: interaction.guild.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},

{
id: ROLES.TICKET,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
},

{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
}

];

const topicData = channel.topic?.split("|");

if (topicData && topicData[0]) {

newPerms.push({
id: topicData[0],
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
});

}

await channel.permissionOverwrites.set(newPerms);

await interaction.reply({
content: `✅ Ticket przejęty przez ${interaction.user}`,
ephemeral: false
});

}

// ===== WYSTAW LEGITKE =====

if (interaction.customId === "send_legit") {

const channel = interaction.channel;

const data = channel.topic.split("|");

const buyerId = data[0];
const amount = Number(data[1]);
const payment = data[2];

const legitChannel =
interaction.guild.channels.cache.get(CHANNELS.LEGIT);

if (!legitChannel) {
return interaction.reply({
content: "❌ Nie znaleziono kanału legit-check",
ephemeral: true
});
}

const embed = new EmbedBuilder()
.setColor("#1e2a38")
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

// ===== DODANIE WYDATKU =====

if (!db.users[buyerId]) {

db.users[buyerId] = {
spent: 0,
orders: 0,
lastOrder: 0
};

}

db.users[buyerId].spent += amount;
db.users[buyerId].orders += 1;
db.users[buyerId].lastOrder = amount;

saveDatabase();

// ===== ROLE KLIENTA =====

const member =
await interaction.guild.members.fetch(buyerId)
.catch(() => null);

if (member) {

await member.roles.add(ROLES.CLIENT).catch(() => {});

if (db.users[buyerId].spent >= 250) {
await member.roles.add(ROLES.CLIENT250).catch(() => {});
}

if (db.users[buyerId].spent >= 200) {
await member.roles.add(ROLES.CLIENT200).catch(() => {});
}

if (db.users[buyerId].spent >= 500) {
await member.roles.add(ROLES.CLIENT500).catch(() => {});
}

}

// ===== WIADOMOSC =====

await interaction.reply({
content: "✅ Wystawiono legitkę i naliczono wydatki",
ephemeral: false
});

// ===== USUWANIE TICKETA =====

setTimeout(async () => {

await channel.delete().catch(() => {});

}, 3000);

}

// ===== ZAMKNIJ =====

if (interaction.customId === "close_ticket") {

const member =
await interaction.guild.members.fetch(interaction.user.id);

const isStaff =
member.roles.cache.has(ROLES.TICKET) ||
member.roles.cache.has(ROLES.HELPER) ||
member.roles.cache.has(ROLES.NOLIMIT) ||
member.roles.cache.has(ROLES.LIMIT50) ||
member.roles.cache.has(ROLES.LIMIT100) ||
member.roles.cache.has(ROLES.LIMIT200);

if (!isStaff) {

return interaction.reply({
content: "❌ Nie możesz zamknąć ticketu",
ephemeral: true
});

}

await interaction.reply({
content: "🗑️ Ticket zostanie zamknięty..."
});

setTimeout(async () => {

await interaction.channel.delete().catch(() => {});

}, 3000);

}

});
// ====================== BUTTONS ======================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isButton()) return;

// ===== PRZEJMIJ =====

if (interaction.customId === "take_ticket") {

const channel = interaction.channel;

const perms = channel.permissionOverwrites.cache;

const has50 = perms.has(ROLES.LIMIT50);
const has100 = perms.has(ROLES.LIMIT100);
const has200 = perms.has(ROLES.LIMIT200);
const hasNoLimit = perms.has(ROLES.NOLIMIT);

const newPerms = [

{
id: interaction.guild.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},

{
id: ROLES.TICKET,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
},

{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
}

];

const topicData = channel.topic?.split("|");

if (topicData && topicData[0]) {

newPerms.push({
id: topicData[0],
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
});

}

await channel.permissionOverwrites.set(newPerms);

await interaction.reply({
content: `✅ Ticket przejęty przez ${interaction.user}`,
ephemeral: false
});

}

// ===== WYSTAW LEGITKE =====

if (interaction.customId === "send_legit") {

const channel = interaction.channel;

const data = channel.topic.split("|");

const buyerId = data[0];
const amount = Number(data[1]);
const payment = data[2];

const legitChannel =
interaction.guild.channels.cache.get(CHANNELS.LEGIT);

if (!legitChannel) {
return interaction.reply({
content: "❌ Nie znaleziono kanału legit-check",
ephemeral: true
});
}

const embed = new EmbedBuilder()
.setColor("#1e2a38")
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

// ===== DODANIE WYDATKU =====

if (!db.users[buyerId]) {

db.users[buyerId] = {
spent: 0,
orders: 0,
lastOrder: 0
};

}

db.users[buyerId].spent += amount;
db.users[buyerId].orders += 1;
db.users[buyerId].lastOrder = amount;

saveDatabase();

// ===== ROLE KLIENTA =====

const member =
await interaction.guild.members.fetch(buyerId)
.catch(() => null);

if (member) {

await member.roles.add(ROLES.CLIENT).catch(() => {});

if (db.users[buyerId].spent >= 250) {
await member.roles.add(ROLES.CLIENT250).catch(() => {});
}

if (db.users[buyerId].spent >= 200) {
await member.roles.add(ROLES.CLIENT200).catch(() => {});
}

if (db.users[buyerId].spent >= 500) {
await member.roles.add(ROLES.CLIENT500).catch(() => {});
}

}

// ===== WIADOMOSC =====

await interaction.reply({
content: "✅ Wystawiono legitkę i naliczono wydatki",
ephemeral: false
});

// ===== USUWANIE TICKETA =====

setTimeout(async () => {

await channel.delete().catch(() => {});

}, 3000);

}

// ===== ZAMKNIJ =====

if (interaction.customId === "close_ticket") {

const member =
await interaction.guild.members.fetch(interaction.user.id);

const isStaff =
member.roles.cache.has(ROLES.TICKET) ||
member.roles.cache.has(ROLES.HELPER) ||
member.roles.cache.has(ROLES.NOLIMIT) ||
member.roles.cache.has(ROLES.LIMIT50) ||
member.roles.cache.has(ROLES.LIMIT100) ||
member.roles.cache.has(ROLES.LIMIT200);

if (!isStaff) {

return interaction.reply({
content: "❌ Nie możesz zamknąć ticketu",
ephemeral: true
});

}

await interaction.reply({
content: "🗑️ Ticket zostanie zamknięty..."
});

setTimeout(async () => {

await interaction.channel.delete().catch(() => {});

}, 3000);

}

});
// ====================== PANEL WYDATKÓW ======================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isButton()) return;

if (interaction.customId !== "check_spent") return;

const userData = db.users[interaction.user.id];

if (!userData) {

const embed = new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("PANEL KLIENTA")
.setDescription(`
${interaction.user}

Nie masz jeszcze żadnych wydatków
na naszym shopie.
`);

return interaction.reply({
embeds: [embed],
ephemeral: true
});

}

const average =
(userData.spent / userData.orders).toFixed(2);

const embed = new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("PANEL KLIENTA")
.setDescription(`
${interaction.user}

💸 Łączne wydatki:
${userData.spent.toFixed(2)} zł

🛒 Ilość zakupów:
${userData.orders}

📊 Średnia zakupu:
${average} zł

🧾 Ostatni wydatek:
${userData.lastOrder} zł
`);

await interaction.reply({
embeds: [embed],
ephemeral: true
});

});

// ====================== DROP SYSTEM ======================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isButton()) return;

if (interaction.customId !== "drop_button") return;

const now = Date.now();

if (!db.dropCooldowns) db.dropCooldowns = {};

const cooldown = db.dropCooldowns[interaction.user.id];

if (cooldown && cooldown > now) {

const left =
Math.ceil((cooldown - now) / 1000 / 60);

return interaction.reply({
content:
`❌ Możesz losować ponownie za ${left} minut`,
ephemeral: true
});

}

db.dropCooldowns[interaction.user.id] =
now + (3 * 60 * 60 * 1000);

saveDatabase();

const random = Math.random();

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

const embed = new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("DROP")
.setDescription(`
❌ Niestety tym razem nic nie wygrałeś.

Spróbuj ponownie za 3 godziny.
`);

return interaction.reply({
embeds: [embed],
ephemeral: true
});

}

const embed = new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("DROP")
.setDescription(`
🎉 Gratulacje!

Wygrałeś:

${reward}
`);

await interaction.reply({
embeds: [embed],
ephemeral: true
});

});

// ====================== KONKURSY ======================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isChatInputCommand()) return;

if (interaction.commandName !== "konkurs") return;

if (
!interaction.member.roles.cache.has(ROLES.HELPER)
) {

return interaction.reply({
content: "❌ Tylko helper może zrobić konkurs",
ephemeral: true
});

}

const prize =
interaction.options.getString("nagroda");

const winners =
interaction.options.getInteger("wygrani");

const requirements =
interaction.options.getString("wymagania");

const hours =
interaction.options.getInteger("czas");

const end =
Math.floor(Date.now() / 1000)
+ (hours * 3600);

const embed = new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("🎉 KONKURS")
.setDescription(`
🎁 Nagroda:
${prize}

🏆 Wygranych:
${winners}

📋 Wymagania:
${requirements}

⏰ Koniec:
<t:${end}:R>
`);

const button =
new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("join_giveaway")
.setLabel("DOŁĄCZ")
.setStyle(ButtonStyle.Success)

);

await interaction.channel.send({
embeds: [embed],
components: [button]
});

await interaction.reply({
content: "✅ Konkurs utworzony",
ephemeral: true
});

});
// ====================== /ZAPRO ======================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isChatInputCommand()) return;

if (interaction.commandName !== "zapro") return;

if (!db.invites) db.invites = {};

const data = db.invites[interaction.user.id] || {
invites: 0,
leaves: 0,
legit: 0
};

const embed = new EmbedBuilder()
.setColor("#1e2a38")
.setTitle("SYSTEM ZAPROSZEŃ")
.setDescription(`
👤 ${interaction.user}

📨 Zapro:
${data.invites}

📤 Leaves:
${data.leaves}

✅ Legit Invites:
${data.legit}
`);

await interaction.reply({
embeds: [embed],
ephemeral: true
});

});

// ====================== LICZENIE INVITE ======================

client.on("guildMemberAdd", async member => {

if (!db.invites) db.invites = {};

const inviterId = member.inviterId;

if (!inviterId) return;

const created =
member.user.createdTimestamp;

const threeMonths =
1000 * 60 * 60 * 24 * 90;

const legit =
(Date.now() - created) >= threeMonths;

if (!db.invites[inviterId]) {

db.invites[inviterId] = {
invites: 0,
leaves: 0,
legit: 0
};

}

db.invites[inviterId].invites++;

if (legit) {

db.invites[inviterId].legit++;

}

saveDatabase();

});

// ====================== USUWANIE WIADOMOSCI ======================

client.on("messageCreate", async message => {

if (message.author.bot) return;

if (
message.channel.id ===
CHANNELS.INVITES
) {

if (
!message.content.startsWith("/zapro")
) {

await message.delete().catch(() => {});

}

}

});

// ====================== REJESTRACJA KOMEND ======================

client.once("ready", async () => {

const commands = [

new SlashCommandBuilder()
.setName("zapro")
.setDescription("Sprawdź zaproszenia"),

new SlashCommandBuilder()
.setName("konkurs")
.setDescription("Stwórz konkurs")

.addStringOption(option =>
option
.setName("nagroda")
.setDescription("Nagroda")
.setRequired(true)
)

.addIntegerOption(option =>
option
.setName("wygrani")
.setDescription("Ilość wygranych")
.setRequired(true)
)

.addStringOption(option =>
option
.setName("wymagania")
.setDescription("Wymagania")
.setRequired(true)
)

.addIntegerOption(option =>
option
.setName("czas")
.setDescription("Czas w godzinach")
.setRequired(true)
)

];

await client.application.commands.set(commands);

console.log("Komendy zarejestrowane");

});

// ====================== ZAPIS DANYCH ======================

setInterval(() => {

saveDatabase();

}, 5000);

// ====================== LOGIN ======================

client.login(TOKEN);
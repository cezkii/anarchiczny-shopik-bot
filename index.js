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

const TOKEN = process.env.TOKEN;

const CLIENT_ID = "1502359226532499659";
const GUILD_ID = "1502353179722121377";

const CHANNELS = {
TICKETS: "1502358629402284234",
LEGIT: "1502356815495692440",
WELCOME: "1502652604973318376",
PAYMENTS: "1502648184714039486",
CLIENT_PANEL: "1502649421136003132",
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
invites: {},
cooldowns: {}
};

if (fs.existsSync("./database.json")) {
db = JSON.parse(fs.readFileSync("./database.json"));
}

function saveDB() {
fs.writeFileSync(
"./database.json",
JSON.stringify(db, null, 2)
);
}

async function getCategory(guild, name) {

let category = guild.channels.cache.find(
c =>
c.type === ChannelType.GuildCategory &&
c.name === name
);

if (!category) {

category = await guild.channels.create({
name: name,
type: ChannelType.GuildCategory
});

}

return category;

}

async function deleteEmptyCategory(channel) {

const parent = channel.parent;

if (!parent) return;

const channels = parent.children.cache.filter(
c => c.id !== channel.id
);

if (channels.size === 0) {

await parent.delete().catch(() => {});

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
.setDescription("Pokazuje ilość zaproszeń"),

new SlashCommandBuilder()

.setName("konkurs")

.setDescription("Tworzy konkurs")

.addStringOption(option =>
option
.setName("nagroda")
.setDescription("Nagroda")
.setRequired(true)
)

.addStringOption(option =>
option
.setName("czas")
.setDescription("Np 1h")
.setRequired(true)
)

.addIntegerOption(option =>
option
.setName("wygrani")
.setDescription("Ilość wygranych")
.setRequired(true)
)

];

const rest = new REST({
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

const ticketMessages =
await ticketChannel.messages.fetch({
limit: 20
});

const alreadyTicket =
ticketMessages.find(
m =>
m.author.id === client.user.id &&
m.components.length
);

if (!alreadyTicket) {

const embed =
new EmbedBuilder()

.setColor("#1e2a38")

.setTitle(
"🎫 TICKETY SHOPIKA"
)

.setDescription(
"Wybierz kategorię ticketu"
);

const menu =
new StringSelectMenuBuilder()

.setCustomId("ticket_select")

.setPlaceholder(
"Wybierz ticket"
)

.addOptions([
{
label: "Zakup waluty",
value: "buy",
emoji: "💰"
},
{
label: "Skup",
value: "sell",
emoji: "💵"
},
{
label: "Inne",
value: "other",
emoji: "🆘"
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
Object.values(db.tickets).find(
t =>
t.owner === interaction.user.id
);

if (already) {

return interaction.reply({

content:
"❌ Masz już otwarty ticket",

ephemeral: true

});

}

const value =
interaction.values[0];





/* =========================
   ZAKUP
========================= */

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
.addComponents(menu);

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
"Zakup waluty"
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





/* =========================
   SKUP
========================= */

if (
value === "sell"
) {

const modal =
new ModalBuilder()

.setCustomId(
"sell_modal"
)

.setTitle(
"Skup"
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





/* =========================
   INNE
========================= */

if (
value === "other"
) {

const modal =
new ModalBuilder()

.setCustomId(
"other_modal"
)

.setTitle(
"Pomoc"
);

const reason =
new TextInputBuilder()

.setCustomId(
"other_reason"
)

.setLabel(
"Powód"
)

.setStyle(
TextInputStyle.Paragraph
)

.setRequired(true);

modal.addComponents(

new ActionRowBuilder()
.addComponents(reason)

);

return interaction.showModal(
modal
);

}

}

});
client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isModalSubmit()
) return;





/* =========================
   ZAKUP
========================= */

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

const embed =
new EmbedBuilder()

.setColor("Green")

.setTitle(
"💸 NOWE ZAMÓWIENIE"
)

.setDescription(`

👤 Kupujący:
${interaction.user}

💰 Kwota:
${amount} zł

💳 Płatność:
${payment}

`);

const row =
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

);

await ticket.send({

content:
pingRole,

embeds: [embed],

components: [row]

});

return interaction.reply({

content:
`✅ Ticket utworzony ${ticket}`,

ephemeral: true

});

}
/* =========================
   SKUP MODAL
========================= */

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

db.tickets[
ticket.id
] = {

owner:
interaction.user.id

};

saveDB();

const embed =
new EmbedBuilder()

.setColor("Orange")

.setTitle(
"💵 NOWY SKUP"
)

.setDescription(`

👤 Sprzedający:
${interaction.user}

💰 Kwota:
${amount}

`);

const row =
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

);

await ticket.send({

content:
`<@&${ROLES.SKUP}>`,

embeds: [embed],

components: [row]

});

return interaction.reply({

content:
`✅ Ticket utworzony ${ticket}`,

ephemeral: true

});

}
/* =========================
   INNE MODAL
========================= */

if (
interaction.customId ===
"other_modal"
) {

const reason =
interaction.fields.getTextInputValue(
"other_reason"
);

const category =
await getCategory(
interaction.guild,
"INNE"
);

const ticket =
await interaction.guild.channels.create({

name:
`inne-${interaction.user.username}`,

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
ROLES.HELPER,

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

const embed =
new EmbedBuilder()

.setColor("Blue")

.setTitle(
"🆘 NOWA POMOC"
)

.setDescription(`

👤 Użytkownik:
${interaction.user}

📌 Powód:
${reason}

`);

const row =
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

);

await ticket.send({

content:
`<@&${ROLES.HELPER}>`,

embeds: [embed],

components: [row]

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





/* =========================
   PRZEJĘCIE TICKETA
========================= */

if (
interaction.customId ===
"claim_ticket"
) {

await interaction.reply({

content:
`✅ Ticket przejęty przez ${interaction.user}`

});

}





/* =========================
   LEGITKA
========================= */

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

👤 Kupujący:
<@${buyerId}>

💰 Kwota:
${amount} zł

💳 Płatność:
${payment}

🤝 Sprzedawca:
${interaction.user}

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





/* =========================
   ZAMYKANIE TICKETA
========================= */

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
"🗑️ Ticket zostanie usunięty",

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

});
client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isChatInputCommand()
) return;





/* =========================
   /ZAPRO
========================= */

if (
interaction.commandName ===
"zapro"
) {

const invited =
Object.values(
db.invites
).filter(
id => id === interaction.user.id
).length;

const embed =
new EmbedBuilder()

.setColor("Blue")

.setTitle(
"📨 ZAPROSZENIA"
)

.setDescription(`

👤 ${interaction.user}

📈 Ilość zaproszeń:
${invited}

`);

return interaction.reply({

embeds: [embed]

});

}





/* =========================
   /KONKURS
========================= */

if (
interaction.commandName ===
"konkurs"
) {

const nagroda =
interaction.options.getString(
"nagroda"
);

const czas =
interaction.options.getString(
"czas"
);

const wygrani =
interaction.options.getInteger(
"wygrani"
);

const row =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId(
"giveaway_join"
)

.setLabel(
"🎉 WEŹ UDZIAŁ"
)

.setStyle(
ButtonStyle.Success
)

);

const embed =
new EmbedBuilder()

.setColor("Purple")

.setTitle(
"🎉 NOWY KONKURS"
)

.setDescription(`

🏆 Nagroda:
${nagroda}

👥 Wygrani:
${wygrani}

⏰ Czas:
${czas}

`);

const msg =
await interaction.channel.send({

embeds: [embed],

components: [row]

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





/* =========================
   DOŁĄCZANIE DO KONKURSU
========================= */

if (
interaction.customId ===
"giveaway_join"
) {

return interaction.reply({

content:
"🎉 Dołączyłeś do konkursu",

ephemeral: true

});

}





/* =========================
   DROP
========================= */

if (
interaction.customId ===
"drop_button"
) {

if (
db.cooldowns[
interaction.user.id
] &&
Date.now() <
db.cooldowns[
interaction.user.id
]
) {

const left =
Math.floor(

(
db.cooldowns[
interaction.user.id
] - Date.now()
)
/ 60000

);

return interaction.reply({

content:
`❌ Spróbuj ponownie za ${left} minut`,

ephemeral: true

});

}

db.cooldowns[
interaction.user.id
] =
Date.now() + 10800000;

saveDB();

const random =
Math.random();

let reward =
null;

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

const welcomeChannel =
await client.channels.fetch(
CHANNELS.WELCOME
);

const embed =
new EmbedBuilder()

.setColor("#1e2a38")

.setTitle(
"👋 WITAMY"
)

.setDescription(`

🎉 Witaj ${member}

Miłego pobytu na shopie.

`);

await welcomeChannel.send({

embeds: [embed]

});

});





/* =========================
   PANEL KLIENTA
========================= */

client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isButton()
) return;

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
"❌ Nie masz jeszcze zakupów",

ephemeral: true

});

}

const avg =
Math.floor(
data.spent /
data.orders
);

const embed =
new EmbedBuilder()

.setColor("Blue")

.setTitle(
"📊 PANEL KLIENTA"
)

.setDescription(`

👤 ${interaction.user}

💸 Wydane:
${data.spent} zł

🛒 Zamówienia:
${data.orders}

📈 Średnia:
${avg} zł

`);

return interaction.reply({

embeds: [embed],

ephemeral: true

});

}

});

client.login(TOKEN);
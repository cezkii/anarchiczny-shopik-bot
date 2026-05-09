const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField,
ChannelType,
Events,
ModalBuilder,
TextInputBuilder,
TextInputStyle,
SlashCommandBuilder,
REST,
Routes
} = require('discord.js');

const fs = require('fs');

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
TICKETS: '1502649421136003132',
LEGIT: '1502356815495692440',
WELCOME: '1502652604973318376',
PAYMENTS: '1502648184714039486',
INVITES: '1502650236324024421',
DROP: '1502655319392915466',
GIVEAWAYS: '1502654052318707782'
};

const ROLES = {
LIMIT50: '1502388117309755542',
LIMIT100: '1502388253691744399',
LIMIT200: '1502388290265944085',
NOLIMIT: '1502388310394540092',
TICKET: '1502363051003871282',
HELPER: '1502601578400579604',
SKUP: '1502761459371737108',
CLIENT: '1502661344455823431',
CLIENT250: '1502663222258307294',
CLIENT200: '1502664307169689738',
CLIENT500: '1502665546922197042'
};

if (!fs.existsSync('./database.json')) {

fs.writeFileSync('./database.json', JSON.stringify({
spent: {},
drops: {},
invites: {}
}, null, 2));

}

const db = JSON.parse(
fs.readFileSync('./database.json')
);

function saveDB() {

fs.writeFileSync(
'./database.json',
JSON.stringify(db, null, 2)
);

}

async function getOrCreateCategory(guild, name) {

let category = guild.channels.cache.find(
c =>
c.type === ChannelType.GuildCategory &&
c.name === name
);

if (!category) {

category = await guild.channels.create({
name,
type: ChannelType.GuildCategory
});

}

return category;
}

async function deleteCategoryIfEmpty(category) {

if (!category) return;

if (category.children.cache.size <= 0) {

await category.delete().catch(() => {});

}

}

async function userHasTicket(guild, userId) {

const channels = guild.channels.cache.filter(
c =>
c.type === ChannelType.GuildText &&
c.topic &&
c.topic.includes(userId)
);

return channels.size > 0;
}
client.once('ready', async () => {

console.log(`${client.user.tag} ONLINE`);

const commands = [

new SlashCommandBuilder()
.setName('konkurs')
.setDescription('stworz konkurs')
.addStringOption(option =>
option
.setName('nagroda')
.setDescription('nagroda')
.setRequired(true)
)
.addIntegerOption(option =>
option
.setName('godziny')
.setDescription('ile trwa')
.setRequired(true)
),

new SlashCommandBuilder()
.setName('zapro')
.setDescription('pokaz zaproszenia')

];

const rest = new REST({ version: '10' })
.setToken(TOKEN);

try {

await rest.put(
Routes.applicationCommands(client.user.id),
{
body: commands
}
);

console.log('Komendy zaladowane');

} catch (err) {

console.log(err);

}

const ticketChannel =
await client.channels.fetch(CHANNELS.TICKETS);

const paymentChannel =
await client.channels.fetch(CHANNELS.PAYMENTS);

await ticketChannel.send({

embeds: [

new EmbedBuilder()
.setColor('#1e2a38')
.setTitle('ANARCHICZNY SHOPIK - TICKETY')
.setDescription('Wybierz temat ticketu')

],

components: [

new ActionRowBuilder()
.addComponents(

new StringSelectMenuBuilder()
.setCustomId('ticket_menu')
.setPlaceholder('Wybierz temat')
.addOptions([

{
label: 'ZAKUP WALUTY',
value: 'buy_money',
emoji: '💰'
},

{
label: 'SKUP',
value: 'sell_money',
emoji: '💵'
},

{
label: 'INNE',
value: 'other_help',
emoji: '🆘'
}

])

)

]

});

await paymentChannel.send({

embeds: [

new EmbedBuilder()
.setColor('#1e2a38')
.setTitle('💳 METODY PŁATNOŚCI ANARCHICZNEGO SHOPIKA 💳')
.setDescription(`

🧾 PSC Z PARAGONEM ➜ 15%
🔐 PSC BEZ PARAGONU ➜ 20%
🔐 MY PSC ➜ 25%
📲 BLIK NA NR TEL ➜ 0%
🔢 KOD BLIK ➜ 10%
🔫 CS2 SKINS ➜ 40%
🅿️ PAYPAL ➜ 12%

`)

]

});

const dropChannel =
await client.channels.fetch(CHANNELS.DROP);

await dropChannel.send({

embeds: [

new EmbedBuilder()
.setColor('#1e2a38')
.setTitle('DROP')
.setDescription(
'Kliknij przycisk poniżej aby wylosować nagrodę'
)

],

components: [

new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId('drop_button')
.setLabel('LOSUJ DROP')
.setStyle(ButtonStyle.Success)

)

]

});

});
client.on(
Events.InteractionCreate,
async interaction => {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === 'zapro') {

const invites =
db.invites[interaction.user.id] || {

joins: 0,
leaves: 0,
legit: 0

};

return interaction.reply({

embeds: [

new EmbedBuilder()
.setColor('#1e2a38')
.setTitle('ZAPROSZENIA')
.setDescription(`

Zapro - ${invites.joins}
Leaves - ${invites.leaves}
Legit Invites - ${invites.legit}

`)

]

});

}

if (interaction.commandName === 'konkurs') {

if (
!interaction.member.roles.cache.has(
ROLES.HELPER
)
) {

return interaction.reply({
content: 'Brak permisji.',
ephemeral: true
});

}

const reward =
interaction.options.getString('nagroda');

const hours =
interaction.options.getInteger('godziny');

const end =
Math.floor(Date.now() / 1000)
+ (hours * 3600);

return interaction.reply({

embeds: [

new EmbedBuilder()
.setColor('#1e2a38')
.setTitle('🎉 KONKURS 🎉')
.setDescription(`

Nagroda:
${reward}

Koniec:
<t:${end}:R>

`)

]

});

}

}

if (interaction.isStringSelectMenu()) {

if (
interaction.customId === 'ticket_menu'
) {

if (
await userHasTicket(
interaction.guild,
interaction.user.id
)
) {

return interaction.reply({
content:
'Masz już otwarty ticket.',
ephemeral: true
});

}

if (
interaction.values[0] === 'buy_money'
) {

const methods =
new StringSelectMenuBuilder()

.setCustomId('payment_method')

.setPlaceholder(
'Wybierz metodę płatności'
)

.addOptions([

{
label: 'BLIK NA NR TEL',
value: 'BLIK'
},

{
label: 'KOD BLIK',
value: 'KOD BLIK'
},

{
label: 'PSC Z PARAGONEM',
value: 'PSC PARAGON'
},

{
label: 'PSC BEZ PARAGONU',
value: 'PSC'
},

{
label: 'MYPSC',
value: 'MYPSC'
},

{
label: 'CS2 SKINS',
value: 'SKINS'
},

{
label: 'PAYPAL',
value: 'PAYPAL'
}

]);

return interaction.reply({

content:
'Wybierz metodę płatności',

components: [

new ActionRowBuilder()
.addComponents(methods)

],

ephemeral: true

});

}

if (
interaction.values[0] === 'sell_money'
) {

const modal =
new ModalBuilder()

.setCustomId('sell_modal')

.setTitle('SKUP');

modal.addComponents(

new ActionRowBuilder()
.addComponents(

new TextInputBuilder()
.setCustomId('sell_amount')
.setLabel(
'Ile sprzedajesz?'
)
.setStyle(TextInputStyle.Short)
.setRequired(true)

),

new ActionRowBuilder()
.addComponents(

new TextInputBuilder()
.setCustomId('sell_payment')
.setLabel(
'Forma płatności'
)
.setPlaceholder('PSC')
.setStyle(TextInputStyle.Short)
.setRequired(true)

)

);

return interaction.showModal(modal);

}

if (
interaction.values[0] === 'other_help'
) {

const modal =
new ModalBuilder()

.setCustomId('other_modal')

.setTitle('INNE');

modal.addComponents(

new ActionRowBuilder()
.addComponents(

new TextInputBuilder()
.setCustomId('reason')
.setLabel(
'W jakiej sprawie?'
)
.setStyle(TextInputStyle.Paragraph)
.setRequired(true)

)

);

return interaction.showModal(modal);

}

}

if (
interaction.customId ===
'payment_method'
) {

const payment =
interaction.values[0];

const modal =
new ModalBuilder()

.setCustomId(`buy_${payment}`)

.setTitle('ZAKUP WALUTY');

modal.addComponents(

new ActionRowBuilder()
.addComponents(

new TextInputBuilder()
.setCustomId('amount')
.setLabel(
'Za ile kupujesz?'
)
.setStyle(TextInputStyle.Short)
.setRequired(true)

)

);

return interaction.showModal(modal);

}

}
});
client.on(
Events.InteractionCreate,
async interaction => {

if (interaction.isModalSubmit()) {

if (
interaction.customId.startsWith('buy_')
) {

const payment =
interaction.customId.replace(
'buy_',
''
);

const amount =
parseInt(
interaction.fields.getTextInputValue(
'amount'
)
);

let categoryName = 'NO LIMIT';
let rolePing =
`<@&${ROLES.NOLIMIT}>`;

if (amount >= 1 && amount <= 50) {

categoryName = 'LIMIT 50';

rolePing =
`<@&${ROLES.LIMIT50}> <@&${ROLES.NOLIMIT}>`;

}

if (amount >= 51 && amount <= 100) {

categoryName = 'LIMIT 100';

rolePing =
`<@&${ROLES.LIMIT100}> <@&${ROLES.NOLIMIT}>`;

}

if (amount >= 101 && amount <= 200) {

categoryName = 'LIMIT 200';

rolePing =
`<@&${ROLES.LIMIT200}> <@&${ROLES.NOLIMIT}>`;

}

const category =
await getOrCreateCategory(
interaction.guild,
categoryName
);

const ticket =
await interaction.guild.channels.create({

name:
`zakup-${interaction.user.username}`,

type: ChannelType.GuildText,

parent: category.id,

topic:
`${interaction.user.id}|${amount}|${payment}`,

permissionOverwrites: [

{
id: interaction.guild.id,
deny: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id: ROLES.TICKET,
allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: ROLES.NOLIMIT,
allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: ROLES.LIMIT50,
allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: ROLES.LIMIT100,
allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: ROLES.LIMIT200,
allow: [
PermissionsBitField.Flags.ViewChannel
]
}

]

});

const buttons =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()
.setCustomId('take_ticket')
.setLabel('PRZEJMIJ TICKET')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('sold_ticket')
.setLabel('SPRZEDANE')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('send_legit')
.setLabel('WYSTAW LEGITKĘ')
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId('close_ticket')
.setLabel('ZAMKNIJ TICKET')
.setStyle(ButtonStyle.Danger)

);

await ticket.send({

content: rolePing,

embeds: [

new EmbedBuilder()
.setColor('Green')
.setTitle('NOWE ZAMÓWIENIE')
.setDescription(`

Poczekaj na sprzedawcę.

Kupujący:
${interaction.user}

Kwota:
${amount} PLN

Metoda:
${payment}

`)

],

components: [buttons]

});

return interaction.reply({

content:
`Ticket utworzony: ${ticket}`,

ephemeral: true

});

}

if (
interaction.customId === 'sell_modal'
) {

const amount =
interaction.fields.getTextInputValue(
'sell_amount'
);

const payment =
interaction.fields.getTextInputValue(
'sell_payment'
);

const category =
await getOrCreateCategory(
interaction.guild,
'SKUP'
);

const ticket =
await interaction.guild.channels.create({

name:
`skup-${interaction.user.username}`,

type: ChannelType.GuildText,

parent: category.id,

topic:
`${interaction.user.id}`,

permissionOverwrites: [

{
id: interaction.guild.id,
deny: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id: ROLES.SKUP,
allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: ROLES.TICKET,
allow: [
PermissionsBitField.Flags.ViewChannel
]
}

]

});

await ticket.send({

content:
`<@&${ROLES.SKUP}>`,

embeds: [

new EmbedBuilder()
.setColor('Green')
.setTitle('SKUP')
.setDescription(`

Sprzedający:
${interaction.user}

Kwota:
${amount}

Płatność:
${payment}

`)

]

});

return interaction.reply({

content:
`Ticket utworzony: ${ticket}`,

ephemeral: true

});

}

if (
interaction.customId === 'other_modal'
) {

const reason =
interaction.fields.getTextInputValue(
'reason'
);

const category =
await getOrCreateCategory(
interaction.guild,
'INNE'
);
const ticket =
await interaction.guild.channels.create({

name:
`inne-${interaction.user.username}`,

type: ChannelType.GuildText,

parent: category.id,

topic:
`${interaction.user.id}`,

permissionOverwrites: [

{
id: interaction.guild.id,
deny: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: interaction.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id: ROLES.HELPER,
allow: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: ROLES.TICKET,
allow: [
PermissionsBitField.Flags.ViewChannel
]
}

]

});

await ticket.send({

content:
`<@&${ROLES.HELPER}>`,

embeds: [

new EmbedBuilder()
.setColor('Green')
.setTitle('POMOC')
.setDescription(`

Użytkownik:
${interaction.user}

Powód:
${reason}

`)

]

});

return interaction.reply({

content:
`Ticket utworzony: ${ticket}`,

ephemeral: true

});

}

}

if (interaction.isButton()) {

if (
interaction.customId ===
'take_ticket'
) {

const buyerId =
interaction.channel.topic.split('|')[0];

await interaction.channel.permissionOverwrites.set([

{
id: interaction.guild.id,
deny: [
PermissionsBitField.Flags.ViewChannel
]
},

{
id: buyerId,
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
},

{
id: ROLES.TICKET,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages,
PermissionsBitField.Flags.ReadMessageHistory
]
}

]);

await interaction.reply({

content:
`✅ Ticket został przejęty przez ${interaction.user}`

});

}

if (
interaction.customId ===
'sold_ticket'
) {

const data =
interaction.channel.topic.split('|');

const buyerId = data[0];
const amount = parseInt(data[1]);

if (!db.spent[buyerId]) {

db.spent[buyerId] = {
total: 0,
last: 0,
orders: 0
};

}

db.spent[buyerId].total += amount;
db.spent[buyerId].last = amount;
db.spent[buyerId].orders += 1;

saveDB();

const member =
await interaction.guild.members.fetch(
buyerId
);

await member.roles.add(
ROLES.CLIENT
).catch(() => {});

if (
db.spent[buyerId].total >= 250
) {

await member.roles.add(
ROLES.CLIENT250
).catch(() => {});

}

if (
db.spent[buyerId].total >= 200
) {

await member.roles.add(
ROLES.CLIENT200
).catch(() => {});

}

if (
db.spent[buyerId].total >= 500
) {

await member.roles.add(
ROLES.CLIENT500
).catch(() => {});

}

return interaction.reply({

content:
'Dodano wydatek klientowi.'

});

}

if (
interaction.customId ===
'send_legit'
) {

const legitChannel =
await client.channels.fetch(
CHANNELS.LEGIT
);

const data =
interaction.channel.topic.split('|');

const buyerId = data[0];
const amount = data[1];
const payment = data[2];

const embed =
new EmbedBuilder()

.setColor('Green')

.setTitle('NOWA TRANSAKCJA')

.setDescription(`

Kupujący:
<@${buyerId}>

Sprzedawca:
${interaction.user}

Kwota:
${amount} PLN

Metoda:
${payment}

`)

.setTimestamp();

await legitChannel.send({

embeds: [embed]

});

await interaction.reply({

content:
'Legitka wystawiona.'

});

const category =
interaction.channel.parent;

setTimeout(async () => {

await interaction.channel.delete()
.catch(() => {});

if (
category.children.cache.size <= 1
) {

await category.delete()
.catch(() => {});

}

}, 3000);

}

if (
interaction.customId ===
'close_ticket'
) {

if (
interaction.user.id ===
interaction.channel.topic
) {

return interaction.reply({

content:
'Nie możesz zamknąć swojego ticketu.',

ephemeral: true

});

}

const category =
interaction.channel.parent;

await interaction.reply({

content:
'Zamykanie ticketu...'

});

setTimeout(async () => {

await interaction.channel.delete()
.catch(() => {});

if (
category.children.cache.size <= 1
) {

await category.delete()
.catch(() => {});

}

}, 3000);

}

if (
interaction.customId ===
'drop_button'
) {

const cooldown =
db.drops[interaction.user.id];

if (
cooldown &&
Date.now() < cooldown
) {

return interaction.reply({

content:
'Możesz losować co 3 godziny.',

ephemeral: true

});

}

db.drops[interaction.user.id] =
Date.now() + (3 * 60 * 60 * 1000);

saveDB();

const random =
Math.random() * 100;

let message =
'Niestety tym razem nic nie trafiłeś.';

if (random <= 0.01) {

message =
'🎉 Gratulacje wygrałeś 100 tysięcy!';

}

if (random >= 1 && random <= 2) {

message =
'🎉 Gratulacje wygrałeś bonus 5%!';

}

if (random >= 3 && random <= 4) {

message =
'🎉 Gratulacje wygrałeś bonus 10%!';

}

return interaction.reply({

embeds: [

new EmbedBuilder()
.setColor('#1e2a38')
.setTitle('DROP')
.setDescription(message)

],

ephemeral: true

});

}

}

});

client.on(
'guildMemberAdd',
async member => {

const channel =
await client.channels.fetch(
CHANNELS.WELCOME
);

if (!channel) return;

channel.send({

embeds: [

new EmbedBuilder()
.setColor('#1e2a38')
.setTitle('🎉 NOWY UŻYTKOWNIK')
.setDescription(`

${member}

Cieszymy się że dołączasz
na naszego shopa 🔥

Z itemami z shopika będziesz
mógł podbijać anarchię 🥳

`)

]

});

});

client.login(TOKEN);
client.on(
Events.InteractionCreate,
async interaction => {

if (
!interaction.isStringSelectMenu()
) return;





/* =========================
   WYBÓR PŁATNOŚCI
========================= */

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

.setPlaceholder(
"Np 50"
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
   WYBÓR TICKETA
========================= */

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

if (
value === "buy"
) {

const menu =
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
"BLIK NA NR",
emoji:
"💰"
},

{
label:
"KOD BLIK",
value:
"KOD BLIK",
emoji:
"💸"
},

{
label:
"PSC Z PARAGONEM",
value:
"PSC Z PARAGONEM",
emoji:
"💳"
},

{
label:
"PSC BEZ PARAGONU",
value:
"PSC BEZ PARAGONU",
emoji:
"🧾"
},

{
label:
"MYPSC",
value:
"MYPSC",
emoji:
"💵"
},

{
label:
"PAYPAL",
value:
"PAYPAL",
emoji:
"📲"
},

{
label:
"CS2 SKINS",
value:
"CS2 SKINS",
emoji:
"🔫"
}

]);

const row =
new ActionRowBuilder()
.addComponents(menu);

return interaction.reply({

content:
"💳 Wybierz metodę płatności",

components: [row],

ephemeral: true

});

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
"Skup waluty"
);

const amount =
new TextInputBuilder()

.setCustomId(
"sell_amount"
)

.setLabel(
"Ile sprzedajesz?"
)

.setPlaceholder(
"Np 100"
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
"Opisz problem"
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

if (isNaN(amount)) {

return interaction.reply({

content:
"❌ Podaj poprawną kwotę",

ephemeral: true

});

}

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
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
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

🕒 Status:
OCZEKIWANIE

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
`${pingRole} ${interaction.user}`,

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
   SKUP
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
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
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

🕒 Status:
OCZEKIWANIE

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
`<@&${ROLES.SKUP}> ${interaction.user}`,

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
   INNE
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
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
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

🕒 Status:
OCZEKIWANIE

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
`<@&${ROLES.HELPER}> ${interaction.user}`,

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

const embed =
EmbedBuilder.from(
interaction.message.embeds[0]
);

embed.setFields([
{
name:
"👨‍💼 Obsługuje",
value:
`${interaction.user}`,
inline: true
}
]);

await interaction.message.edit({

embeds: [embed]

});

return interaction.reply({

content:
`✅ Ticket przejęty przez ${interaction.user}`,

ephemeral: true

});

}





/* =========================
   LEGITKA
========================= */

if (
interaction.customId ===
"send_legit"
) {

if (
!interaction.channel.topic
) {

return interaction.reply({

content:
"❌ Brak danych ticketu",

ephemeral: true

});

}

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
   ZAMKNIĘCIE TICKETA
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
"🗑️ Ticket zostanie usunięty za 3 sekundy",

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
   KONKURS JOIN
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
`❌ Możesz ponownie odebrać drop za ${left} minut`,

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

👤 Użytkownik:
${interaction.user}

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

👥 Ilość wygranych:
${wygrani}

⏰ Czas:
${czas}

🎊 Kliknij przycisk poniżej aby dołączyć

`);

await interaction.channel.send({

embeds: [embed],

components: [row]

});

return interaction.reply({

content:
"✅ Konkurs został utworzony",

ephemeral: true

});

}

});
client.on(
Events.GuildMemberAdd,
async member => {

const inviter =
member.guild.invites.cache.find(
i =>
i.uses > (
db.invites[i.code] || 0
)
);

if (inviter) {

db.invites[
member.id
] =
inviter.inviter.id;

saveDB();

}

const welcomeChannel =
await client.channels.fetch(
CHANNELS.WELCOME
);

const embed =
new EmbedBuilder()

.setColor("#1e2a38")

.setTitle(
"👋 WITAMY NA SERWERZE"
)

.setDescription(`

🎉 Witaj ${member}

📌 Zapoznaj się z kanałami.

💸 Życzymy udanych zakupów.

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
"❌ Nie masz jeszcze żadnych zakupów",

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

💸 Łącznie wydane:
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
const {
SlashCommandBuilder,
REST,
Routes,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
Events
} = require("discord.js");

module.exports = async (client, TOKEN) => {

const CLIENT_ID = "1502359226532499659";
const GUILD_ID = "1502353179722121377";

const GIVEAWAY_CHANNEL = "1502654052318707782";
const INVITE_CHANNEL = "1502650236324024421";

const HELPER_ROLE = "1502601578400579604";

let invitesDB = {};
let giveaways = {};





/* =========================
   INVITES CACHE
========================= */

client.on(
Events.ClientReady,
async () => {

const guild =
await client.guilds.fetch(GUILD_ID);

const invites =
await guild.invites.fetch();

invites.forEach(invite => {

invitesDB[invite.code] = {
uses: invite.uses,
inviter: invite.inviter.id
};

});

console.log("✅ Invites załadowane");

});





/* =========================
   JOIN
========================= */

client.on(
Events.GuildMemberAdd,
async member => {

const invites =
await member.guild.invites.fetch();

let usedInvite = null;

invites.forEach(invite => {

const old =
invitesDB[invite.code];

if (
old &&
invite.uses > old.uses
) {

usedInvite = invite;

}

invitesDB[invite.code] = {
uses: invite.uses,
inviter: invite.inviter.id
};

});

if (!usedInvite) return;

const inviterId =
usedInvite.inviter.id;

if (!invitesDB[inviterId]) {

invitesDB[inviterId] = {
joins: 0,
leaves: 0
};

}

invitesDB[inviterId].joins++;

});





/* =========================
   LEAVE
========================= */

client.on(
Events.GuildMemberRemove,
async member => {

const inviterId =
member.inviterId;

if (!inviterId) return;

if (!invitesDB[inviterId]) {

invitesDB[inviterId] = {
joins: 0,
leaves: 0
};

}

invitesDB[inviterId].leaves++;

});





/* =========================
   REJESTRACJA KOMEND
========================= */

const commands = [

new SlashCommandBuilder()

.setName("zapro")

.setDescription("Pokazuje zaproszenia"),

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
.setDescription("Np 2h")
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

].map(cmd => cmd.toJSON());

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

console.log("✅ Komendy gotowe");





/* =========================
   INTERACTION
========================= */

client.on(
Events.InteractionCreate,
async interaction => {

if (!interaction.isChatInputCommand()) return;





/* =========================
   /ZAPRO
========================= */

if (
interaction.commandName === "zapro"
) {

if (
interaction.channel.id !== INVITE_CHANNEL
) {

return interaction.reply({

content:
`❌ Użyj na <#${INVITE_CHANNEL}>`,

ephemeral: true

});

}

const data =
invitesDB[interaction.user.id] || {
joins: 0,
leaves: 0
};

const embed =
new EmbedBuilder()

.setColor("Blue")

.setTitle("📨 STATYSTYKI ZAPROSZEŃ")

.addFields(

{
name: "✅ Dołączyło",
value: `${data.joins}`,
inline: true
},

{
name: "❌ Wyszło",
value: `${data.leaves}`,
inline: true
},

{
name: "📈 Aktywne",
value: `${data.joins - data.leaves}`,
inline: true
}

)

.setFooter({
text: interaction.user.username
});

return interaction.reply({
embeds: [embed]
});

}





/* =========================
   /KONKURS
========================= */

if (
interaction.commandName === "konkurs"
) {

if (
interaction.channel.id !== GIVEAWAY_CHANNEL
) {

return interaction.reply({

content:
"❌ Zły kanał",

ephemeral: true

});

}

if (
!interaction.member.roles.cache.has(
HELPER_ROLE
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

const czas =
interaction.options.getString(
"czas"
).toLowerCase();

const wygrani =
interaction.options.getInteger(
"wygrani"
);

const wymagania =
interaction.options.getString(
"wymagania"
);

let duration = 0;





/* =========================
   CZAS
========================= */

if (czas.endsWith("h")) {

duration =
parseInt(czas) * 3600000;

}

else if (czas.endsWith("d")) {

duration =
parseInt(czas) * 86400000;

}

else if (czas.endsWith("min")) {

duration =
parseInt(czas) * 60000;

}

else {

return interaction.reply({

content:
"❌ Format czasu: 1h / 1d / 1min",

ephemeral: true

});

}

if (
isNaN(duration) ||
duration <= 0
) {

return interaction.reply({

content:
"❌ Niepoprawny czas",

ephemeral: true

});

}

const endTime =
Date.now() + duration;

const embed =
new EmbedBuilder()

.setColor("Purple")

.setTitle("🎉 NOWY KONKURS")

.addFields(

{
name: "🏆 Nagroda",
value: nagroda,
inline: true
},

{
name: "👥 Wygrani",
value: `${wygrani}`,
inline: true
},

{
name: "⏰ Kończy się",
value: `<t:${Math.floor(endTime / 1000)}:R>`,
inline: true
},

{
name: "📋 Wymagania",
value: wymagania
}

)

.setFooter({
text: "Kliknij przycisk poniżej aby wziąć udział"
});

const row =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("giveaway_join")

.setLabel("🎉 WEŹ UDZIAŁ")

.setStyle(ButtonStyle.Success)

);

const msg =
await interaction.channel.send({

embeds: [embed],

components: [row]

});

giveaways[msg.id] = {
users: [],
winners: wygrani,
prize: nagroda
};

setTimeout(async () => {

const giveaway =
giveaways[msg.id];

if (!giveaway) return;

if (
giveaway.users.length === 0
) {

await interaction.channel.send(
"❌ Nikt nie wziął udziału"
);

delete giveaways[msg.id];

return;

}

const shuffled =
giveaway.users.sort(
() => 0.5 - Math.random()
);

const winners =
shuffled.slice(0, wygrani);

const winnersText =
winners.map(id => `<@${id}>`).join(", ");

const message =
wygrani === 1

? `

🎉 Gratulacje ${winnersText}

🏆 Wygrałeś:
**${nagroda}**

🎫 Zgłoś się na ticket INNE

`

: `

🎉 Gratulacje ${winnersText}

🏆 Wygraliście:
**${nagroda}**

🎫 Zgłoście się na ticket INNE

`;

await interaction.channel.send(message);
delete giveaways[msg.id];

}, duration);

return interaction.reply({

content:
"✅ Konkurs utworzony",

ephemeral: true

});

}
});





/* =========================
   BUTTONS
========================= */

client.on(
Events.InteractionCreate,
async interaction => {

if (!interaction.isButton()) return;

if (
interaction.customId ===
"giveaway_join"
) {

const giveaway =
giveaways[
interaction.message.id
];

if (!giveaway) {

return interaction.reply({

content:
"❌ Konkurs zakończony",

ephemeral: true

});

}

const already =
giveaway.users.includes(
interaction.user.id
);

if (already) {

giveaway.users =
giveaway.users.filter(
id =>
id !== interaction.user.id
);

return interaction.reply({

content:
"❌ Opuściłeś konkurs",

ephemeral: true

});

}

giveaway.users.push(
interaction.user.id
);

return interaction.reply({

content:
"✅ Dołączyłeś do konkursu",

ephemeral: true

});

}

});

};
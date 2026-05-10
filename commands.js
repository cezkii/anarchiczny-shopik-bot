const {
Events,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
SlashCommandBuilder,
REST,
Routes
} = require("discord.js");

module.exports = (client, TOKEN) => {

const CLIENT_ID = "1502359226532499659";
const GUILD_ID = "1502353179722121377";

const CHANNEL_ZAPRO =
"1502650236324024421";

const CHANNEL_GIVEAWAY =
"1502654052318707782";

const HELPER_ROLE =
"1502601578400579604";

let invites = {};
let giveaways = {};

client.once(
Events.ClientReady,
async () => {

const commands = [

new SlashCommandBuilder()

.setName("zapro")

.setDescription(
"Stwórz reklamę"
),

new SlashCommandBuilder()

.setName("konkurs")

.setDescription(
"Stwórz konkurs"
)

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
"Komendy załadowane"
);

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

if (
interaction.channel.id !==
CHANNEL_ZAPRO
) {

return interaction.reply({

content:
"❌ Tej komendy można używać tylko na wyznaczonym kanale",

ephemeral: true

});

}

invites[
interaction.user.id
] =
(invites[
interaction.user.id
] || 0) + 1;

const embed =
new EmbedBuilder()

.setColor("Blue")

.setTitle(
"📨 NOWE ZAPROSZENIE"
)

.setDescription(`

👤 Użytkownik:
${interaction.user}

📈 Łączne zaproszenia:
${invites[
interaction.user.id
]}

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

if (
interaction.channel.id !==
CHANNEL_GIVEAWAY
) {

return interaction.reply({

content:
"❌ Konkursy można robić tylko na kanale giveaway",

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
"❌ Tylko helper może zrobić konkurs",

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
"join_giveaway"
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

🎊 Kliknij przycisk poniżej aby dołączyć

`);

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

};
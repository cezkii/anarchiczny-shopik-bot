const {
SlashCommandBuilder,
REST,
Routes,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
PermissionsBitField,
Events
} = require("discord.js");

module.exports = async (client, TOKEN) => {

const CLIENT_ID = "1502359226532499659";
const GUILD_ID = "1502353179722121377";

const GIVEAWAY_CHANNEL = "1502654052318707782";
const INVITE_CHANNEL = "1502650236324024421";

const HELPER_ROLE = "1502601578400579604";

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
.addStringOption(option =>
option
.setName("wymagania")
.setDescription("Wymagania")
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

console.log("Komendy gotowe");

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
`❌ Komenda działa tylko na <#${INVITE_CHANNEL}>`,

ephemeral: true

});

}

const invited =
interaction.member.joinedTimestamp
? Math.floor(Math.random() * 20)
: 0;

const embed =
new EmbedBuilder()

.setColor("Blue")

.setTitle("📨 ZAPROSZENIA")

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
interaction.commandName === "konkurs"
) {

if (
interaction.channel.id !== GIVEAWAY_CHANNEL
) {

return interaction.reply({

content:
`❌ Konkursy można robić tylko na <#${GIVEAWAY_CHANNEL}>`,

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
"❌ Nie masz permisji",

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

const wymagania =
interaction.options.getString(
"wymagania"
);

const row =
new ActionRowBuilder()

.addComponents(

new ButtonBuilder()

.setCustomId("giveaway_join")

.setLabel("🎉 WEŹ UDZIAŁ")

.setStyle(ButtonStyle.Success)

);

const embed =
new EmbedBuilder()

.setColor("Purple")

.setTitle("🎉 NOWY KONKURS")

.setDescription(`

🏆 Nagroda:
${nagroda}

👥 Wygrani:
${wygrani}

⏰ Czas:
${czas}

📋 Wymagania:
${wymagania}

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

}
);

client.on(
Events.InteractionCreate,
async interaction => {

if (!interaction.isButton()) return;

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

});

};
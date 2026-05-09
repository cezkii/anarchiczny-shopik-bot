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
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
    SlashCommandBuilder,
    REST,
    Routes
} = require("discord.js");

const ms = require("ms");
const db = require("./database");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;

const CHANNELS = {
    TICKETS: "1502358629402284234",
    LEGIT: "1502356815495692440",
    WELCOME: "1502652604973318376",
    PAYMENTS: "1502648184714039486",
    CLIENT: "1502649421136003132",
    INVITES: "1502650236324024421",
    DROP: "1502655319392915466",
    GIVEAWAY: "1502654052318707782"
};

const ROLES = {
    LIMIT50: "1502388117309755542",
    LIMIT100: "1502388253691744399",
    LIMIT200: "1502388290265944085",
    NOLIMIT: "1502388310394540092",
    TICKET: "1502363051003871282",
    CLIENT: "1502661344455823431",
    CLIENT250: "1502663222258307294",
    CLIENT200: "1502664307169689738",
    CLIENT500: "1502665546922197042",
    HELPER: "1502601578400579604",
    SKUP: "1502761459371737108"
};

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

async function removeCategory(category) {

    if (!category) return;

    if (category.children.cache.size <= 0) {

        await category.delete().catch(() => {});
    }
}

async function addSpent(userId, amount, guild) {

    let data = db.get(`spent_${userId}`);

    if (!data) {

        data = {
            total: 0,
            count: 0,
            last: 0
        };
    }

    data.total += amount;
    data.count += 1;
    data.last = amount;

    db.set(`spent_${userId}`, data);

    const member = await guild.members.fetch(userId).catch(() => null);

    if (!member) return;

    if (data.total >= 1) {
        member.roles.add(ROLES.CLIENT).catch(() => {});
    }

    if (data.total >= 200) {
        member.roles.add(ROLES.CLIENT200).catch(() => {});
    }

    if (data.total >= 250) {
        member.roles.add(ROLES.CLIENT250).catch(() => {});
    }

    if (data.total >= 500) {
        member.roles.add(ROLES.CLIENT500).catch(() => {});
    }
}

client.once("ready", async () => {

    console.log(`${client.user.tag} ONLINE`);

    const commands = [
        new SlashCommandBuilder()
            .setName("konkurs")
            .setDescription("Stwórz konkurs")
            .addStringOption(o =>
                o.setName("nagroda")
                .setDescription("Nagroda")
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName("czas")
                .setDescription("Np 1h")
                .setRequired(true)
            )
            .addIntegerOption(o =>
                o.setName("wygrani")
                .setDescription("Ilu wygranych")
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName("wymagania")
                .setDescription("Wymagania")
                .setRequired(true)
            )
    ];

    const rest = new REST({ version: "10" })
        .setToken(TOKEN);

    try {

        await rest.put(
            Routes.applicationCommands(client.user.id),
            {
                body: commands
            }
        );

    } catch (err) {
        console.log(err);
    }
});
client.once("ready", async () => {

    const ticketChannel =
        await client.channels.fetch(CHANNELS.TICKETS);

    const paymentChannel =
        await client.channels.fetch(CHANNELS.PAYMENTS);

    const clientPanel =
        await client.channels.fetch(CHANNELS.CLIENT);

    const dropChannel =
        await client.channels.fetch(CHANNELS.DROP);

    const ticketEmbed = new EmbedBuilder()
        .setColor("#1e2a38")
        .setTitle("ANARCHICZNY SHOPIK - TICKETY")
        .setDescription(`
Wybierz temat ticketu

💰 ZAKUP WALUTY
💵 SKUP
🆘 INNE
        `);

    const ticketRow = new ActionRowBuilder()
        .addComponents(

            new StringSelectMenuBuilder()
                .setCustomId("ticket_menu")
                .setPlaceholder("Wybierz temat")
                .addOptions([
                    {
                        label: "ZAKUP WALUTY",
                        value: "buy_money",
                        emoji: "💰"
                    },
                    {
                        label: "SKUP",
                        value: "sell_money",
                        emoji: "💵"
                    },
                    {
                        label: "INNE",
                        value: "other_help",
                        emoji: "🆘"
                    }
                ])
        );

    await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [ticketRow]
    });

    const paymentEmbed = new EmbedBuilder()
        .setColor("#1e2a38")
        .setTitle("💳 METODY PŁATNOŚCI ANARCHICZNEGO SHOPIKA 💳")
        .setDescription(`
🧾 PSC Z PARAGONEM ➜ 15% prowizji
🔐 PSC BEZ PARAGONU ➜ 20% prowizji
🔐 MY PSC ➜ 25% prowizji
📲 BLIK NA NR TEL ➜ 0% prowizji
🔢 KOD BLIK ➜ 10% prowizji
🔫 CS2 SKINS ➜ 40% prowizji
🅿️ PAYPAL ➜ 12% prowizji
        `);

    await paymentChannel.send({
        embeds: [paymentEmbed]
    });

    const clientEmbed = new EmbedBuilder()
        .setColor("#1e2a38")
        .setTitle("💸 SPRAWDŹ SWOJE WYDATKI")
        .setDescription(`
Kliknij przycisk poniżej aby zobaczyć
ile łącznie wydałeś na shopie.
        `);

    const clientRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("check_spent")
                .setLabel("SPRAWDŹ WYDATKI")
                .setStyle(ButtonStyle.Success)
        );

    await clientPanel.send({
        embeds: [clientEmbed],
        components: [clientRow]
    });

    const dropEmbed = new EmbedBuilder()
        .setColor("#1e2a38")
        .setTitle("🎁 DROP")
        .setDescription(`
Kliknij przycisk poniżej
aby wylosować nagrodę.
        `);

    const dropRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("drop_button")
                .setLabel("LOSUJ DROP")
                .setStyle(ButtonStyle.Success)
        );

    await dropChannel.send({
        embeds: [dropEmbed],
        components: [dropRow]
    });
});
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === "ticket_menu") {

            const existing =
                interaction.guild.channels.cache.find(
                    c =>
                        c.topic &&
                        c.topic.includes(interaction.user.id)
                );

            if (existing) {

                return interaction.reply({
                    content: `❌ Masz już ticket: ${existing}`,
                    ephemeral: true
                });
            }

            if (interaction.values[0] === "buy_money") {

                const methods =
                    new StringSelectMenuBuilder()
                        .setCustomId("payment_method")
                        .setPlaceholder("Wybierz metodę płatności")
                        .addOptions([
                            {
                                label: "BLIK NA NR TEL",
                                value: "BLIK NA NR TEL"
                            },
                            {
                                label: "KOD BLIK",
                                value: "KOD BLIK"
                            },
                            {
                                label: "PSC Z PARAGONEM",
                                value: "PSC Z PARAGONEM"
                            },
                            {
                                label: "PSC BEZ PARAGONU",
                                value: "PSC BEZ PARAGONU"
                            },
                            {
                                label: "MYPSC",
                                value: "MYPSC"
                            },
                            {
                                label: "CS2 SKINS",
                                value: "CS2 SKINS"
                            },
                            {
                                label: "PAYPAL",
                                value: "PAYPAL"
                            }
                        ]);

                return interaction.reply({
                    content: "💳 Wybierz metodę płatności",
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder()
                            .addComponents(methods)
                    ]
                });
            }

            if (interaction.values[0] === "sell_money") {

                const modal = new ModalBuilder()
                    .setCustomId("sell_modal")
                    .setTitle("SKUP");

                modal.addComponents(

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("sell_amount")
                            .setLabel("Ile sprzedajesz?")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("Np 500k")
                            .setRequired(true)
                    ),

                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("sell_payment")
                            .setLabel("Forma płatności")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder("Np PSC")
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }

            if (interaction.values[0] === "other_help") {

                const modal = new ModalBuilder()
                    .setCustomId("other_modal")
                    .setTitle("INNE");

                modal.addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("reason")
                            .setLabel("W jakiej sprawie?")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

                return interaction.showModal(modal);
            }
        }

        if (interaction.customId === "payment_method") {

            const payment = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`buy_${payment}`)
                .setTitle("ZAKUP WALUTY");

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("amount")
                        .setLabel("Za ile kupujesz?")
                        .setPlaceholder("Np 50")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
            );

            return interaction.showModal(modal);
        }
    }
});
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isModalSubmit()) {

        if (interaction.customId.startsWith("buy_")) {

            const payment =
                interaction.customId.replace("buy_", "");

            const amount =
                parseInt(
                    interaction.fields.getTextInputValue("amount")
                );

            let categoryName = "NO LIMIT";
            let rolePing = `<@&${ROLES.NOLIMIT}>`;

            if (amount >= 1 && amount <= 50) {

                categoryName = "LIMIT 50";

                rolePing =
`<@&${ROLES.LIMIT50}> <@&${ROLES.NOLIMIT}>`;
            }

            if (amount >= 51 && amount <= 100) {

                categoryName = "LIMIT 100";

                rolePing =
`<@&${ROLES.LIMIT100}> <@&${ROLES.NOLIMIT}>`;
            }

            if (amount >= 101 && amount <= 200) {

                categoryName = "LIMIT 200";

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

            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("NOWE ZAMÓWIENIE")
                .setDescription(`
Poczekaj na sprzedawcę.

Kupujący:
${interaction.user}

Kwota:
${amount} zł

Metoda:
${payment}
                `);

            const row = new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId("take_ticket")
                        .setLabel("PRZEJMIJ TICKET")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId("send_legit")
                        .setLabel("WYSTAW LEGITKĘ")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId("close_ticket")
                        .setLabel("ZAMKNIJ TICKET")
                        .setStyle(ButtonStyle.Danger)
                );

            await ticket.send({
                content: rolePing,
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: `✅ Ticket utworzony: ${ticket}`,
                ephemeral: true
            });
        }
    }
});
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isButton()) {

        if (interaction.customId === "take_ticket") {

            const buyerId =
                interaction.channel.topic.split("|")[0];

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
                        PermissionsBitField.Flags.SendMessages
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
                }

            ]);

            return interaction.reply({
                content:
`✅ Ticket przejęty przez ${interaction.user}`
            });
        }

        if (interaction.customId === "send_legit") {

            const split =
                interaction.channel.topic.split("|");

            const buyerId = split[0];
            const amount = split[1];
            const payment = split[2];

            const legit =
                await client.channels.fetch(
                    CHANNELS.LEGIT
                );

            const embed = new EmbedBuilder()
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

            await legit.send({
                embeds: [embed]
            });

            await addSpent(
                buyerId,
                Number(amount),
                interaction.guild
            );

            await interaction.reply({
                content:
"✅ Legitka została wystawiona"
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

        if (interaction.customId === "close_ticket") {

            if (
                !interaction.member.roles.cache.has(
                    ROLES.TICKET
                )
            ) {

                return interaction.reply({
                    content:
"❌ Nie możesz zamknąć ticketu",
                    ephemeral: true
                });
            }

            const category =
                interaction.channel.parent;

            await interaction.reply({
                content:
"🗑️ Ticket zostanie zamknięty"
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

        if (interaction.customId === "check_spent") {

            const data =
                db.get(`spent_${interaction.user.id}`);

            if (!data) {

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#1e2a38")
                            .setDescription(`
${interaction.user}

Nie masz jeszcze
żadnych wydatków.
                            `)
                    ],
                    ephemeral: true
                });
            }

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#1e2a38")
                        .setTitle("💸 WYDATKI")
                        .setDescription(`
Łączne wydatki:
${data.total} zł

Średnia zakupu:
${Math.floor(data.total / data.count)} zł

Ostatni wydatek:
${data.last} zł
                        `)
                ],
                ephemeral: true
            });
        }
    }
});

client.on("guildMemberAdd", async member => {

    const channel =
        member.guild.channels.cache.get(
            CHANNELS.WELCOME
        );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor("#1e2a38")
        .setDescription(`
${member}

Cieszymy się że dołączasz
na naszego shopa 🔥

Z itemami z shopika będziesz
mógł podbijać anarchię 🥳
        `);

    channel.send({
        embeds: [embed]
    });
});

client.login(TOKEN);
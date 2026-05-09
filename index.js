const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const TOKEN = process.env.TOKEN;

const db = require('./database');

const CHANNELS = {

    TICKETS:
        '1502358629402284234',

    LEGIT:
        '1502356815495692440',

    WELCOME:
        '1502652604973318376',

    METHODS:
        '1502648184714039486',

    CLIENT:
        '1502649421136003132'
};

const ROLES = {

    LIMIT50:
        '1502388117309755542',

    LIMIT100:
        '1502388253691744399',

    LIMIT200:
        '1502388290265944085',

    NOLIMIT:
        '1502388310394540092',

    TICKET:
        '1502363051003871282',

    CLIENT:
        '1502661344455823431',

    CLIENT250:
        '1502663222258307294',

    CLIENT200:
        '1502664307169689738',

    CLIENT500:
        '1502665546922197042'
};

async function getCategory(
    guild,
    name
) {

    let category =
        guild.channels.cache.find(
            c =>
                c.type ===
                ChannelType.GuildCategory &&
                c.name === name
        );

    if (!category) {

        category =
            await guild.channels.create({

                name,
                type:
                    ChannelType.GuildCategory
            });
    }

    return category;
}

async function addClientRoles(
    member,
    total
) {

    if (total >= 1) {

        await member.roles.add(
            ROLES.CLIENT
        ).catch(() => {});
    }

    if (total >= 200) {

        await member.roles.add(
            ROLES.CLIENT200
        ).catch(() => {});
    }

    if (total >= 250) {

        await member.roles.add(
            ROLES.CLIENT250
        ).catch(() => {});
    }

    if (total >= 500) {

        await member.roles.add(
            ROLES.CLIENT500
        ).catch(() => {});
    }
}

client.once(
    Events.ClientReady,
    async () => {

        console.log(
            `${client.user.tag} ONLINE`
        );

        const panel =
            await client.channels.fetch(
                CHANNELS.TICKETS
            );

        const methods =
            await client.channels.fetch(
                CHANNELS.METHODS
            );

        const clientPanel =
            await client.channels.fetch(
                CHANNELS.CLIENT
            );

        await panel.bulkDelete(10)
        .catch(() => {});

        await methods.bulkDelete(10)
        .catch(() => {});

        await clientPanel.bulkDelete(10)
        .catch(() => {});

        const embed =
            new EmbedBuilder()
            .setColor('#1b2330')
            .setTitle(
                'ANARCHICZNY SHOPIK - TICKETY'
            )
            .setDescription(
                'Wybierz temat ticketu'
            );

        const menu =
            new StringSelectMenuBuilder()
            .setCustomId('ticket_menu')
            .setPlaceholder(
                'Wybierz temat'
            )
            .addOptions([

                {
                    label:
                        'ZAKUP WALUTY',
                    value:
                        'buy_money',
                    emoji: '💰'
                },

                {
                    label:
                        'SKUP',
                    value:
                        'sell_money',
                    emoji: '💵'
                },

                {
                    label:
                        'INNE',
                    value:
                        'other',
                    emoji: '🆘'
                }
            ]);

        await panel.send({

            embeds: [embed],

            components: [
                new ActionRowBuilder()
                .addComponents(menu)
            ]
        });
        const methodsEmbed =
            new EmbedBuilder()
            .setColor('#1b2330')
            .setTitle(
                '💳 METODY PŁATNOŚCI ANARCHICZNEGO SHOPIKA 💳'
            )
            .setDescription(`
🧾 PSC Z PARAGONEM ➜ 15%

🔐 PSC BEZ PARAGONU ➜ 20%

🔐 MY PSC ➜ 25%

📲 BLIK NA NR TEL ➜ 0%

🔢 KOD BLIK ➜ 10%

🔫 CS2 SKINS ➜ 40%

🅿️ PAYPAL ➜ 12%
            `);

        await methods.send({
            embeds: [methodsEmbed]
        });

        const clientEmbed =
            new EmbedBuilder()
            .setColor('#1b2330')
            .setTitle(
                'SPRAWDŹ SWOJE WYDATKI'
            )
            .setDescription(
                'Kliknij przycisk poniżej aby zobaczyć swoje wydatki.'
            );

        const clientButton =
            new ButtonBuilder()
            .setCustomId(
                'check_spent'
            )
            .setLabel(
                'SPRAWDŹ WYDATKI'
            )
            .setStyle(
                ButtonStyle.Success
            );

        await clientPanel.send({

            embeds: [clientEmbed],

            components: [
                new ActionRowBuilder()
                .addComponents(clientButton)
            ]
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
                'ticket_menu'
            ) {

                const existing =
                    interaction.guild.channels.cache.find(
                        c =>
                            c.topic ===
                            interaction.user.id
                    );

                if (existing) {

                    return interaction.reply({

                        content:
                            'Masz już otwarty ticket.',

                        ephemeral: true
                    });
                }

                if (
                    interaction.values[0] ===
                    'buy_money'
                ) {

                    const menu =
                        new StringSelectMenuBuilder()

                        .setCustomId(
                            'payment_method'
                        )

                        .setPlaceholder(
                            'Wybierz metodę płatności'
                        )

                        .addOptions([

                            {
                                label:
                                    'BLIK NA NR TEL',
                                value:
                                    'BLIK NA NR TEL'
                            },

                            {
                                label:
                                    'KOD BLIK',
                                value:
                                    'KOD BLIK'
                            },

                            {
                                label:
                                    'PSC Z PARAGONEM',
                                value:
                                    'PSC Z PARAGONEM'
                            },

                            {
                                label:
                                    'PSC BEZ PARAGONU',
                                value:
                                    'PSC BEZ PARAGONU'
                            },

                            {
                                label:
                                    'MYPSC',
                                value:
                                    'MYPSC'
                            },

                            {
                                label:
                                    'CS2 SKINS',
                                value:
                                    'CS2 SKINS'
                            },

                            {
                                label:
                                    'PAYPAL',
                                value:
                                    'PAYPAL'
                            }
                        ]);

                    return interaction.reply({

                        content:
                            'Wybierz metodę płatności.',

                        ephemeral: true,

                        components: [

                            new ActionRowBuilder()
                            .addComponents(menu)
                        ]
                    });
                }
                if (
                    interaction.values[0] ===
                    'sell_money'
                ) {

                    const modal =
                        new ModalBuilder()
                        .setCustomId(
                            'sell_modal'
                        )
                        .setTitle('SKUP');

                    const amount =
                        new TextInputBuilder()

                        .setCustomId(
                            'sell_amount'
                        )

                        .setLabel(
                            'Ile sprzedajesz?'
                        )

                        .setPlaceholder(
                            'Np. 500k'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(true);

                    const payment =
                        new TextInputBuilder()

                        .setCustomId(
                            'sell_payment'
                        )

                        .setLabel(
                            'Forma płatności'
                        )

                        .setPlaceholder(
                            'Np. PSC'
                        )

                        .setStyle(
                            TextInputStyle.Short
                        )

                        .setRequired(true);

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

                if (
                    interaction.values[0] ===
                    'other'
                ) {

                    const modal =
                        new ModalBuilder()
                        .setCustomId(
                            'other_modal'
                        )
                        .setTitle('INNE');

                    const reason =
                        new TextInputBuilder()

                        .setCustomId(
                            'other_reason'
                        )

                        .setLabel(
                            'W jakiej sprawie?'
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

            if (
                interaction.customId ===
                'payment_method'
            ) {

                const payment =
                    interaction.values[0];

                const modal =
                    new ModalBuilder()

                    .setCustomId(
                        `buy_${payment}`
                    )

                    .setTitle(
                        'ZAKUP WALUTY'
                    );

                const amount =
                    new TextInputBuilder()

                    .setCustomId(
                        'buy_amount'
                    )

                    .setLabel(
                        'Za ile kupujesz?'
                    )

                    .setPlaceholder(
                        'Np. 50'
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
        }

        if (
            interaction.isModalSubmit()
        ) {

            if (
                interaction.customId.startsWith(
                    'buy_'
                )
            ) {

                const amount =
                    parseInt(
                        interaction.fields.getTextInputValue(
                            'buy_amount'
                        )
                    );

                const payment =
                    interaction.customId.replace(
                        'buy_',
                        ''
                    );

                let categoryName =
                    'NO LIMIT';

                let ping =
                    `<@&${ROLES.NOLIMIT}>`;

                if (
                    amount >= 1 &&
                    amount <= 50
                ) {

                    categoryName =
                        'LIMIT 50';

                    ping =
`<@&${ROLES.LIMIT50}> <@&${ROLES.NOLIMIT}>`;
                }

                if (
                    amount >= 51 &&
                    amount <= 100
                ) {

                    categoryName =
                        'LIMIT 100';

                    ping =
`<@&${ROLES.LIMIT100}> <@&${ROLES.NOLIMIT}>`;
                }

                if (
                    amount >= 101 &&
                    amount <= 200
                ) {

                    categoryName =
                        'LIMIT 200';

                    ping =
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
                                    PermissionsBitField
                                    .Flags
                                    .ViewChannel
                                ]
                            },

                            {
                                id:
                                    interaction.user.id,

                                allow: [
                                    PermissionsBitField
                                    .Flags
                                    .ViewChannel,

                                    PermissionsBitField
                                    .Flags
                                    .SendMessages
                                ]
                            },

                            {
                                id:
                                    ROLES.TICKET,

                                allow: [
                                    PermissionsBitField
                                    .Flags
                                    .ViewChannel
                                ]
                            },

                            {
                                id:
                                    ROLES.LIMIT50,

                                allow: [
                                    PermissionsBitField
                                    .Flags
                                    .ViewChannel
                                ]
                            },

                            {
                                id:
                                    ROLES.LIMIT100,

                                allow: [
                                    PermissionsBitField
                                    .Flags
                                    .ViewChannel
                                ]
                            },

                            {
                                id:
                                    ROLES.LIMIT200,

                                allow: [
                                    PermissionsBitField
                                    .Flags
                                    .ViewChannel
                                ]
                            },

                            {
                                id:
                                    ROLES.NOLIMIT,

                                allow: [
                                    PermissionsBitField
                                    .Flags
                                    .ViewChannel
                                ]
                            }
                        ]
                    });

                const embed =
                    new EmbedBuilder()

                    .setColor('Green')

                    .setTitle(
                        'NOWE ZAMÓWIENIE'
                    )

                    .setDescription(`
Poczekaj na sprzedawcę.

Kupujący:
${interaction.user}

Kwota:
${amount}zł

Metoda:
${payment}
                    `);

                const row =
                    new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                        .setCustomId(
                            'take_ticket'
                        )
                        .setLabel(
                            'PRZEJMIJ TICKET'
                        )
                        .setStyle(
                            ButtonStyle.Success
                        ),

                        new ButtonBuilder()
                        .setCustomId(
                            'send_legit'
                        )
                        .setLabel(
                            'WYSTAW LEGITKĘ'
                        )
                        .setStyle(
                            ButtonStyle.Success
                        ),

                        new ButtonBuilder()
                        .setCustomId(
                            'close_ticket'
                        )
                        .setLabel(
                            'ZAMKNIJ TICKET'
                        )
                        .setStyle(
                            ButtonStyle.Danger
                        )
                    );

                await channel.send({

                    content: ping,

                    embeds: [embed],

                    components: [row]
                });

                return interaction.reply({

                    content:
`✅ Ticket utworzony: ${channel}`,

                    ephemeral: true
                });
            }

            if (
                interaction.customId ===
                'sell_modal'
            ) {

                return interaction.reply({

                    content:
'✅ System skupu będzie niżej.',

                    ephemeral: true
                });
            }

            if (
                interaction.customId ===
                'other_modal'
            ) {

                return interaction.reply({

                    content:
'✅ System INNE będzie niżej.',

                    ephemeral: true
                });
            }
        }

        if (
            interaction.isButton()
        ) {

            if (
                interaction.customId ===
                'take_ticket'
            ) {

                const [
                    buyerId,
                    amount,
                    payment
                ] =
                    interaction.channel.topic
                    .split('|');
client.on("guildMemberAdd", async member => {
    const channel = member.guild.channels.cache.get(CHANNELS.WELCOME);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor("#1e2a38")
        .setTitle("🎉 NOWY UŻYTKOWNIK")
        .setDescription(`
${member}

Cieszymy się że dołączasz na naszego shopa 🔥

Z itemami z shopika będziesz mógł podbijać anarchię 🥳
        `)
        .setTimestamp();

    channel.send({
        embeds: [embed]
    });
});

client.on("messageCreate", async message => {

    if (message.author.bot) return;

    if (message.channel.id === CHANNELS.INVITES) {

        if (message.content !== "/zapro") {

            await message.delete().catch(() => {});
            return;
        }

        const data = db.get(`invites_${message.author.id}`) || {
            invited: 0,
            leaves: 0,
            legit: 0
        };

        const embed = new EmbedBuilder()
            .setColor("#1e2a38")
            .setTitle("📨 STATYSTYKI ZAPROSZEŃ")
            .setDescription(`
👤 Użytkownik: ${message.author}

📨 Zapro:
${data.invited}

📤 Leaves:
${data.leaves}

✅ Legit Invites:
${data.legit}
            `);

        return message.reply({
            embeds: [embed]
        });
    }
});

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "konkurs") {

        if (!interaction.member.roles.cache.has(ROLES.HELPER)) {

            return interaction.reply({
                content: "❌ Nie masz permisji.",
                ephemeral: true
            });
        }

        const nagroda =
            interaction.options.getString("nagroda");

        const czas =
            interaction.options.getString("czas");

        const wygrani =
            interaction.options.getInteger("wygrani");

        const wymagania =
            interaction.options.getString("wymagania");

        const end =
            Date.now() + ms(czas);

        const embed = new EmbedBuilder()
            .setColor("#1e2a38")
            .setTitle("🎉 NOWY KONKURS")
            .setDescription(`
🎁 Nagroda:
${nagroda}

👥 Wygrani:
${wygrani}

📋 Wymagania:
${wymagania}

⏰ Koniec:
<t:${Math.floor(end / 1000)}:R>
            `);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("join_giveaway")
                    .setLabel("🎉 DOŁĄCZ")
                    .setStyle(ButtonStyle.Success)
            );

        const msg = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        db.set(`giveaway_${msg.id}`, {
            users: [],
            winners: wygrani,
            reward: nagroda,
            end
        });

        interaction.reply({
            content: "✅ Konkurs utworzony.",
            ephemeral: true
        });

        setTimeout(async () => {

            const data = db.get(`giveaway_${msg.id}`);

            if (!data) return;

            if (data.users.length <= 0) {

                interaction.channel.send(
                    "❌ Nikt nie wziął udziału."
                );

                return;
            }

            const winners =
                data.users
                    .sort(() => Math.random() - 0.5)
                    .slice(0, data.winners);

            interaction.channel.send(`
🎉 Konkurs zakończony!

🏆 Wygrani:
${winners.map(x => `<@${x}>`).join(", ")}

🎁 Nagroda:
${data.reward}
            `);

            db.delete(`giveaway_${msg.id}`);

        }, ms(czas));
    }
});

client.login(TOKEN);
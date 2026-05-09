const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ChannelType,
    PermissionsBitField,
    ButtonBuilder,
    ButtonStyle,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    SlashCommandBuilder
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites
    ]
});

const TOKEN = process.env.TOKEN;
const db = require('./database');

const CHANNELS = {
    TICKETS: '1502358629402284234',
    LEGIT: '1502356815495692440',
    WELCOME: '1502652604973318376',
    PAYMENTS: '1502648184714039486',
    CLIENT_PANEL: '1502649421136003132',
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

const paymentMethods = [
    'BLIK NA NR TEL',
    'KOD BLIK',
    'PSC Z PARAGONEM',
    'PSC BEZ PARAGONU',
    'MYPSC',
    'CS2 SKINS',
    'PAYPAL'
];

async function getOrCreateCategory(guild, name) {

    let category = guild.channels.cache.find(c =>
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

async function removeCategoryIfEmpty(category) {

    if (!category) return;

    if (category.children.cache.size <= 0) {

        await category.delete().catch(() => {});
    }
}

function getLimitData(amount) {

    if (amount >= 1 && amount <= 50) {

        return {
            category: 'LIMIT 50',
            roles: [ROLES.LIMIT50, ROLES.NOLIMIT]
        };
    }

    if (amount >= 51 && amount <= 100) {

        return {
            category: 'LIMIT 100',
            roles: [ROLES.LIMIT100, ROLES.NOLIMIT]
        };
    }

    if (amount >= 101 && amount <= 200) {

        return {
            category: 'LIMIT 200',
            roles: [ROLES.LIMIT200, ROLES.NOLIMIT]
        };
    }

    return {
        category: 'NO LIMIT',
        roles: [ROLES.NOLIMIT]
    };
}

async function hasOpenTicket(guild, userId) {

    const tickets = guild.channels.cache.filter(c =>
        c.type === ChannelType.GuildText &&
        c.topic &&
        c.topic.startsWith(userId)
    );

    return tickets.size > 0;
}

async function giveClientRoles(member, totalSpent) {

    if (totalSpent >= 1) {

        await member.roles.add(ROLES.CLIENT)
        .catch(() => {});
    }

    if (totalSpent >= 200) {

        await member.roles.add(ROLES.CLIENT200)
        .catch(() => {});
    }

    if (totalSpent >= 250) {

        await member.roles.add(ROLES.CLIENT250)
        .catch(() => {});
    }

    if (totalSpent >= 500) {

        await member.roles.add(ROLES.CLIENT500)
        .catch(() => {});
    }
}

client.once('ready', async () => {

    console.log(`${client.user.tag} ONLINE`);

    const guild = client.guilds.cache.first();

    const commands = [

        new SlashCommandBuilder()
            .setName('zapro')
            .setDescription('Sprawdź zaproszenia'),

        new SlashCommandBuilder()
            .setName('konkurs')
            .setDescription('Stwórz konkurs')
            .addStringOption(o =>
                o.setName('nagroda')
                .setDescription('Nagroda')
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName('czas')
                .setDescription('Np 24h')
                .setRequired(true)
            )
            .addIntegerOption(o =>
                o.setName('wygrani')
                .setDescription('Ilość wygranych')
                .setRequired(true)
            )
            .addStringOption(o =>
                o.setName('wymagania')
                .setDescription('Wymagania')
                .setRequired(true)
            )

    ];

    await guild.commands.set(commands);

    const ticketChannel =
        await client.channels.fetch(CHANNELS.TICKETS);

    const paymentChannel =
        await client.channels.fetch(CHANNELS.PAYMENTS);

    const clientPanel =
        await client.channels.fetch(CHANNELS.CLIENT_PANEL);

    const dropChannel =
        await client.channels.fetch(CHANNELS.DROP);

    await ticketChannel.bulkDelete(20).catch(() => {});
    await paymentChannel.bulkDelete(20).catch(() => {});
    await clientPanel.bulkDelete(20).catch(() => {});
    await dropChannel.bulkDelete(20).catch(() => {});

    const ticketEmbed = new EmbedBuilder()
        .setColor('#1b2330')
        .setTitle('ANARCHICZNY SHOPIK - TICKETY')
        .setDescription('Wybierz temat ticketu');

    const ticketMenu =
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
        ]);

    await ticketChannel.send({
        embeds: [ticketEmbed],
        components: [
            new ActionRowBuilder()
            .addComponents(ticketMenu)
        ]
    });

    const paymentEmbed = new EmbedBuilder()
        .setColor('#1b2330')
        .setTitle('💳 METODY PŁATNOŚCI ANARCHICZNEGO SHOPIKA 💳')
        .setDescription(`
🧾 PSC Z PARAGONEM ➜ 15%

🔐 PSC BEZ PARAGONU ➜ 20%

🔐 MY PSC ➜ 25%

📲 BLIK NA NR TEL ➜ 0%

🔢 KOD BLIK ➜ 10%

🔫 CS2 SKINS ➜ 40%

🅿️ PAYPAL ➜ 12%
        `);

    await paymentChannel.send({
        embeds: [paymentEmbed]
    });

    const spentEmbed = new EmbedBuilder()
        .setColor('#1b2330')
        .setTitle('PANEL KLIENTA')
        .setDescription(
            'Kliknij przycisk poniżej aby zobaczyć ile łącznie wydałeś na shopie'
        );

    const spentButton =
        new ButtonBuilder()
        .setCustomId('check_spent')
        .setLabel('SPRAWDŹ SWOJE WYDATKI')
        .setStyle(ButtonStyle.Primary);

    await clientPanel.send({
        embeds: [spentEmbed],
        components: [
            new ActionRowBuilder()
            .addComponents(spentButton)
        ]
    });

    const dropEmbed = new EmbedBuilder()
        .setColor('#1b2330')
        .setTitle('DROP')
        .setDescription(
            'Kliknij przycisk poniżej aby wylosować nagrodę'
        );

    const dropButton =
        new ButtonBuilder()
        .setCustomId('drop_button')
        .setLabel('LOSUJ DROP')
        .setStyle(ButtonStyle.Success);

    await dropChannel.send({
        embeds: [dropEmbed],
        components: [
            new ActionRowBuilder()
            .addComponents(dropButton)
        ]
    });

});
client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'ticket_menu') {

            const already =
                await hasOpenTicket(
                    interaction.guild,
                    interaction.user.id
                );

            if (already) {

                return interaction.reply({
                    content: 'Masz już otwarty ticket.',
                    ephemeral: true
                });
            }

            if (interaction.values[0] === 'buy_money') {

                const menu =
                    new StringSelectMenuBuilder()
                    .setCustomId('payment_select')
                    .setPlaceholder('Wybierz metodę płatności');

                paymentMethods.forEach(method => {

                    menu.addOptions({
                        label: method,
                        value: method
                    });

                });

                return interaction.reply({
                    content: 'Wybierz metodę płatności',
                    ephemeral: true,
                    components: [
                        new ActionRowBuilder()
                        .addComponents(menu)
                    ]
                });
            }

            if (interaction.values[0] === 'sell_money') {

                const modal = new ModalBuilder()
                    .setCustomId('sell_ticket')
                    .setTitle('SKUP');

                const amount =
                    new TextInputBuilder()
                    .setCustomId('sell_amount')
                    .setLabel('Ile sprzedajesz?')
                    .setPlaceholder('Np 500k')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const payment =
                    new TextInputBuilder()
                    .setCustomId('sell_payment')
                    .setLabel('Forma płatności')
                    .setPlaceholder('Np PSC')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                modal.addComponents(
                    new ActionRowBuilder()
                    .addComponents(amount),

                    new ActionRowBuilder()
                    .addComponents(payment)
                );

                return interaction.showModal(modal);
            }

            if (interaction.values[0] === 'other_help') {

                const modal = new ModalBuilder()
                    .setCustomId('other_ticket')
                    .setTitle('INNE');

                const reason =
                    new TextInputBuilder()
                    .setCustomId('other_reason')
                    .setLabel('W jakiej sprawie?')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph);

                modal.addComponents(
                    new ActionRowBuilder()
                    .addComponents(reason)
                );

                return interaction.showModal(modal);
            }
        }

        if (interaction.customId === 'payment_select') {

            const payment =
                interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`buy_${payment}`)
                .setTitle('ZAKUP WALUTY');

            const amount =
                new TextInputBuilder()
                .setCustomId('buy_amount')
                .setLabel('Za ile kupujesz?')
                .setPlaceholder('Np 25')
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            modal.addComponents(
                new ActionRowBuilder()
                .addComponents(amount)
            );

            return interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {

        if (interaction.customId.startsWith('buy_')) {

            const payment =
                interaction.customId.replace('buy_', '');

            const amount =
                Number(
                    interaction.fields.getTextInputValue(
                        'buy_amount'
                    )
                );

            if (isNaN(amount)) {

                return interaction.reply({
                    content: 'Podaj poprawną kwotę.',
                    ephemeral: true
                });
            }

            const data =
                getLimitData(amount);

            const category =
                await getOrCreateCategory(
                    interaction.guild,
                    data.category
                );

            const overwrites = [

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
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                },

                {
                    id: ROLES.TICKET,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }

            ];

            data.roles.forEach(role => {

                overwrites.push({
                    id: role,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel
                    ]
                });

            });

            const channel =
                await interaction.guild.channels.create({

                    name:
                        `zakup-${interaction.user.username}`,

                    type: ChannelType.GuildText,

                    parent: category.id,

                    topic:
                        `${interaction.user.id}|${amount}|${payment}`,

                    permissionOverwrites: overwrites
                });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('NOWE ZAMÓWIENIE')
                .setDescription(`
Poczekaj na sprzedawcę.

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
                    .setCustomId('take_ticket')
                    .setLabel('PRZEJMIJ TICKET')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('sold_ticket')
                    .setLabel('SPRZEDANE')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('ZAMKNIJ TICKET')
                    .setStyle(ButtonStyle.Danger)

                );

            const pingRoles =
                data.roles.map(r => `<@&${r}>`).join(' ');

            await channel.send({
                content: pingRoles,
                embeds: [embed],
                components: [buttons]
            });

            return interaction.reply({
                content: `Ticket utworzony: ${channel}`,
                ephemeral: true
            });
        }
        if (interaction.customId === 'sell_ticket') {

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

            const channel =
                await interaction.guild.channels.create({

                    name:
                        `skup-${interaction.user.username}`,

                    type: ChannelType.GuildText,

                    parent: category.id,

                    topic:
                        `${interaction.user.id}|0|SKUP`,

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
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
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

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('SKUP')
                .setDescription(`
Sprzedający:
${interaction.user}

Kwota:
${amount}

Płatność:
${payment}
                `);

            const buttons =
                new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                    .setCustomId('take_ticket')
                    .setLabel('PRZEJMIJ TICKET')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('ZAMKNIJ TICKET')
                    .setStyle(ButtonStyle.Danger)

                );

            await channel.send({
                content: `<@&${ROLES.SKUP}>`,
                embeds: [embed],
                components: [buttons]
            });

            return interaction.reply({
                content: `Ticket utworzony: ${channel}`,
                ephemeral: true
            });
        }

        if (interaction.customId === 'other_ticket') {

            const reason =
                interaction.fields.getTextInputValue(
                    'other_reason'
                );

            const category =
                await getOrCreateCategory(
                    interaction.guild,
                    'INNE'
                );

            const channel =
                await interaction.guild.channels.create({

                    name:
                        `pomoc-${interaction.user.username}`,

                    type: ChannelType.GuildText,

                    parent: category.id,

                    topic:
                        `${interaction.user.id}|0|POMOC`,

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
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory
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

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('POMOC')
                .setDescription(`
Użytkownik:
${interaction.user}

Powód:
${reason}
                `);

            const buttons =
                new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                    .setCustomId('take_ticket')
                    .setLabel('PRZEJMIJ TICKET')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('ZAMKNIJ TICKET')
                    .setStyle(ButtonStyle.Danger)

                );

            await channel.send({
                content: `<@&${ROLES.HELPER}>`,
                embeds: [embed],
                components: [buttons]
            });

            return interaction.reply({
                content: `Ticket utworzony: ${channel}`,
                ephemeral: true
            });
        }
    }

    if (interaction.isButton()) {

        if (interaction.customId === 'take_ticket') {

            const topic =
                interaction.channel.topic.split('|');

            const buyerId = topic[0];

            const amount = topic[1];

            const payment = topic[2];

            const overwrites = [

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
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                }

            ];

            await interaction.channel.permissionOverwrites.set(
                overwrites
            );

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('TICKET PRZEJĘTY')
                .setDescription(`
Kupujący:
<@${buyerId}>

Sprzedawca:
${interaction.user}

Kwota:
${amount}

Metoda:
${payment}
                `);

            return interaction.reply({
                embeds: [embed]
            });
        }
        if (interaction.customId === 'sold_ticket') {

            const topic =
                interaction.channel.topic.split('|');

            const buyerId = topic[0];

            const amount =
                Number(topic[1]);

            const payment = topic[2];

            const legitChannel =
                await client.channels.fetch(
                    CHANNELS.LEGIT
                );

            const buyer =
                await interaction.guild.members.fetch(
                    buyerId
                ).catch(() => null);

            if (!buyer) {

                return interaction.reply({
                    content: 'Nie znaleziono kupującego.',
                    ephemeral: true
                });
            }

            let spent =
                db.get(`spent_${buyerId}`) || 0;

            spent += amount;

            db.set(`spent_${buyerId}`, spent);

            await giveClientRoles(
                buyer,
                spent
            );

            const legitEmbed =
                new EmbedBuilder()
                .setColor('Green')
                .setTitle('NOWA TRANSAKCJA')
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
                embeds: [legitEmbed]
            });

            await interaction.reply({
                content:
                    'Legitka wystawiona i ticket zostanie zamknięty.'
            });

            const category =
                interaction.channel.parent;

            setTimeout(async () => {

                await interaction.channel.delete()
                .catch(() => {});

                if (
                    category &&
                    category.children.cache.size <= 1
                ) {

                    await category.delete()
                    .catch(() => {});
                }

            }, 3000);
        }

        if (interaction.customId === 'close_ticket') {

            const member =
                interaction.member;

            const allowed =
                member.roles.cache.has(ROLES.TICKET) ||
                member.roles.cache.has(ROLES.HELPER) ||
                member.roles.cache.has(ROLES.SKUP) ||
                member.roles.cache.has(ROLES.NOLIMIT) ||
                member.roles.cache.has(ROLES.LIMIT50) ||
                member.roles.cache.has(ROLES.LIMIT100) ||
                member.roles.cache.has(ROLES.LIMIT200);

            if (!allowed) {

                return interaction.reply({
                    content:
                        'Nie możesz zamknąć tego ticketu.',
                    ephemeral: true
                });
            }

            const category =
                interaction.channel.parent;

            await interaction.reply({
                content:
                    'Ticket zostanie zamknięty.'
            });

            setTimeout(async () => {

                await interaction.channel.delete()
                .catch(() => {});

                if (
                    category &&
                    category.children.cache.size <= 1
                ) {

                    await category.delete()
                    .catch(() => {});
                }

            }, 3000);
        }

        if (interaction.customId === 'check_spent') {

            const spent =
                db.get(
                    `spent_${interaction.user.id}`
                ) || 0;

            let message =
                `Łączne wydatki: ${spent} zł`;

            if (spent <= 0) {

                message =
                    'Nie masz jeszcze żadnych wydatków na naszym shopie.';
            }

            const embed =
                new EmbedBuilder()
                .setColor('#1b2330')
                .setTitle('PANEL KLIENTA')
                .setDescription(`
${interaction.user}

${message}
                `);

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        if (interaction.customId === 'drop_button') {

            const cooldown =
                db.get(
                    `drop_${interaction.user.id}`
                );

            if (
                cooldown &&
                Date.now() < cooldown
            ) {

                return interaction.reply({
                    content:
                        'Spróbuj ponownie za 3 godziny.',
                    ephemeral: true
                });
            }

            db.set(
                `drop_${interaction.user.id}`,
                Date.now() + 10800000
            );

            const chance =
                Math.random() * 100;

            let reward = null;

            if (chance <= 0.01) {

                reward = '100 TYSIĘCY';
            }

            else if (chance <= 1) {

                reward = 'BONUS 10%';
            }

            else if (chance <= 2) {

                reward = 'BONUS 5%';
            }

            if (!reward) {

                return interaction.reply({
                    content:
                        'Niestety tym razem nic nie trafiłeś. Spróbuj za 3 godziny.',
                    ephemeral: true
                });
            }

            const embed =
                new EmbedBuilder()
                .setColor('Green')
                .setTitle('GRATULACJE')
                .setDescription(`
${interaction.user}

Wygrałeś:
${reward}
                `);

            return interaction.reply({
                embeds: [embed]
            });
        }

        if (
            interaction.customId.startsWith(
                'join_giveaway_'
            )
        ) {

            return interaction.reply({
                content:
                    'Dołączyłeś do konkursu.',
                ephemeral: true
            });
        }
    }
});
client.on(
    Events.GuildMemberAdd,
    async member => {

        const channel =
            member.guild.channels.cache.get(
                CHANNELS.WELCOME
            );

        if (!channel) return;

        const embed =
            new EmbedBuilder()
            .setColor('#1b2330')
            .setTitle('NOWY UŻYTKOWNIK')
            .setDescription(`
${member}

Cieszymy się że dołączasz na naszego shopa 🔥

Z itemami z shopika będziesz mógł podbijać anarchię 🥳
            `)
            .setTimestamp();

        await channel.send({
            embeds: [embed]
        });
    }
);

client.on(
    Events.InteractionCreate,
    async interaction => {

        if (!interaction.isChatInputCommand())
            return;

        if (interaction.commandName === 'zapro') {

            if (
                interaction.channel.id !==
                CHANNELS.INVITES
            ) {

                return interaction.reply({
                    content:
                        'Tej komendy używaj na kanale zaproszeń.',
                    ephemeral: true
                });
            }

            const invites =
                db.get(
                    `invites_${interaction.user.id}`
                ) || 0;

            const leaves =
                db.get(
                    `leaves_${interaction.user.id}`
                ) || 0;

            const legit =
                db.get(
                    `legit_${interaction.user.id}`
                ) || 0;

            const embed =
                new EmbedBuilder()
                .setColor('#1b2330')
                .setTitle('ZAPROSZENIA')
                .setDescription(`
${interaction.user}

zapro ➜ ${invites}

leaves ➜ ${leaves}

legit invites ➜ ${legit}
                `);

            return interaction.reply({
                embeds: [embed]
            });
        }

        if (interaction.commandName === 'konkurs') {

            if (
                !interaction.member.roles.cache.has(
                    ROLES.HELPER
                )
            ) {

                return interaction.reply({
                    content:
                        'Tylko helper może tworzyć konkursy.',
                    ephemeral: true
                });
            }

            const reward =
                interaction.options.getString(
                    'nagroda'
                );

            const winners =
                interaction.options.getInteger(
                    'wygrani'
                );

            const time =
                interaction.options.getString(
                    'czas'
                );

            const requirements =
                interaction.options.getString(
                    'wymagania'
                );

            const giveawayId =
                Date.now();

            const embed =
                new EmbedBuilder()
                .setColor('#1b2330')
                .setTitle('KONKURS')
                .setDescription(`
🎁 Nagroda:
${reward}

🏆 Wygrani:
${winners}

⏰ Czas:
${time}

📋 Wymagania:
${requirements}
                `);

            const button =
                new ButtonBuilder()
                .setCustomId(
                    `join_giveaway_${giveawayId}`
                )
                .setLabel('DOŁĄCZ')
                .setStyle(ButtonStyle.Success);

            const channel =
                interaction.guild.channels.cache.get(
                    CHANNELS.GIVEAWAYS
                );

            await channel.send({
                embeds: [embed],
                components: [
                    new ActionRowBuilder()
                    .addComponents(button)
                ]
            });

            return interaction.reply({
                content:
                    'Konkurs został utworzony.',
                ephemeral: true
            });
        }
    }
);

client.on(
    Events.MessageCreate,
    async message => {

        if (message.author.bot)
            return;

        if (
            message.channel.id ===
            CHANNELS.INVITES
        ) {

            if (
                !message.content.startsWith('/zapro')
            ) {

                await message.delete()
                .catch(() => {});
            }
        }
    }
);

client.login(TOKEN);
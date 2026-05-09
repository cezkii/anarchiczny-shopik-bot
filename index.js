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
    TextInputStyle
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.TOKEN;
const db = require('./database');
const PANEL_CHANNEL = '1502358629402284234';
const LEGIT_CHANNEL = '1502356815495692440';

const ROLES = {
    LIMIT50: '1502388117309755542',
    LIMIT100: '1502388253691744399',
    LIMIT200: '1502388290265944085',
    NOLIMIT: '1502388310394540092',
    TICKET: '1502363051003871282',
    HELPER: '1502601578400579604'
};

async function getOrCreateCategory(guild, name) {

    let category = guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory
        && c.name === name
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

client.once('ready', async () => {

    console.log(`${client.user.tag} ONLINE`);

    const channel = await client.channels.fetch(PANEL_CHANNEL);

    const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle('ANARCHICZNY SHOPIK - TICKETY')
        .setDescription('Wybierz temat ticketu');

    const menu = new StringSelectMenuBuilder()
        .setCustomId('main_menu')
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

    const row = new ActionRowBuilder()
        .addComponents(menu);

    await channel.send({
        embeds: [embed],
        components: [row]
    });

});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'main_menu') {

            if (interaction.values[0] === 'buy_money') {

                const methods = new StringSelectMenuBuilder()
                    .setCustomId('payment_method')
                    .setPlaceholder('Wybierz metodę płatności')
                    .addOptions([
                        {
                            label: 'BLIK NA NR TEL',
                            value: 'BLIK NA NR TEL'
                        },
                        {
                            label: 'KOD BLIK',
                            value: 'KOD BLIK'
                        },
                        {
                            label: 'PSC Z PARAGONEM',
                            value: 'PSC Z PARAGONEM'
                        },
                        {
                            label: 'PSC BEZ PARAGONU',
                            value: 'PSC BEZ PARAGONU'
                        },
                        {
                            label: 'MYPSC',
                            value: 'MYPSC'
                        },
                        {
                            label: 'CS2 SKINS',
                            value: 'CS2 SKINS'
                        },
                        {
                            label: 'PAYPAL',
                            value: 'PAYPAL'
                        }
                    ]);

                const row = new ActionRowBuilder()
                    .addComponents(methods);

                return interaction.reply({
                    content: 'Wybierz metodę płatności',
                    components: [row],
                    ephemeral: true
                });
            }

            if (interaction.values[0] === 'sell_money') {

                const modal = new ModalBuilder()
                    .setCustomId('sell_modal')
                    .setTitle('SKUP');

                const amount = new TextInputBuilder()
                    .setCustomId('sell_amount')
                    .setLabel('Ile sprzedajesz?')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Np. 500k')
                    .setRequired(true);

                const payment = new TextInputBuilder()
                    .setCustomId('sell_payment')
                    .setLabel('Forma płatności')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('PSC')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(amount),
                    new ActionRowBuilder().addComponents(payment)
                );

                return interaction.showModal(modal);
            }

            if (interaction.values[0] === 'other_help') {

                const modal = new ModalBuilder()
                    .setCustomId('other_modal')
                    .setTitle('INNE');

                const reason = new TextInputBuilder()
                    .setCustomId('other_reason')
                    .setLabel('W jakiej sprawie?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(reason)
                );

                return interaction.showModal(modal);
            }
        }

        if (interaction.customId === 'payment_method') {

            const payment = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`buy_${payment}`)
                .setTitle('ZAKUP WALUTY');

            const amount = new TextInputBuilder()
                .setCustomId('buy_amount')
                .setLabel('Za ile chcesz kupić?')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Np. 25')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(amount)
            );

            return interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {

        if (interaction.customId.startsWith('buy_')) {

            const payment =
                interaction.customId.replace('buy_', '');

            const amount =
                parseInt(
                    interaction.fields.getTextInputValue('buy_amount')
                );

            let categoryName = 'NO LIMIT';
            let pingRoles = `<@&${ROLES.NOLIMIT}>`;

            if (amount >= 1 && amount <= 50) {

                categoryName = 'LIMIT 50';

                pingRoles =
`<@&${ROLES.LIMIT50}> <@&${ROLES.NOLIMIT}>`;
            }

            if (amount >= 51 && amount <= 100) {

                categoryName = 'LIMIT 100';

                pingRoles =
`<@&${ROLES.LIMIT100}> <@&${ROLES.NOLIMIT}>`;
            }

            if (amount >= 101 && amount <= 200) {

                categoryName = 'LIMIT 200';

                pingRoles =
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
                .setColor('Green')
                .setTitle('NOWE ZAMÓWIENIE')
                .setDescription(`
Poczekaj na sprzedawcę.

Kupujący:
${interaction.user}

Kwota:
${amount}

Metoda:
${payment}
                `);

            const row = new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId('take_ticket')
                        .setLabel('PRZEJMIJ TICKET')
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
                content: pingRoles,
                embeds: [embed],
                components: [row]
            });

            return interaction.reply({
                content: `Ticket utworzony: ${ticket}`,
                ephemeral: true
            });
        }

        if (interaction.customId === 'sell_modal') {

            const amount =
                interaction.fields.getTextInputValue('sell_amount');

            const payment =
                interaction.fields.getTextInputValue('sell_payment');

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
                        }
                    ]
                });

            const row = new ActionRowBuilder()
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

            await ticket.send({
                content:
`<@&${ROLES.NOLIMIT}>`,
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
                ],
                components: [row]
            });

            return interaction.reply({
                content: `Ticket utworzony: ${ticket}`,
                ephemeral: true
            });
        }

        if (interaction.customId === 'other_modal') {

            const reason =
                interaction.fields.getTextInputValue('other_reason');

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

            const row = new ActionRowBuilder()
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
                ],
                components: [row]
            });

            return interaction.reply({
                content: `Ticket utworzony: ${ticket}`,
                ephemeral: true
            });
        }
    }

    if (interaction.isButton()) {

        if (interaction.customId === 'take_ticket') {

    const buyerId = interaction.channel.topic.split('|')[0];

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
        content: `✅ Ticket został przejęty przez ${interaction.user}`,
        ephemeral: false
    });
}
Kupujący:
<@${buyerId}>

Sprzedawca:
${interaction.user}

Kwota:
${amount}

Metoda:
${payment}

Godzina:
<t:${Math.floor(Date.now()/1000)}:t>
                `);

            await legitChannel.send({
                embeds: [embed]
            });

            await interaction.reply({
                content: 'Legitka wystawiona.'
            });

            const category = interaction.channel.parent;

            setTimeout(async () => {

                await interaction.channel.delete()
                    .catch(() => {});

                if (category.children.cache.size <= 1) {

                    await category.delete()
                        .catch(() => {});
                }

            }, 3000);
        }

        if (interaction.customId === 'close_ticket') {

            const category = interaction.channel.parent;

            await interaction.reply({
                content: 'Zamykanie ticketu...'
            });

            setTimeout(async () => {

                await interaction.channel.delete()
                    .catch(() => {});

                if (category.children.cache.size <= 1) {

                    await category.delete()
                        .catch(() => {});
                }

            }, 3000);
        }
    }
});
client.on('guildMemberAdd', async member => {

    const channel =
        member.guild.channels.cache.get(
            '1502652604973318376'
        );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setColor('#1e2a38')
        .setTitle('🎉 NOWY UŻYTKOWNIK')
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
client.login(TOKEN);

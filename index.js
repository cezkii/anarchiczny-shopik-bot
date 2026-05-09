// FINALNY index.js
// Discord.js v14
// Wklej cały plik do index.js

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

const db = require('./database');

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
    PANEL: '1502649421136003132',
    LEGIT: '1502356815495692440',
    WELCOME: '1502652604973318376',
    PAYMENTS: '1502648184714039486',
    INVITES: '1502650236324024421',
    DROP: '1502655319392915466',
    KONKURSY: '1502654052318707782'
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

async function createCategory(guild, name) {
    let category = guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name === name
    );

    if (!category) {
        category = await guild.channels.create({
            name,
            type: ChannelType.GuildCategory
        });
    }

    return category;
}

async function removeEmptyCategory(category) {
    if (!category) return;

    if (category.children.cache.size <= 0) {
        await category.delete().catch(() => {});
    }
}

async function userHasTicket(guild, userId) {
    return guild.channels.cache.find(
        c => c.topic && c.topic.startsWith(userId)
    );
}

client.once('ready', async () => {

    console.log(client.user.tag + ' ONLINE');

    const panel = await client.channels.fetch(CHANNELS.PANEL);

    const embed = new EmbedBuilder()
        .setColor('#1e2a38')
        .setTitle('ANARCHICZNY SHOPIK - TICKETY')
        .setDescription('Wybierz temat ticketu');

    const menu = new StringSelectMenuBuilder()
        .setCustomId('main_ticket_menu')
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

    const row = new ActionRowBuilder().addComponents(menu);

    await panel.send({
        embeds: [embed],
        components: [row]
    });

    const paymentChannel = await client.channels.fetch(CHANNELS.PAYMENTS);

    const paymentEmbed = new EmbedBuilder()
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
        `);

    await paymentChannel.send({
        embeds: [paymentEmbed]
    });

});

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === 'main_ticket_menu') {

            const existing = await userHasTicket(interaction.guild, interaction.user.id);

            if (existing) {
                return interaction.reply({
                    content: 'Masz już otwarty ticket.',
                    ephemeral: true
                });
            }

            if (interaction.values[0] === 'buy_money') {

                const menu = new StringSelectMenuBuilder()
                    .setCustomId('payment_select')
                    .setPlaceholder('Wybierz metodę płatności')
                    .addOptions([
                        { label: 'BLIK NA NR TEL', value: 'BLIK NA NR TEL' },
                        { label: 'KOD BLIK', value: 'KOD BLIK' },
                        { label: 'PSC Z PARAGONEM', value: 'PSC Z PARAGONEM' },
                        { label: 'PSC BEZ PARAGONU', value: 'PSC BEZ PARAGONU' },
                        { label: 'MYPSC', value: 'MYPSC' },
                        { label: 'CS2 SKINS', value: 'CS2 SKINS' },
                        { label: 'PAYPAL', value: 'PAYPAL' }
                    ]);

                return interaction.reply({
                    content: 'Wybierz metodę płatności',
                    components: [new ActionRowBuilder().addComponents(menu)],
                    ephemeral: true
                });
            }
        }

        if (interaction.customId === 'payment_select') {

            const payment = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId('buy_modal_' + payment)
                .setTitle('ZAKUP WALUTY');

            const amount = new TextInputBuilder()
                .setCustomId('amount')
                .setLabel('Za ile kupujesz?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(amount)
            );

            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {

        if (interaction.customId.startsWith('buy_modal_')) {

            const payment = interaction.customId.replace('buy_modal_', '');
            const amount = parseInt(interaction.fields.getTextInputValue('amount'));

            let categoryName = 'NO LIMIT';
            let pingRoles = `<@&${ROLES.NOLIMIT}>`;

            if (amount >= 1 && amount <= 50) {
                categoryName = 'LIMIT 50';
                pingRoles = `<@&${ROLES.LIMIT50}> <@&${ROLES.NOLIMIT}>`;
            }

            if (amount >= 51 && amount <= 100) {
                categoryName = 'LIMIT 100';
                pingRoles = `<@&${ROLES.LIMIT100}> <@&${ROLES.NOLIMIT}>`;
            }

            if (amount >= 101 && amount <= 200) {
                categoryName = 'LIMIT 200';
                pingRoles = `<@&${ROLES.LIMIT200}> <@&${ROLES.NOLIMIT}>`;
            }

            const category = await createCategory(interaction.guild, categoryName);

            const channel = await interaction.guild.channels.create({
                name: 'zakup-' + interaction.user.username,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: `${interaction.user.id}|${amount}|${payment}`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
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
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: ROLES.LIMIT50,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: ROLES.LIMIT100,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: ROLES.LIMIT200,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: ROLES.NOLIMIT,
                        allow: [PermissionsBitField.Flags.ViewChannel]
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
${amount} zł

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
                        .setLabel('ZAMKNIJ')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.send({
                content: pingRoles,
                embeds: [embed],
                components: [row]
            });

            await interaction.reply({
                content: 'Ticket utworzony: ' + channel,
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
                    deny: [PermissionsBitField.Flags.ViewChannel]
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
                    allow: [PermissionsBitField.Flags.ViewChannel]
                }
            ]);

            await interaction.reply({
                content: '✅ Ticket przejęty przez ' + interaction.user
            });
        }

        if (interaction.customId === 'send_legit') {

            const legitChannel = await client.channels.fetch(CHANNELS.LEGIT);

            const data = interaction.channel.topic.split('|');

            const buyerId = data[0];
            const amount = data[1];
            const payment = data[2];

            const embed = new EmbedBuilder()
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
                embeds: [embed]
            });

            const member = await interaction.guild.members.fetch(buyerId);

            await member.roles.add(ROLES.CLIENT).catch(() => {});

            db.addSpent(buyerId, Number(amount));

            const total = db.getSpent(buyerId);

            if (total >= 200) {
                await member.roles.add(ROLES.CLIENT200).catch(() => {});
            }

            if (total >= 250) {
                await member.roles.add(ROLES.CLIENT250).catch(() => {});
            }

            if (total >= 500) {
                await member.roles.add(ROLES.CLIENT500).catch(() => {});
            }

            await interaction.reply({
                content: '✅ Legitka wystawiona.'
            });

            const category = interaction.channel.parent;

            setTimeout(async () => {

                await interaction.channel.delete().catch(() => {});

                if (category.children.cache.size <= 1) {
                    await category.delete().catch(() => {});
                }

            }, 3000);
        }
    }
});

client.on('guildMemberAdd', async member => {

    const channel = await client.channels.fetch(CHANNELS.WELCOME);

    const embed = new EmbedBuilder()
        .setColor('#1e2a38')
        .setTitle('🎉 NOWY UŻYTKOWNIK')
        .setDescription(`
${member}

Cieszymy się że dołączasz na naszego shopa.

Z itemami z shopika będziesz mógł podbijać anarchię 🥳
        `);

    await channel.send({
        embeds: [embed]
    });
});

client.login(TOKEN);

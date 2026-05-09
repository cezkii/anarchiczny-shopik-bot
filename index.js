```js
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
                            label: 'BLIK',
                            value: 'BLIK'
                        },
                        {
                            label: 'PSC',
                            value: 'PSC'
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
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(amount)
                );

                return interaction.showModal(modal);
            }

            if (interaction.values[0] === 'other_help') {

                const modal = new ModalBuilder()
                    .setCustomId('other_modal')
                    .setTitle('INNE');

                const reason = new TextInputBuilder()
                    .setCustomId('other_reason')
                    .setLabel('Powód')
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
                .setTitle('ZAKUP');

            const amount = new TextInputBuilder()
                .setCustomId('buy_amount')
                .setLabel('Za ile kupujesz?')
                .setStyle(TextInputStyle.Short)
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
                interaction.fields.getTextInputValue('buy_amount');

            const category =
                await getOrCreateCategory(
                    interaction.guild,
                    'ZAKUP'
                );

            const ticket =
                await interaction.guild.channels.create({

                    name: `zakup-${interaction.user.username}`,

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
                        }
                    ]
                });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('NOWE ZAMÓWIENIE')
                .setDescription(`
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
                        .setLabel('PRZEJMIJ')
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId('send_legit')
                        .setLabel('LEGITKA')
                        .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('ZAMKNIJ')
                        .setStyle(ButtonStyle.Danger)
                );

            await ticket.send({
                content: `<@&${ROLES.TICKET}>`,
                embeds: [embed],
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

            await interaction.reply({
                content:
`✅ Ticket przejęty przez ${interaction.user}`
            });
        }

        if (interaction.customId === 'send_legit') {

            const legitChannel =
                interaction.guild.channels.cache.get(
                    LEGIT_CHANNEL
                );

            const [buyerId, amount, payment] =
                interaction.channel.topic.split('|');

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('NOWA LEGITKA')
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

            await legitChannel.send({
                embeds: [embed]
            });

            await interaction.reply({
                content: 'Legitka wystawiona.'
            });
        }

        if (interaction.customId === 'close_ticket') {

            await interaction.reply({
                content: 'Usuwam ticket...'
            });

            setTimeout(async () => {

                await interaction.channel.delete()
                    .catch(() => {});

            }, 3000);
        }
    }
});

client.login(TOKEN);
```

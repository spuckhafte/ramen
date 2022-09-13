import Discord, { Intents, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import Details from './secret.js'
import mongoose from 'mongoose';
import User from './schema/User.js';

import remind from './commands/remind.js';
import balancePlanning from './commands/balancePlanning.js'
import cd from './commands/cd.js'
import online from './commands/online.js'
import help from './commands/help.js'
import lb from "./commands/lb.js";

mongoose.connect(Details.DB_URL);

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('/help', { type: 'LISTENING' })
});

client.on('messageReactionAdd', async (rxn, user) => {
    balancePlanning(rxn, user, client, MessageEmbed);
});

client.on('messageCreate', async msg => {
    if (msg.author.id === '770100332998295572') {
        let botMsg = msg.embeds[0];
        if (!botMsg || !botMsg.title) return;

        if (botMsg.title.includes('balance')) {
            if (!botMsg.footer || !botMsg.footer.text.includes('earned lifetime')) return;
            await msg.react('💰');
        }

        if (botMsg.title.includes('rank mission') || botMsg.title.includes('report info')) {
            online.setOnline(botMsg, User, msg);
        }

        if (botMsg.title.includes('rank mission')) {
            if (!botMsg.footer.iconURL) return;
            const userId = botMsg.footer.iconURL.split('/avatars/')[1].split('/')[0];
            const username = botMsg.title.toLowerCase().replace(/'s ([a-z]+) rank mission/, '');
            remind(User, msg, username, userId, 'mission');
        }

        if (botMsg.title.includes('report info')) {
            if (!botMsg.footer.iconURL) return;
            const userId = botMsg.footer.iconURL.split('/avatars/')[1].split('/')[0];
            const username = botMsg.title.toLowerCase().replace('s report info', '');
            remind(User, msg, username, userId, 'report');
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {

        const { commandName, options } = interaction;

        if (commandName === 'lb') {
            lb.firstLb(options, User, interaction, MessageEmbed, MessageActionRow, MessageSelectMenu);
        }
        if (commandName === 'cd') {
            cd(options, interaction, MessageEmbed, User);
        };

        if (commandName === 'online') {
            online.showOnline(interaction, User, MessageEmbed);
        }

        if (commandName === 'hide') {
            online.hideOnline(options, interaction, User);
        }

        if (commandName === 'help') {
            help(interaction, MessageEmbed, MessageActionRow, MessageButton);
        }
    }

    if (interaction.isSelectMenu()) {
        if (interaction.customId == 'leaderboard-page') {
            lb.managePageChange(interaction, User, MessageEmbed, MessageActionRow, MessageSelectMenu);
        }
    }


})


client.login(Details.TOKEN);
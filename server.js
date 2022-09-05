import Discord, { Intents, MessageEmbed } from 'discord.js';
import Details from './secret.js'
import mongoose from 'mongoose';
import User from './schema/User.js';

import remind from './commands/remind.js';

mongoose.connect(Details.DB_URL);

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILDS
    ]
});

const Timer = {
    mission: 60010,
    report: 420010,
    tower: 600010,
    adventure: 1800000,
    daily: 86400000,
    weekly: 604800000
}

client.once('ready', () => {
    console.log('Ready!')

    const guild = client.guilds.cache.get('1008657622691479633');
    let commands = guild.commands;

    commands.create({
        name: 'cd',
        description: 'Shows you cooldowns for various tasks',
        options: [{
            name: 'ready',
            description: 'will only show you the ready tasks',
            type: "BOOLEAN",
        }]
    });
});

client.on('messageCreate', async msg => {
    if (msg.author.id === '770100332998295572') {
        let botMsg = msg.embeds[0];
        if (!botMsg || !botMsg.title) return;

        if (botMsg.title.includes('rank mission')) {
            const userId = botMsg.footer.iconURL.split('/avatars/')[1].split('/')[0];
            const username = botMsg.title.toLowerCase().replace(/'s ([a-z]+) rank mission/, '');
            remind(User, msg, username, userId, 'mission');
        }

        if (botMsg.title.includes('report info')) {
            const userId = botMsg.footer.iconURL.split('/avatars/')[1].split('/')[0];
            const username = botMsg.title.toLowerCase().replace(/'s ([a-z]+) report info/, '');
            remind(User, msg, username, userId, 'report');
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'cd') {
        const ready = options.getBoolean('ready', false) ? true : false;
        if (!ready) { // all cds
            const user = await User.findOne({ id: interaction.user.id });
            if (!user) {
                interaction.reply({
                    content: '**You are not registered.**\nUse any task related command (eg. `mission`) to get started.',
                    ephemeral: true
                })
                return;
            }
            const embed = new MessageEmbed()
                .setTitle(`${user.username}'s Cooldowns`);

            let activities = '';
            let others = ''
            Object.keys(user.reminder).forEach((type, i) => {
                if (i <= 3) {
                    activities += ((Date.now() - user.reminder[type]) >= Timer[type] ? '✅'
                        : '⌛(' + formatCountDown(user.reminder[type], type)[i > 0 ? 'minutes' : 'seconds'] + ')')
                        + ` ** ${type}\n**`;
                } else {
                    others += ((Date.now() - user.reminder[type]) >= Timer[type] ? '✅'
                        : '⌛ (' + formatCountDown(user.reminder[type], type)[i < 5 ? 'hours' : 'days'] + ')')
                        + ` ** ${type}\n**`;
                }
            });

            embed.addFields([
                {
                    name: 'Activites',
                    value: activities
                }, {
                    name: 'Others',
                    value: others
                }
            ])

            interaction.reply({
                embeds: [embed]
            })
        } else { // only ready cds
            const user = await User.findOne({ id: interaction.user.id });
            if (!user) {
                interaction.reply({
                    content: '**You are not registered.**\nUse any task related command (eg. `mission`) to get started.',
                    ephemeral: true
                })
                return;
            }
            const embed = new MessageEmbed()
                .setTitle(`${user.username}'s "Cool" Cooldowns`);

            let ready = '';
            Object.keys(user.reminder).forEach(type => {
                ready += ((Date.now() - user.reminder[type]) >= Timer[type] ? `✅ ** ${type}\n**` : '')
            });

            embed.description = ready;

            interaction.reply({
                embeds: [embed]
            })
        }
    }
})

function formatCountDown(initialTime, type) {
    let full = {
        mission: 1,
        report: 10,
        daily: 24,
        weekly: 7
    }
    const milliSeconds = Date.now() - initialTime;
    const seconds = (60 - (Math.floor(milliSeconds / 1000))) + 's';
    const minutes = `${Math.floor(full[type] - ((60 - parseInt(seconds)) / 60))}m ${60 - ((60 - parseInt(seconds)) % 60)}s`
    const hours = (full[type] - Math.floor(parseInt(milliSeconds / 1000) / 3600)) + 'hr ' + (60 - Math.floor(parseInt(milliSeconds / 1000) / 60)) + 'm';
    const days = (full[type] - Math.floor(parseInt(milliSeconds / 1000) / 86400)) + 'dy ' + (24 - Math.floor(parseInt(milliSeconds / 1000) / 3600)) + 'hr'
    return {
        seconds,
        minutes,
        hours,
        days
    }
}

client.login(Details.TOKEN);
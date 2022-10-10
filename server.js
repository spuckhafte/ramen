import Discord, { Client, Intents, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import Details from './secret.js'
import mongoose from 'mongoose';
import User from './schema/User.js';

import remind from './commands/remind.js';
import balancePlanning from './commands/balancePlanning.js'
import cd from './commands/cd.js'
import online from './commands/online.js'
import help from './commands/help.js'
import lb from "./commands/lb.js";
import redis from 'redis'

const rc = redis.createClient({
    url: Details.REDIS_URL
});

rc.on('error', (err) => console.log('Redis Error: ', err));
await rc.connect();
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

client.once('ready', async () => {
    console.log('Ready!');
    client.user.setActivity('/help', { type: 'LISTENING' });
});

client.on('messageReactionAdd', async (rxn, user) => {
    balancePlanning(rxn, user, client, MessageEmbed);
});

const Timer = {
    mission: 59990,
    report: 599990,
    tower: 21599990,
    train: 3599990,
    challenge: 1799990,
    daily: 71999990,
    vote: 43199990,
    weekly: 604799990
};

const reminderOn = {};

client.on('messageCreate', async msg => {
    // if (msg.guild.id !== '1008657622691479633') return; uhhm
    if (msg.author.id === '770100332998295572') {
        let botMsg = msg.embeds[0];
        if (!botMsg || !botMsg.title) return;

        if (botMsg.title.includes('balance')) {
            if (!botMsg.footer || !botMsg.footer.text.includes('earned lifetime')) return;
            if (!msg.guild.me.permissionsIn(msg.channel).has('ADD_REACTIONS')) {
                await msg.channel.send('`Add Reaction` permission is **missing**')
                return;
            }
            await msg.react('💰');
        }

        if (botMsg.title.includes('rank mission') || botMsg.title.includes('report info')) {
            online.setOnline(botMsg, User, msg);
        }

        if (botMsg.title.includes('rank mission')) {
            if (!botMsg.footer.iconURL) return;
            const userId = botMsg.footer.iconURL.split('/avatars/')[1].split('/')[0];
            storeReminder(userId, 'mission')
            const username = botMsg.title.toLowerCase().replace(/'s ([a-z]+) rank mission/, '');
            setTimeout(async () => {
                if (msg.embeds[0].footer.text.includes('Correct answer')) {
                    const user = await User.findOne({ id: userId });
                    user.stats.missions = user.stats.missions + 1
                    user.weekly.missions = user.weekly.missions + 1;
                    user.save();
                };
            }, 20.5 * 1000);
            remind(User, msg, msg.createdTimestamp, username, userId, 'mission', false, false, client);
        }

        if (botMsg.title.includes('report info')) {
            if (!botMsg.footer.iconURL) return;
            const userId = botMsg.footer.iconURL.split('/avatars/')[1].split('/')[0];
            storeReminder(userId, 'report')
            const username = botMsg.title.toLowerCase().replace('\'s report info', '');
            setTimeout(async () => {
                if (msg.embeds[0].footer.text.includes('Successful')) {
                    const user = await User.findOne({ id: userId });
                    user.stats.reports = user.stats.reports + 1
                    user.weekly.reports = user.weekly.reports + 1;
                    user.save();
                };
            }, 20.5 * 1000);
            remind(User, msg, msg.createdTimestamp, username, userId, 'report', false, false, client);
        }
    }

    if (!msg.author.bot) {
        if (msg.content.startsWith('<@770100332998295572> tow') || msg.content.startsWith('<@770100332998295572> tower') || msg.content.startsWith('<@770100332998295572> to')) {
            const filter = m => {
                if (m.author.id != '770100332998295572' || m.embeds[0] || !m.content) return false;
                if (!m.content.toLowerCase().includes(msg.author.username.toLowerCase())) return false;
                return true;
            };
            const user = (await User.where('id').equals(msg.author.id))[0]
            if (!user) {
                storeReminder(msg.author.id, 'tower');
                const collector = msg.channel.createMessageCollector({ filter, time: 1500 });
                collector.on('end', async collection => {
                    if (collection.size == 0) return;

                    let nbMsg = collection.first();
                    if (nbMsg.content.startsWith(`**${msg.author.username}** defeated an enemy`)) {
                        storeReminder(msg.author.id, 'tower');
                        remind(User, nbMsg, nbMsg.createdTimestamp, msg.author.username, msg.author.id, 'tower', false, false, client);
                    };
                });
            } else {
                const previousTime = user.reminder.tower;
                if (Date.now() - previousTime < Timer['tower']) if (reminderActive(msg.author.id, 'tower')) return;

                const collector = msg.channel.createMessageCollector({ filter, time: 1500 });
                collector.on('end', async collection => {
                    if (collection.size == 0) return;

                    let nbMsg = collection.first();
                    if (nbMsg.content.startsWith(`**${msg.author.username}** defeated an enemy`)) {
                        storeReminder(msg.author.id, 'tower');
                        remind(User, nbMsg, nbMsg.createdTimestamp, msg.author.username, msg.author.id, 'tower', false, false, client);
                    };
                });
            }
        };


        if (msg.content.trim() == '<@770100332998295572> cd' || msg.content.trim() == '<@770100332998295572> cooldown') {
            const filter = m => {
                if (m.author.id != '770100332998295572' || !m.embeds[0] || !m.embeds[0].title) return false;
                if (!m.embeds[0].title.includes(msg.author.username) || !m.embeds[0].title.toLowerCase().includes('cooldowns')) return false;
                return true;
            };
            const collector = msg.channel.createMessageCollector({ filter, time: 1000 });

            collector.on('end', async collected => {
                if (!collected.toJSON()[0]) return;
                const embedCollected = collected.toJSON()[0].embeds[0];
                if (!embedCollected) return;
                const fields = embedCollected.fields;
                const tasksToBeReminded = {}
                fields.forEach((field, i) => {
                    const tasks = field.value.split('\n');
                    for (let task of tasks) {
                        if (task.includes('white_check_mark')) continue;

                        let reqTask;
                        if (i != fields.length - 1) reqTask = task.split('--- ')[1].split(' (')[0].toLowerCase().trim();
                        else {
                            if (task.toLowerCase().includes('--- train')) reqTask = task.split('--- ')[1].split(' (')[0].toLowerCase().trim();
                            else return;
                        }

                        if (!Timer[reqTask]) continue;

                        let timeLeft;
                        if (i != fields.length - 1) timeLeft = timeToMs(task.split('--- ')[1].split(' (')[1].split(')')[0]);
                        else timeLeft = timeToMs(task.split('--- ')[1].split(' (')[1].split(')')[0]);

                        tasksToBeReminded[reqTask] = timeLeft;
                    }
                })
                if (Object.keys(tasksToBeReminded).length == 0) return;
                let send = [];
                let user = (await User.where('id').equals(msg.author.id))[0]
                if (user == null || user == undefined) {
                    await msg.reply({
                        content: '**You are not registered.**\nDo a `mission` or `report` to continue...',
                        ephemeral: true
                    })
                    return;
                };
                if (!user.reminder.challenge) user.reminder.challenge = 0;
                if (!user.reminder.train) user.reminder.train = 0;
                if (!user.reminder.vote) user.reminder.vote = 0;
                await user.save();

                for (let task of Object.keys(tasksToBeReminded)) {
                    const previousTime = (await User.where('id').equals(msg.author.id))[0].reminder[task];
                    if (Date.now() - previousTime < Timer[task]) if (reminderActive(msg.author.id, task)) continue;

                    const timeLeft = tasksToBeReminded[task]
                    const startTime = (Date.now() - (Timer[task] - timeLeft)) + 1000;
                    storeReminder(msg.author.id, task);
                    await remind(User, msg, startTime, msg.author.username, msg.author.id, task, timeLeft + 1000, true, client);
                    send.push(`**${task}**`)
                };
                const msgg = `${msg.author} reminders added for ${send.join(', ')}`;
                if (send.length != 0) {
                    if (!msg.guild.me.permissionsIn(msg.channel).has('SEND_MESSAGES')) return;
                    await msg.channel.send({
                        content: msgg ? msgg : '--err--',
                        allowedMentions: {
                            users: false
                        }
                    });
                }
            })
        }
    }
});

client.on('interactionCreate', async interaction => {
    // if (interaction.guild.id !== '1008657622691479633') return; uhhm
    if (interaction.isCommand()) {

        const { commandName, options } = interaction;

        if (commandName === 'lb') {
            lb(options, User, interaction, MessageEmbed, MessageActionRow, MessageButton, rc);
        }
        if (commandName === 'cd') {
            cd(options, interaction, MessageEmbed, User, reminderOn);
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

function timeToMs(time = '') {
    let days = 0, hours = 0, minutes = 0, seconds = 0
    const arr = time.split(' ')
    if (arr.length == 4) {
        days = parseInt(arr[0].replace('d', ''));
        arr.splice(0, 1);
    }
    if (arr.length >= 3) {
        hours = parseInt(arr[0].replace('h', ''));
        arr.splice(0, 1);
    }
    if (arr.length >= 2) {
        minutes = parseInt(arr[0].replace('m', ''));
        arr.splice(0, 1);
    }
    if (arr.length >= 1) seconds = parseInt(arr[0].replace('s', ''));

    return ((days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000));
}

function storeReminder(id, task) {
    if (!reminderOn[id]) {
        reminderOn[id] = {
            mission: false,
            report: false,
            tower: false,
            adventure: true,
            daily: false,
            weekly: false,
            challenge: false,
            train: false,
            vote: false
        };
    };

    reminderOn[id][task] = true;
};

function reminderActive(id, task) {
    if (!reminderOn[id]) return false;
    return reminderOn[id][task];
}

await client.login(Details.TOKEN)

for (let user of (await User.find({}))) {
    let reminders = user.reminder;
    for (let reminder of Object.keys(reminders)) {
        if (!reminders[reminder]) continue;
        const deltaTime = Date.now() - reminders[reminder];
        if (deltaTime >= Timer[reminder]) continue;

        storeReminder(user.id, reminder);
        const timeLeft = Timer[reminder] - deltaTime - 800;
        await remind(User, false, reminders[reminder], user.username, user.id, reminder, timeLeft, true, client);
    }
}
console.log('donedonadone');
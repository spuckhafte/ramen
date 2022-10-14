import helpers from "./helpers.js";

export default async (interaction, MessageEmbed, MessageActionRow, MessageButton) => {
    const embed = new MessageEmbed()
        .setTitle('Ramen Guide 📙')
        .setDescription('Bot will start reminding you after your **first successful** mission or report!\n***Slash** commands only*.')
        .addFields(
            { name: '`online` **- lists all the active users**', value: 'Options: *none*' },
            { name: '`hide` **- hides you from the list of active users, even if you are active**', value: 'Options: *state*' },
            { name: '`cd` **- shows you your cooldowns for various tasks**', value: 'Options: *ready*' },
            { name: '`lb` **- shows you the leaderboard of missions and reports**', value: 'Options: *for*, *scope*, *dev (optional)*' },
            { name: '`help` **- shows you this guide**', value: 'Options: *none*' },
            {
                name: '=================\nOthers',
                value: '1. Reacting to your NB balance plans it out for you, *try it!*\n2. Add reminders using **n cd**'
            }
        )
        .setFooter({
            text: 'Reminders for daily, weekly and challenge can only be added using "n cd"'
        });

    const inviteAndUpvote = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setURL('https://discordbotlist.com/bots/ramen-3767/upvote')
                .setLabel('Vote - DBL')
                .setStyle('LINK'),
            new MessageButton()
                .setURL('https://discord.gg/eEeaExspU8')
                .setLabel('Official Server')
                .setStyle('LINK')
        );

    await helpers.reply(interaction, {
        embeds: [embed],
        components: [inviteAndUpvote],
        allowedMentions: {
            repliedUser: false
        }
    });
}
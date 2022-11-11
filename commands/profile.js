import helper from './helpers.js';
async function showProfile(msg, author, User, MessageEmbed, client) {
    const userData = await User.findOne({ id: author.id });
    if (!userData) {
        await helper.reply(msg, {
            content: 'User is not registered with Ramen',
            ephemeral: true
        })
        return;
    };

    let channel;
    if (!userData.channelOverride || !userData.channelOverride.id || userData.channelOverride.id == 'off') channel = 'Not Set';
    else channel = `${userData.channelOverride.channelName} • ${userData.channelOverride.serverName}`;
    
    const embed = new MessageEmbed()
        .setTitle(`👤 ${userData.username}`)
        .setThumbnail(author.displayAvatarURL())
        .setDescription(`**Username:** ${userData.username}\n**Last Active:** ${lastActive(userData.extras.lastOnline)}\n**Hidden:** ${userData.extras.hide ? 'Yes' : 'No'}\n**Channel:** ${channel}\n`)
        .addFields([
            {
                name: '👴 LIFETIME STATS',
                value: `**➼ Missions:** ${userData.stats.missions}\n**➼ Reports:** ${userData.stats.reports}\n**➼ Towers:** ${userData.stats.towers}`,
                inline: true
            }, {
                name: '📅 WEEKLY STATS',
                value: `**➼ Missions:** ${userData.weekly.missions}\n**➼ Reports:** ${userData.weekly.reports}`,
                inline: true
            }
        ])
        .setFooter({
            text: `Level: ${Math.floor(userData.extras.xp)} | XP: ${((userData.extras.xp - Math.floor(userData.extras.xp)) * 100).toFixed(2)}/100`,
            iconURL: client.user.displayAvatarURL()
        })

    helper.reply(msg, {
        embeds: [embed],
        allowedMentions: {
            repliedUser: false
        }
    });
};

function lastActive(time = 0) {
    let dt = Date.now() - time;
    let phrase = '';
    if (dt <= 5 * 60 * 1000) phrase = 'recently';
    if (dt > 5 * 60 * 1000 && dt <= 60 * 60 * 1000) phrase = Math.floor(dt / (1000 * 60)) + ' minutes ago'
    if (dt > 60 * 60 * 1000 && dt < 2 * 60 * 60 * 1000) phrase = 'an hour ago';
    if (dt >= 2 * 60 * 60 * 1000 && dt < 24 * 60 * 60 * 1000) phrase = Math.floor(dt / (1000 * 60 * 60)) + ' hours ago';
    if (dt >= 24 * 60 * 60 * 1000)
        phrase = Math.floor(dt / (1000 * 60 * 60 * 24)) + `${Math.floor(dt / (1000 * 60 * 60 * 24)) == 1 ? ' day ago' : ' days ago'}`;
    return phrase;
}


export default showProfile;
async function setOnline(botMsg, User, msg) {
    try {
        if (!botMsg.footer.iconURL) return;
        const userid = botMsg.footer.iconURL.split('/avatars/')[1].split('/')[0];
        const userData = await User.findOne({ id: userid });
        if (!userData) return;

        if (!userData.extras || Object.keys(userData.extras).length === 0 || !userData.extras.hide) {
            userData.extras = {
                hide: false,
                lastCsv: 0,
                lastOnline: msg.createdTimestamp
            }
            await userData.save();
        } else {
            userData.extras = { ...userData.extras, lastOnline: msg.createdTimestamp }
            await userData.save();
        }
    } catch (e) {
        console.log(botMsg.description);
        console.log(botMsg.footer);
        console.log(botMsg.title);
    }
}

async function showOnline(interaction, User, MessageEmbed) {
    const lastOnlineTimeStamp = Date.now() - 60000;
    const users = await User.where('extras.lastOnline').gt(lastOnlineTimeStamp);
    const total = users.length;
    const usernames = users.map(usr => {
        if (!usr.extras.hide) return `**${usr.username}**`;
    }).join('\n');
    const embed = new MessageEmbed()
        .setTitle(`Active Users - ${total}`)
        .setDescription(usernames)
        .setFooter({
            text: '/hide - removes you from this list'
        });
    await interaction.reply({
        embeds: [embed]
    });
}

async function hideOnline(options, interaction, User) {
    const hiddenState = options.getBoolean('state', true);
    const userData = await User.findOne({ id: interaction.user.id });
    if (!userData) {
        interaction.reply({
            content: '**You are not registered.**\nDo a `mission` or `report` to continue...',
            ephemeral: true
        });
        return;
    }
    userData.extras.hide = hiddenState;
    await userData.save();
    await interaction.reply({
        content: `You are now **${hiddenState ? 'hidden** from' : 'visible** to'} the active user list.`,
        ephemeral: true
    });
}

export default {
    setOnline,
    showOnline,
    hideOnline
}
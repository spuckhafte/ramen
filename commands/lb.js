async function firstLb(options, User, interaction, MessageEmbed, MessageActionRow, MessageSelectMenu) {
    let lbFor = options.getString('for', true);
    const scope = options.getString('scope', true);
    const dev = options.getBoolean('dev', false);

    let allUsers = await User.find({});
    const allMemberId = (await interaction.guild.members.fetch()).toJSON().map(usr => usr.id);

    if (scope == 'local') {
        allUsers = allUsers.filter(usr => allMemberId.includes(usr.id));
    };

    const idAndTaks = decreasing(allUsers.map(usr => { return { id: usr.id, task: usr.stats[lbFor + 's'] } }), 'task');
    let desc = ''
    for (let objI in idAndTaks) {
        if (objI == 10) break;
        const obj = idAndTaks[objI];
        const username = (await User.where('id').equals(obj.id))[0].username.replace('_', '\_');
        let showName = username + (dev ? `(${obj.id})` : '');
        desc += `\`#${parseInt(objI) + 1}\` ${showName} - ${obj.task} ${lbFor + 's'}\n`;
    }
    const embed = new MessageEmbed()
        .setTitle(`${scope.toUpperCase()} ${lbFor.toUpperCase()} LEADERBOARD ${dev ? ' -dev' : ''}`)
        .setColor('RANDOM')
        .setDescription(desc)
        .setFooter(`1 of ${Math.ceil(idAndTaks.length / 10)}`)

    const menuOptions = []
    let i = 1;
    while (i <= Math.ceil(idAndTaks.length / 10)) {
        menuOptions.push({
            label: `Page ${i}`,
            value: `${i}`
        })
        i += 1;
    }

    const action = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('leaderboard-page')
                .setPlaceholder('1')
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(menuOptions)
        )

    await interaction.reply({
        embeds: [embed],
        components: [action]
    });
}



async function managePageChange(interaction, User, MessageEmbed) {
    await interaction.deferReply();
    const page = parseInt(interaction.values[0])
    const title = interaction.message.embeds[0].title;
    const task = title.split(' ')[1].toLowerCase();
    const scope = title.split(' ')[0].toLowerCase();
    const isDev = title.includes('dev');

    const start = (page - 1) * 10 + 1;
    let end = start + 9;

    let allUsers = await User.find({});
    const allMemberId = (await interaction.guild.members.fetch()).toJSON().map(usr => usr.id);

    if (scope == 'local') {
        allUsers = allUsers.filter(usr => allMemberId.includes(usr.id));
    };
    const idAndTaks = decreasing(allUsers.map(usr => { return { id: usr.id, task: usr.stats[task + 's'] } }), 'task');

    if (end > idAndTaks.length) end = idAndTaks.length;

    let desc = '';
    let i = start;
    while (i <= end) {
        const obj = idAndTaks[i - 1];
        const username = (await User.where('id').equals(obj.id))[0].username.replace('_', '\_');
        let showName = username + (isDev ? `(${obj.id})` : '');
        desc += `\`#${i}\` ${showName} - ${obj.task} ${task + 's'}\n`;
        i += 1;
    };

    const embed = new MessageEmbed()
        .setTitle(title)
        .setColor('RANDOM')
        .setDescription(desc)
        .setFooter(`${page} of ${Math.ceil(idAndTaks.length / 10)}`);

    await interaction.followUp({
        embeds: [embed]
    });
}



function decreasing(array = [], task = '') {
    let sortedArray = [];
    for (let elementIndex in array) {
        const element = array[elementIndex];
        if (elementIndex == 0) {
            sortedArray.push(element);
            continue;
        }

        for (let i in sortedArray) {
            if (element[task] > sortedArray[i][task]) {
                const copyBefore = [...sortedArray];
                const copyAfter = copyBefore.splice(i);
                copyBefore.push(element);
                sortedArray = copyBefore.concat(copyAfter);
                break;
            }
            if (i == sortedArray.length - 1) sortedArray.push(element);
            continue;
        }
    }
    return sortedArray;
}


export default {
    firstLb,
    managePageChange
};

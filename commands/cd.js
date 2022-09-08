const Timer = {
    mission: 59990,
    report: 599990,
    tower: 599990,
    adventure: 1799990,
    daily: 86399990,
    weekly: 604799990
}

export default async (options, interaction, MessageEmbed, User) => {
    const ready = options.getBoolean('ready', false) ? true : false;
    if (!ready) { // all cds
        const user = await User.findOne({ id: interaction.user.id });
        if (!user) {
            interaction.reply({
                content: '**You are not registered.**\nDo a `mission` or `report` to continue...',
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

        await interaction.channel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [embed]
        })
        await interaction.reply({
            content: 'Currently reminders only work for **missions** and **reports**.',
            ephemeral: true
        });
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

        await interaction.channel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [embed]
        })

        await interaction.reply({
            content: 'Currently reminders only work for **missions** and **reports**.',
            ephemeral: true
        });
    }
}

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
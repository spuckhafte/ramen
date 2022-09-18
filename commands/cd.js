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

export default async (options, interaction, MessageEmbed, User, reminderOn) => {
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
        if (!user.reminder.challenge) user.reminder.challenge = 0;
        if (!user.reminder.train) user.reminder.train = 0;
        if (!user.reminder.vote) user.reminder.vote = 0;
        await user.save();

        const embed = new MessageEmbed()
            .setTitle(`${user.username}'s Cooldowns`)
            .setFooter('* means you have to do `n cd` again');

        let activities = '';
        let others = ''
        Object.keys(user.reminder).forEach((type, i) => {
            if (type == 'challenge') return;
            if (i == 4) type = 'challenge';
            const taskReady = (Date.now() - user.reminder[type]) >= Timer[type];
            if (i <= 4) {
                activities += (taskReady ? '✅'
                    : '⌛(' + formatCountDown(user.reminder[type], type)[i > 0 ? (i == 2 ? 'hours' : 'minutes') : 'seconds'] + ')')
                    + ` ** ${type}${ra(user.id, type, reminderOn) ? '' : taskReady ? '' : '*'}\n**`;
            } else {
                others += (taskReady ? '✅'
                    : '⌛ (' + formatCountDown(user.reminder[type], type)[i < 7 ? 'hours' : 'days'] + ')')
                    + ` ** ${type}${ra(user.id, type, reminderOn) ? '' : taskReady ? '' : '*'}\n**`;
            };
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

        await interaction.reply({
            embeds: [embed],
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

        await interaction.reply({
            embeds: [embed]
        })
    }
}

function ra(id, task, r) {
    if (r[id] == undefined || r[id] == null) return false;
    return r[id][task];
}

function formatCountDown(initialTime, type) {
    let full = {
        mission: 1,
        report: 10,
        daily: 20,
        weekly: 7,
        tower: 6,
        challenge: 30,
        vote: 12,
        train: 60
    }

    const milliSeconds = Date.now() - initialTime;

    let _hours = Math.ceil((milliSeconds / (1000 * 60 * 60)) % 24);

    const seconds = (60 - (Math.floor(milliSeconds / 1000))) + 's';
    const minutes = `${Math.floor(full[type] - ((60 - parseInt(seconds)) / 60))}m ${60 - ((60 - parseInt(seconds)) % 60)}s`
    let hours = (full[type] - _hours) + 'hr';
    let days = (full[type] - Math.ceil(parseInt(milliSeconds / 1000) / 86400)) + 'd'

    if (hours == '0hr') hours = '< 1hr'
    if (days == '0d') hours = '< 1d'
    return {
        seconds,
        minutes,
        hours,
        days
    }
}
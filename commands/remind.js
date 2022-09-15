const Timer = {
    mission: 59990,
    report: 599990,
    tower: 21599990,
    challenge: 1799990,
    daily: 86399990,
    weekly: 604799990,
}

export default async (User, botMsg, now, username, userid, type, _customTime, _force) => {
    let specific;
    if (User.username) specific = User;
    else specific = await User.findOne({ id: userid });

    if (!specific) {

        let newUser = await User.create({
            username: username,
            id: userid,
            reminder: {
                mission: type === 'mission' ? now : 0,
                report: type === 'report' ? now : 0,
                tower: type === 'tower' ? now : 0,
                adventure: type === 'adventure' ? now : 0,
                daily: type === 'daily' ? now : 0,
                weekly: type === 'weekly' ? now : 0
            },
            stats: {
                missions: 0,
                reports: 0,
                towers: 0,
                adventures: 0
            }
        })

        newUser.stats[type + 's'] = 1
        newUser.save();

        if (!botMsg.guild.me.permissionsIn(botMsg.channel).has('SEND_MESSAGES')) return;

        setTimeout(async () => {
            if (botMsg.channel) await botMsg.channel.send(`<@${userid}> your **${type}** is ready!`);
        }, _customTime ? _customTime : Timer[type]);

    } else {
        if (!botMsg.guild.me.permissionsIn(botMsg.channel).has('SEND_MESSAGES')) return;
        const user = User.username ? User : (await User.where('id').equals(userid))[0];
        const typeTimerExpired = expired(user.reminder[type], type);
        if (typeTimerExpired || _force) {
            user.reminder[type] = _force ? now : Date.now();
            if (!_force) user.stats[type + 's'] = parseInt(user.stats[type + 's']) + 1
            user.save();

            setTimeout(async () => {
                if (botMsg.channel) await botMsg.channel.send(`<@${userid}> your **${type}** is ready!`);
            }, _customTime ? _customTime : Timer[type]);

        } else console.log(`${type} active`)
    }
}

function expired(last, type) {
    const ms = Date.now() - last;
    if (ms > Timer[type]) return true;
    else false;
}
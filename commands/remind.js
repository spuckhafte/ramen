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

const NB1RAMEN = '1017481136471023646';

export default async (User, botMsg, now, username, userid, type, _customTime, _force, client) => {
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
            },
            extras: {
                hide: false,
                lastCsv: 0,
                lastOnline: 0,
                lastActiveChannel: botMsg.channel.id
            },
            weekly: {
                missions: 0,
                reports: 0
            }
        })
        await newUser.save();

        const channel = await client.channels.fetch(newUser.extras.lastActiveChannel);

        setTimeout(async () => {
            if (channel) {
                if (botMsg) if (!botMsg.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) return;
                await channel.send(`<@${userid}> your **${type}** is ready!`);
            }
        }, _customTime ? _customTime : Timer[type]);

    } else {
        const user = User.username ? User : (await User.where('id').equals(userid))[0];
        if (botMsg) {
            user.extras.lastActiveChannel = botMsg.channel.id;
            await user.save();
        };

        const typeTimerExpired = expired(user.reminder[type], type);
        if (typeTimerExpired || _force) {
            user.reminder[type] = _force ? now : Date.now();
            if (!_force) {
                if (type == 'mission' || type == 'report') {
                    if (!user.weekly) user.weekly = {
                        missions: 0,
                        reports: 0
                    };
                }
            };
            await user.save();
            let channel;
            let update = false;
            if (!user.extras.lastActiveChannel) {
                user.extras.lastActiveChannel = NB1RAMEN;
                update = true;
            };
            if (!botMsg) channel = await client.channels.fetch(user.extras.lastActiveChannel);
            else channel = await botMsg.guild.channels.fetch(user.extras.lastActiveChannel);

            setTimeout(async () => {
                if (channel) {
                    if (botMsg) if (!botMsg.guild.me.permissionsIn(channel).has('SEND_MESSAGES')) return;
                    await channel.send(`<@${userid}> your **${type}** is ready!`);
                };
            }, _customTime ? _customTime : Timer[type]);

            if (update) await user.save();

        } else console.log(`${type} active`)
    }
}

function expired(last, type) {
    const ms = Date.now() - last;
    if (ms > Timer[type]) return true;
    else false;
}
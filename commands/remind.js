const Timer = {
    mission: 59990,
    report: 599990,
    tower: 599990,
    adventure: 1799990,
    daily: 86399990,
    weekly: 604799990
}

export default async (User, botMsg, username, userid, type) => {
    const specific = await User.findOne({ id: userid });

    if (!specific) {

        let newUser = await User.create({
            username: username,
            id: userid,
            reminder: {
                mission: type === 'mission' ? botMsg.createdTimestamp : 0,
                report: type === 'report' ? botMsg.createdTimestamp : 0,
                tower: type === 'tower' ? botMsg.createdTimestamp : 0,
                adventure: type === 'adventure' ? botMsg.createdTimestamp : 0,
                daily: type === 'daily' ? botMsg.createdTimestamp : 0,
                weekly: type === 'weekly' ? botMsg.createdTimestamp : 0
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

        setTimeout(async () => {
            await botMsg.channel.send(`<@${userid}> your **${type}** is ready!`);
        }, Timer[type]);

    } else {
        const user = (await User.where('id').equals(userid))[0]
        const typeTimerExpired = expired(user.reminder[type], type);

        if (typeTimerExpired) {

            user.reminder[type] = Date.now();
            user.save();

            setTimeout(async () => {
                await botMsg.channel.send(`<@${userid}> your **${type}** is ready!`);
            }, Timer[type]);

        } else console.log(`${type} active`)
    }
}

function expired(last, type) {
    const ms = Date.now() - last;
    if (ms > Timer[type]) return true;
    else false;
}

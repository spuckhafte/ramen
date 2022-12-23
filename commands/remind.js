import helpers from "./helpers.js";

const Timer = {
    mission: 59990,
    report: 599990,
    tower: 21599990,
    train: 3599990,
    challenge: 1799990,
    daily: 71999990,
    vote: 43199990,
    weekly: 604799990,
    adventure: 21600000
};
const delay = 1500;

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
            },
            server_specific_stats: {
                server1: {
                    id: '1008657622691479633',
                    name: 'uhhm',
                    missions: 0,
                    reports: 0
                }, server2: {
                    id: '990468363404857356',
                    name: 'ⴵ Taishoku',
                    missions: 0,
                    reports: 0
                }
            }
        })
        await newUser.save();

        let channel;
        try {
            channel = await client.channels.fetch(newUser.extras.lastActiveChannel);
        } catch (e) {
            channel = await client.channel.fetch(NB1RAMEN);
        };

        setTimeout(async () => {
            if (channel) {
                await helpers.send(botMsg, `<@${userid}> your **${type}** is ready!`, channel);
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
            let custom = false;
            try {
                if (!user.channelOverride || !user.channelOverride.id || user.channelOverride.id == 'off') {
                    if (!botMsg) channel = await client.channels.fetch(user.extras.lastActiveChannel);
                    else channel = await botMsg.guild.channels.fetch(user.extras.lastActiveChannel);
                } else {
                    channel = await client.channels.fetch(user.channelOverride.id);
                    custom = true;
                }
            } catch (e) {
                channel = await client.channels.fetch(NB1RAMEN);
            }

            setTimeout(async () => {
                if (channel) {
                    if (botMsg && !custom) await helpers.send(botMsg, `<@${userid}> your **${type}** is ready!`);
                    else {
                        try {
                            await channel.send(`<@${userid}> your **${type}** is ready!`);
                        } catch (e) {
                            null;
                        }
                    }
                };
            }, (_customTime ? _customTime : Timer[type]) - delay);

            if (update) await user.save();

        } else console.log(`${type} active`)
    }
}

function expired(last, type) {
    const ms = Date.now() - last;
    if (ms > Timer[type]) return true;
    else false;
}
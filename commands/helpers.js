async function send(msg, data, chnl) {
    if (!chnl) chnl = msg.channel;
    if (!msg.guild.me.permissionsIn(chnl).has('SEND_MESSAGES')) return;
    if (data.embeds && !msg.guild.me.permissionsIn(chnl).has('EMBED_LINKS')) {
        await chnl.send('`EMBED_LINKS` perm **missing**');
    };

    try {
        let msgg = await chnl.send(data);
        return msgg;
    } catch (e) {
        return;
    };
};

async function reply(msg, data) {
    let chnl = msg.channel;
    if (!msg.guild.me.permissionsIn(chnl).has('SEND_MESSAGES')) return;
    if (data.embeds && !msg.guild.me.permissionsIn(chnl).has('EMBED_LINKS')) {
        await chnl.send('`EMBED_LINKS` perm **missing**');
    };

    try {
        let msgg = await msg.reply(data);
        return msgg;
    } catch (e) {
        return;
    };
};

export default {
    send,
    reply
}
import helpers from './helpers.js';

import { Parser } from 'fast-json-parser';
import stringify from 'fast-json-stringify';

async function showLb(msg, User, query, server_db_refer, Details, MessageEmbed, MessageActionRow, MessageButton, rc) {
    let lbFor = query;
    let idAndTasks;
    const prop = `server_specific_stats.${server_db_refer}.${lbFor}s`;
    const propobj = {}
    propobj[prop] = -1;
    let redisKey = `personal-${lbFor}-lb-${msg.guild.id}`;

    let stringIdAndTasks = null;

    if (await rc.exists(redisKey) == 0) {
        const serverMemIds = (await msg.guild.members.fetch()).toJSON().map(usr => usr.id)
        idAndTasks = (await User.find({}, ['id', prop, 'username']).sort(propobj)).filter(obj => serverMemIds.includes(obj.id));
        let fy = stringify({});
        stringIdAndTasks = fy(idAndTasks);
    } else {
        idAndTasks = Parser.parse(await rc.get(redisKey));
    }


    const pgForUser = Math.ceil((idAndTasks.findIndex(usr => usr.id == msg.author.id) + 1) / 10);

    let desc = '';
    for (let objI in idAndTasks) {
        if (objI == 10) break;
        const obj = idAndTasks[objI];
        const username = obj.username;

        let showName = (obj.id == msg.author.id ? `**${username}**` : username);
        desc += `\`#${parseInt(objI) + 1}\` ${showName} - ${obj.server_specific_stats[server_db_refer][`${lbFor}s`]} ${lbFor + 's'}\n`;
    }
    const embed = new MessageEmbed()
        .setTitle(`${lbFor.toUpperCase()} LB - ${Details.IMP_SERVERS[msg.guild.id].server}`)
        .setColor('RANDOM')
        .setDescription(desc)
        .setFooter(`1 of ${Math.ceil(idAndTasks.length / 10)}`)

    const menuOptions = []
    let i = 1;
    while (i <= Math.ceil(idAndTasks.length / 10)) {
        menuOptions.push({
            label: `Page ${i}`,
            value: `${i}`
        })
        i += 1;
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('show_prev_page_personal')
                .setLabel('Previous')
                .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
                .setCustomId('show_next_page_personal')
                .setLabel('Next')
                .setStyle('SUCCESS')
        )


    const msgSent = await helpers.reply(msg, {
        content: `**${msg.author.username}** you can be found on **Page ${pgForUser}**`,
        embeds: [embed],
        components: [row],
        allowedMentions: {
            repliedUser: false
        }
    });

    if (stringIdAndTasks) {
        await rc.setEx(redisKey, 900, stringIdAndTasks);
    };

    const filter = btn => {
        return btn.user.id == msg.author.id && msgSent.id == btn.message.id;
    }

    const collector = msg.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 });
    collector.on('collect', async btn => {
        btn.deferUpdate();
        if (btn.customId != 'show_prev_page_personal' && btn.customId != 'show_next_page_personal') return;
        const embed = btn.message.embeds[0]
        const task = lbFor;

        const currentPage = embed.footer.text.split(' of')[0];
        const finalPage = embed.footer.text.split('of ')[1];
        if ((currentPage == 1 && btn.customId.includes('prev')) || (currentPage == finalPage && btn.customId.includes('next'))) return;

        let page = parseInt(currentPage);
        if (btn.customId.includes('next')) page += 1;
        else page -= 1;

        const start = (page - 1) * 10 + 1;
        let end = start + 9;

        let idAndTasks;


        if (await rc.exists(redisKey) == 0) {
            const serverMemIds = (await msg.guild.members.fetch()).toJSON().map(usr => usr.id)
            idAndTasks = (await User.find({}, ['id', prop, 'username']).sort(propobj)).filter(obj => serverMemIds.includes(obj.id));
            let fy = stringify({});
            stringIdAndTasks = fy(idAndTasks);
        } else {
            idAndTasks = Parser.parse(await rc.get(redisKey));
        }


        if (end >= idAndTasks.length) end = idAndTasks.length;

        let desc = '';
        let i = start;
        while (i <= end) {
            const obj = idAndTasks[i - 1];
            const username = obj.username;
            let showName = (obj.id == msg.author.id ? `**${username}**` : username);
            desc += `\`#${i}\` ${showName} - ${obj.server_specific_stats[server_db_refer][`${lbFor}s`]} ${task + 's'}\n`;
            i += 1;
        };

        const newEmbed = new MessageEmbed()
            .setTitle(embed.title)
            .setColor('RANDOM')
            .setDescription(desc)
            .setFooter(`${page} of ${Math.ceil(idAndTasks.length / 10)}`);

        await msgSent.edit({
            content: btn.message.content,
            components: [row],
            embeds: [newEmbed]
        });

        if (stringIdAndTasks) {
            await rc.setEx(redisKey, 900, stringIdAndTasks);
        };
    })
}

async function clearLb(msg, User, Details) {
    if (!Object.keys(Details.IMP_SERVERS).includes(msg.guild.id)) return;
    if (!Details.IMP_SERVERS[msg.guild.id].mod.includes(msg.author.id)) return;
    let server_db_refer = Details.IMP_SERVERS[msg.guild.id].db_refer;
    let propobj = {}
    let prop = `server_specific_stats.${server_db_refer}`;
    propobj[prop] = {
        id: msg.guild.id,
        name: Details.IMP_SERVERS[msg.guild.id].server,
        missions: 0,
        reports: 0
    }
    try {
        await User.updateMany({}, propobj);
        helpers.reply(msg, 'Leaderboards Reset!');
    } catch (e) {
        helpers.reply(msg, '--some error occurred');
    };
}

export default {
    showLb, clearLb
}
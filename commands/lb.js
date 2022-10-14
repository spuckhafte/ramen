import { Parser } from 'fast-json-parser';
import stringify from 'fast-json-stringify';
import helpers from './helpers.js';

async function lb(options, User, interaction, MessageEmbed, MessageActionRow, MessageButton, rc) {
    let lbFor = options.getString('for', true);
    const scope = options.getString('scope', true);
    const dev = options.getBoolean('dev', false);

    let idAndTasks;
    const prop = `weekly.${lbFor}s`
    const propobj = {}
    propobj[prop] = -1;

    let stringIdAndTasks = null;
    if (scope == 'global') {
        if (await rc.exists(`global-${lbFor}-lb`) == 0) {
            idAndTasks = await User.find({}, ['id', `weekly.${lbFor}s`, 'username']).sort(propobj);
            let fy = stringify({});
            stringIdAndTasks = fy(idAndTasks);
        } else {
            idAndTasks = Parser.parse(await rc.get(`global-${lbFor}-lb`));
        }
    } else {
        if (await rc.exists(`local-${lbFor}-lb-${interaction.guild.id}`) == 0) {
            const serverMemIds = (await interaction.guild.members.fetch()).toJSON().map(usr => usr.id)
            idAndTasks = (await User.find({}, ['id', `weekly.${lbFor}s`, 'username']).sort(propobj)).filter(obj => serverMemIds.includes(obj.id));
            let fy = stringify({});
            stringIdAndTasks = fy(idAndTasks);
        } else {
            idAndTasks = Parser.parse(await rc.get(`local-${lbFor}-lb-${interaction.guild.id}`));
        }
    }

    const pgForUser = Math.ceil((idAndTasks.findIndex(usr => usr.id == interaction.user.id) + 1) / 10);

    let desc = '';
    for (let objI in idAndTasks) {
        if (objI == 10) break;
        const obj = idAndTasks[objI];
        const username = obj.username;

        let showName = (obj.id == interaction.user.id ? `**${username}**` : username) + (dev ? `(${obj.id})` : '');
        desc += `\`#${parseInt(objI) + 1}\` ${showName} - ${obj.weekly[`${lbFor}s`]} ${lbFor + 's'}\n`;
    }
    const embed = new MessageEmbed()
        .setTitle(`${scope.toUpperCase()} ${lbFor.toUpperCase()} LEADERBOARD ${dev ? ' -dev' : ''}`)
        .setColor('RANDOM')
        .setDescription(desc)
        .setFooter(`1 of ${Math.ceil(idAndTasks.length / 10)} (weekly)`)

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
                .setCustomId('show_prev_page')
                .setLabel('Previous')
                .setStyle('PRIMARY')
        )
        .addComponents(
            new MessageButton()
                .setCustomId('show_next_page')
                .setLabel('Next')
                .setStyle('SUCCESS')
        )

    const msgSent = await helpers.send(interaction, {
        content: `<@${interaction.user.id}> you can be found on **Page ${pgForUser}**`,
        embeds: [embed],
        components: [row],
        allowedMentions: {
            users: false
        }
    });
    await helpers.reply(interaction, {
        content: '...',
        ephemeral: true
    });

    if (stringIdAndTasks) {
        await rc.setEx(`${scope}-${lbFor}-lb${scope == 'global' ? '' : `-${interaction.guild.id}`}`, 900, stringIdAndTasks);
    };

    const filter = btn => {
        return btn.user.id == interaction.user.id && msgSent.id == btn.message.id;
    }

    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 });
    collector.on('collect', async btn => {
        btn.deferUpdate();
        if (btn.customId != 'show_prev_page' && btn.customId != 'show_next_page') return;
        const embed = btn.message.embeds[0]
        const scope = embed.title.split(' ')[0].toLowerCase();
        const task = embed.title.split(' ')[1].toLowerCase();
        const isDev = embed.title.includes('dev');

        const currentPage = embed.footer.text.split(' of')[0];
        const finalPage = embed.footer.text.split('of ')[1];
        if ((currentPage == 1 && btn.customId.includes('prev')) || (currentPage == finalPage && btn.customId.includes('next'))) return;

        let page = parseInt(currentPage);
        if (btn.customId.includes('next')) page += 1;
        else page -= 1;

        const start = (page - 1) * 10 + 1;
        let end = start + 9;

        let idAndTasks;
        const prop = `weekly.${task}s`
        const propobj = {}
        propobj[prop] = -1

        if (scope == 'global') {
            if (await rc.exists(`global-${lbFor}-lb`) == 0) {
                idAndTasks = await User.find({}, ['id', `weekly.${lbFor}s`, 'username']).sort(propobj);
                let fy = stringify({});
                stringIdAndTasks = fy(idAndTasks);
            } else {
                idAndTasks = Parser.parse(await rc.get(`global-${lbFor}-lb`));
            }
        } else {
            if (await rc.exists(`local-${lbFor}-lb-${interaction.guild.id}`) == 0) {
                const serverMemIds = (await interaction.guild.members.fetch()).toJSON().map(usr => usr.id)
                idAndTasks = (await User.find({}, ['id', `weekly.${lbFor}s`, 'username']).sort(propobj)).filter(obj => serverMemIds.includes(obj.id));
                let fy = stringify({});
                stringIdAndTasks = fy(idAndTasks);
            } else {
                idAndTasks = Parser.parse(await rc.get(`local-${lbFor}-lb-${interaction.guild.id}`));
            }
        }

        if (end >= idAndTasks.length) end = idAndTasks.length;

        let desc = '';
        let i = start;
        while (i <= end) {
            const obj = idAndTasks[i - 1];
            const username = obj.username;
            let showName = (obj.id == interaction.user.id ? `**${username}**` : username) + (isDev ? `(${obj.id})` : '');
            desc += `\`#${i}\` ${showName} - ${obj.weekly[`${task}s`]} ${task + 's'}\n`;
            i += 1;
        };

        const newEmbed = new MessageEmbed()
            .setTitle(embed.title)
            .setColor('RANDOM')
            .setDescription(desc)
            .setFooter(`${page} of ${Math.ceil(idAndTasks.length / 10)} (weekly)`);

        await msgSent.edit({
            content: btn.message.content,
            components: [row],
            embeds: [newEmbed]
        });

        if (stringIdAndTasks) {
            await rc.setEx(`${scope}-${lbFor}-lb${scope == 'global' ? '' : `-${interaction.guild.id}`}`, 900, stringIdAndTasks);
        };
    })
}

export default lb;
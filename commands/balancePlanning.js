export default async (rxn, user, client, MessageEmbed) => {
    if (user.bot) return;
    const botMsg = rxn.message.embeds[0];
    if (!botMsg || !botMsg.title) return;
    if (!botMsg.title.includes('balance')) return
    if (!botMsg.footer || !botMsg.footer.text.includes('earned lifetime')) return;
    if (!rxn.message.embeds[0].footer.iconURL) return;
    if (!rxn.message.embeds[0].footer.iconURL.includes(user.id)) return;
    if (rxn.emoji.name !== '💰') return;

    let botInList = false;
    for (let usr of rxn.message.reactions.cache.find(rx => rx.emoji.name === '💰').users.cache.toJSON()) {
        if (usr.id === client.user.id) {
            botInList = true;
            break;
        }
    }
    if (!botInList) return;

    const ryo = botMsg.description.split('\n')[0].split('** ')[1];
    const specialTickets = botMsg.description.split('\n')[1].split('** ')[1];

    const pulls = Math.floor(parseInt(ryo) / 300);
    const spulls = Math.floor(parseInt(specialTickets) / 500);

    const embed = new MessageEmbed()
        .setTitle(`${user.username}'s Balance Planning`)
        .addFields([
            { name: 'Pulls', value: `${pulls}`, inline: true },
            { name: 'Special Pulls', value: `${spulls}`, inline: true }
        ])
        .setFooter({
            iconURL: botMsg.footer.iconURL,
            text: user.username
        });
    await rxn.message.channel.send({
        content: `<@${user.id}>`,
        embeds: [embed]
    });
    await rxn.message.reactions.cache.find(rx => rx.emoji.name === '💰').users.remove(client.user.id);
}
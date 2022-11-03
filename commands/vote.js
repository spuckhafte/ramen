import helpers from "./helpers.js";

export default async (interaction, MessageEmbed, MessageActionRow, MessageButton, client) => {
    const embed = new MessageEmbed()
        .setTitle('Vote 🍜')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription('**Leave a review in [Top.gg](https://top.gg/bot/1016043389994668073)**\n**Also join the [Official Server](https://discord.gg/eEeaExspU8)**')
        .setFooter({
            text: 'thank you!',
            iconURL: interaction.user.displayAvatarURL()
        })
    const upvote = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setURL('https://top.gg/bot/1016043389994668073/vote')
                .setLabel('Vote - Top.gg')
                .setStyle('LINK'),
            new MessageButton()
                .setURL('https://discordbotlist.com/bots/ramen-3767/upvote')
                .setLabel('Vote - DBL')
                .setStyle('LINK')
        );
    helpers.send(interaction, {
        embeds: [embed],
        components: [upvote],
        allowedMentions: {
            repliedUser: false
        }
    });
}
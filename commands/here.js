import helpers from "./helpers.js";

export default async (interaction, User) => {
    const off = interaction.options.getBoolean('off', false);
    const user = await User.findOne({ id: interaction.user.id });
    let phrase;
    if (off) {
        if (!user.channelOverride || user.channelOverride.id !== 'off') {
            user.channelOverride = {
                id: 'off',
                channelName: interaction.channel.name,
                serverName: interaction.guild.name
            }
            await user.save();
            phrase = "😐 **feature is turned *off***";
        };
    } else {
        if (interaction.guild.me.permissionsIn(interaction.channel).has('SEND_MESSAGES') && interaction.guild.me.permissionsIn(interaction.channel).has('VIEW_CHANNEL')) {
            user.channelOverride = {
                id: interaction.channel.id,
                channelName: interaction.channel.name,
                serverName: interaction.guild.name
            }
            await user.save();
            phrase = "😃 **you'll receive reminders *here***";
        } else phrase = "😢 **can't send messages in this channel**"
    };

    helpers.reply(interaction, {
        content: phrase,
        ephemeral: true
    });
}
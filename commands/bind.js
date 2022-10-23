const { SlashCommandBuilder } = require('discord.js');
const { getMessagesFromChannel } = require('../services/database/getMessagesFromChannel');
const { asyncQueue } = require('../services/AsyncQueue');
const { logger } = require('../logger/logger');
const { bindChannel } = require('../services/database/bindChannel');
const { boundChannels } = require('../services/database/BoundChannels');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('bind')
		.setDescription('binds bot to track this channel and stores previous messages'),
	async execute(interaction) {
		await interaction.deferReply();
		asyncQueue.enqueue(() => bindChannel(interaction.channelId, interaction.guildId));
		asyncQueue.enqueue(() => boundChannels.fetchIds());
		asyncQueue.enqueue(() => getMessagesFromChannel(interaction.channelId, interaction.client));

		logger.log({
			level: 'info',
			message: `Bot bound to channel ${interaction.channelId} in ${interaction.guildId} `,
		});

		await interaction.editReply('successfully bound bot to this channel');
	},
};

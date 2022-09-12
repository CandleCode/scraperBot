const { SlashCommandBuilder } = require('discord.js');
const { fetchMessages } = require('../services/fetchMessages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scrap')
		.setDescription('scraps chat history of current channel'),
	async execute(interaction) {
		const channel = interaction.client.channels.cache.get(interaction.channelId);
		const messages = fetchMessages(channel);

		await interaction.reply('finished!');
	},
};

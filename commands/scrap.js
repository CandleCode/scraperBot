const { SlashCommandBuilder } = require('discord.js');
const { fetchMessages } = require('../services/fetchMessages');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scrap')
		.setDescription('scraps chat history of current channel'),
	async execute(interaction) {
		await interaction.deferReply();
		const channel = interaction.client.channels.cache.get(interaction.channelId);
		const messages = await fetchMessages(channel);
		fs.writeFile('writeMe.txt', JSON.stringify(messages), () => {});
		await interaction.editReply(`scrapped ${messages.length} messages from this channel`);
	},
};

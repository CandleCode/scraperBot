const { SlashCommandBuilder } = require('discord.js');
const { fetchMessages } = require('../services/fetchMessages');
const { databaseAddMessages } = require('../services/databaseAddMessages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('scrap')
		.setDescription('scraps chat history of current channel'),
	async execute(interaction) {
		await interaction.deferReply();
		const channel = interaction.client.channels.cache.get(interaction.channelId);
		let messages = await fetchMessages(channel);
		messages = (messages.filter(message => message.author.bot === false));
		databaseAddMessages(messages);
		await interaction.editReply(`scrapped ${messages.length} messages from this channel`);
	},
};

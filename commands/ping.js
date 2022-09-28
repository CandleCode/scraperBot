const { SlashCommandBuilder } = require('discord.js');
const { getMessagesFromBoundChannels } = require('../services/getMessagesFromBoundChannels');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await getMessagesFromBoundChannels(interaction.client);
		await interaction.reply('Pong!');
	},
};

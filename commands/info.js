const { SlashCommandBuilder } = require('discord.js');
const { drawInfoCanvas } = require('../services/canvas/drawInfoCanvas');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get emoji info from a user')
		.addUserOption(option => option.setName('user').setDescription('user to target')),
	async execute(interaction) {

		const { file, embed } = await drawInfoCanvas(interaction);

		await interaction.reply({ embeds: [embed],
			files:[file] });
	},
};

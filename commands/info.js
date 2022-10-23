const { SlashCommandBuilder } = require('discord.js');
const { drawInfoCanvas } = require('../services/canvas/drawInfoCanvas');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('user info'),
	async execute(interaction) {

		const { file, embed } = await drawInfoCanvas(interaction);

		await interaction.reply({ embeds: [embed],
			files:[file] });
	},
};

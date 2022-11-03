const { SlashCommandBuilder } = require('discord.js');
const { drawInfoCanvas } = require('../services/canvas/drawInfoCanvas');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('server commands')
		.addSubcommand(subCommand =>
			subCommand
				.setName('info')
				.setDescription('Server emoji info'),
		),
	async execute(interaction) {

		const { file, embed } = await drawInfoCanvas(interaction);

		await interaction.reply({ embeds: [embed],
			files:[file] });
	},
};

const { SlashCommandBuilder } = require('discord.js');
const { getMessagesFromChannel } = require('../services/getMessagesFromChannel');
const { asyncQueue } = require('../services/AsyncQueue');
const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});


module.exports = {
	data: new SlashCommandBuilder()
		.setName('bind')
		.setDescription('binds bot to track this channel and stores previous messages'),
	async execute(interaction) {
		await interaction.deferReply();
		const boundChannelsExists = await knex.schema.hasTable('bound_channels');
		if (!boundChannelsExists) {
			await knex.schema.createTable('bound_channels', table => {
				table.integer('channel_id').primary().notNullable();
				table.text('guild_id').notNullable();
			});
		}

		await knex('bound_channels').insert({
			channel_id: interaction.channelId,
			guild_id: interaction.guildId,
		});
		asyncQueue.enqueue(getMessagesFromChannel(interaction.channelId, interaction.client));
		await interaction.editReply('successfully bound bot to this channel');
	},
};

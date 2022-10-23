const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

const bindChannel = async (channelId, guildId) => {
	const boundChannelsExists = await knex.schema.hasTable('bound_channels');
	if (!boundChannelsExists) {
		await knex.schema.createTable('bound_channels', table => {
			table.integer('channel_id').primary().notNullable();
			table.text('guild_id').notNullable();
		});
	}

	await knex('bound_channels').insert({
		channel_id: channelId,
		guild_id: guildId,
	});
};

module.exports = {
	bindChannel,
};


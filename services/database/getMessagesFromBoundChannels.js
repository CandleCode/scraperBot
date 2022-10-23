const { getMessagesFromChannel } = require('./getMessagesFromChannel');

const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

const getMessagesFromBoundChannels = async (client) => {
	const boundChannelsExists = await knex.schema.hasTable('bound_channels');
	if (boundChannelsExists) {
		const channelsDb = await knex
			.from('bound_channels')
			.select(knex.raw('CAST (channel_id AS CHAR) AS channel_id'));
		for (const boundChannel of channelsDb) {
			await getMessagesFromChannel(boundChannel.channel_id, client);
		}
	}
};

module.exports = {
	getMessagesFromBoundChannels,
};

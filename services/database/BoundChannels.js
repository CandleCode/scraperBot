const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

class BoundChannels {
	constructor() {
		this.boundChannels = [];
	}
	async fetchIds() {
		const boundChannelsExists = await knex.schema.hasTable('bound_channels');
		if (boundChannelsExists) {
			this.boundChannels = await knex
				.from('bound_channels')
				.select(knex.raw('CAST (channel_id AS CHAR) AS channel_id'));
		}
	}
	checkMessageChannelIdExists(messageChannelId) {
		return this.boundChannels.some((channel) => channel.channel_id === messageChannelId);
	}
}

const boundChannels = new BoundChannels();

module.exports = {
	boundChannels,
};

const { getMessagesFromBoundChannels } = require('../services/getMessagesFromBoundChannels');
const { asyncQueue } = require('../services/AsyncQueue');
const { boundChannels } = require('../services/BoundChannels');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await boundChannels.fetchIds();
		asyncQueue.enqueue(getMessagesFromBoundChannels(client));
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};

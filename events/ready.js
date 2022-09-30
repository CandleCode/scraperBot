const { getMessagesFromBoundChannels } = require('../services/getMessagesFromBoundChannels');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await getMessagesFromBoundChannels(client);
		asyncQueue.enqueue(getMessagesFromBoundChannels(client));
		console.log(`Ready! Logged in as ${client.user.tag}`);

	},
};

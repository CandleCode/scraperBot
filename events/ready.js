const { getMessagesFromBoundChannels } = require('../services/getMessagesFromBoundChannels');
const { asyncQueue } = require('../services/AsyncQueue');
const { boundChannels } = require('../services/BoundChannels');
const { logger } = require('../logger/logger');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await boundChannels.fetchIds();
		asyncQueue.enqueue(getMessagesFromBoundChannels(client));

		logger.log({
			level: 'info',
			message: `Bot started as ${client.user.tag} `,
		});
	},
};

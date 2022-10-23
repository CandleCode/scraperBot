const { boundChannels } = require('../services/database/BoundChannels');
const { asyncQueue } = require('../services/AsyncQueue');
const { databaseAddMessages } = require('../services/database/databaseAddMessages');


module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) {
			return;
		}
		if (boundChannels.checkMessageChannelIdExists(message.channelId)) {
			asyncQueue.enqueue(() => databaseAddMessages([ message ]));
		}
	},
};

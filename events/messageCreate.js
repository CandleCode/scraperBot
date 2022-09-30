const { boundChannels } = require('../services/BoundChannels');
const { asyncQueue } = require('../services/AsyncQueue');
const { databaseAddMessages } = require('../services/databaseAddMessages');


module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) {
			return;
		}
		if (boundChannels.checkMessageChannelIdExists(message.channelId)) {
			asyncQueue.enqueue(databaseAddMessages([ message ]));
		}
	},
};

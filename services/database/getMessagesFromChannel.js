const { fetchMessages } = require('./fetchMessages');
const { databaseAddMessages } = require('./databaseAddMessages');

const getMessagesFromChannel = async (channelId, client) => {
	const channel = await client.channels.cache.get(channelId);
	let messages = await fetchMessages(channel);
	messages = (messages.filter(message => message.author.bot === false));
	if (messages.length !== 0) {
		await databaseAddMessages(messages);
	}
};

module.exports = {
	getMessagesFromChannel,
};

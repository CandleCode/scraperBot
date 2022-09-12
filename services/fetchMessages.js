const fetchMessages = async (channel) => {
	const sumMessages = [];
	let messages;
	let messagePointer;

	do {
		const options = { limit: 100 };
		if (messagePointer) { options.before = messagePointer; }

		messages = await channel.messages.fetch(options);
		sumMessages.concat(...messages.array());
		messagePointer = messages.last().id;

	}
	while (messages.size != 100);
	return sumMessages;

};
module.exports = {
	fetchMessages,
};

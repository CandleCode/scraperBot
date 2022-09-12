const fetchMessages = async (channel) => {
	let sumMessages = [];
	let messages;
	let messagePointer;
	do {
		const options = { limit: 100 };
		if (messagePointer) { options.before = messagePointer; }
		messages = await channel.messages.fetch(options);
		sumMessages = sumMessages.concat(Array.from(messages.values()));
		messagePointer = messages.last().id;
		console.log(sumMessages.length, "messages counted");
	} while ((messages.size === 100) && (sumMessages.length < 400));
	return sumMessages;

};
module.exports = {
	fetchMessages,
};

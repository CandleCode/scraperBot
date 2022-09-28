const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

const fetchMessages = async (channel) => {
	const options = { limit: 100 };
	let sumMessages = [];
	let messages;
	let messagePointer;
	const messagesExists = await knex.schema.hasTable('messages');
	if (messagesExists) {
		const lastMessageDb = await knex
			.from('messages')
			.select(knex.raw('CAST (message_id AS CHAR) AS message_id'))
			.where({
				channel_id: channel.id,
			})
			.max('created_at');
		messagePointer = lastMessageDb[0]?.message_id;
	}
	const isAfter = !!messagePointer;

	const setOptions = () => {
		isAfter ? options.after = messagePointer : options.before = messagePointer;
	};

	do {
		setOptions();
		messages = await channel.messages.fetch(options);
		sumMessages = sumMessages.concat(Array.from(messages.values()));
		console.log(sumMessages.length, 'messages counted');
		if (sumMessages.length === 0) {
			break;
		}
		messagePointer = isAfter ? messages.first().id : messages.last().id;
	} while (messages.size === 100);

	return sumMessages;

};
module.exports = {
	fetchMessages,
};

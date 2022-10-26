const { logger } = require('../../logger/logger');
const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

const reducer = (filteredUsers, message) => {
	const userObject = {
		user_id: message.author.id,
		username: message.author.username,
	};
	filteredUsers.set(message.author.id, userObject);
	return filteredUsers;
};

const parseMessageEmojis = (message) => {
	const emojis = message.match(/<a?:([^:>]{2,}):(\d+)>/g) || [];

	return emojis.map(getEmojiData);
};

const getEmojiData = (source) => {
	const [emoji, name, id] = source.match(/<a?:([^:>]{2,}):(\d+)>/);

	return { emoji, name, id };
};

const chunkAndExec = async (array, b) => {
	for (let i = 0; i < array.length; i += 500) {
		const chunkArray = array.slice(i, i + 500);
		await b(chunkArray);
	}
};

const insertMessages = async (plainMessages) => {

	const cleanUsers = [ ...(plainMessages.reduce(reducer, new Map())).values()];

	const { cleanEmoji, cleanRelationships } = plainMessages.reduce((arrays, message) => {
		const parsedEmoji = parseMessageEmojis(message.content);
		parsedEmoji.forEach(({ emoji, name, id }) => {
			arrays.cleanEmoji.push({
				emoji_id: id,
				emoji_name: name,
				is_animated: emoji.includes('<a:'),
			});
			arrays.cleanRelationships.push({
				emoji_id: id,
				message_id: message.id,
			});
		});
		return arrays;
	}, { cleanEmoji:[], cleanRelationships:[] });

	const cleanMessages = plainMessages.map(message => ({
		message_id: message.id,
		user_id: message.author.id,
		replied_message_id: message.reference?.messageId,
		created_at: message.createdTimestamp,
		channel_id: message.channelId,
		guild_id: message.guildId,
	}));

	await chunkAndExec(cleanUsers, async (slicedArray) => {
		await knex('users').insert(slicedArray).onConflict('user_id').ignore();
	});

	await chunkAndExec(cleanMessages, async (slicedArray) => {
		await knex('messages').insert(slicedArray);
	});

	await chunkAndExec(cleanEmoji, async (slicedArray) => {
		await knex('emoji').insert(slicedArray).onConflict('emoji_id').ignore();
	});

	await chunkAndExec(cleanRelationships, async (slicedArray) => {
		await knex('Messages_Emoji').insert(slicedArray);
	});

};

const databaseAddMessages = async (messages) => {

	const usersExists = await knex.schema.hasTable('users');
	if (!usersExists) {
		await knex.schema.createTable('users', table => {
			table.integer('user_id').primary().notNullable();
			table.text('username').notNullable();
		});
	}

	const messagesExists = await knex.schema.hasTable('messages');
	if (!messagesExists) {
		await knex.schema.createTable('messages', table => {
			table.integer('message_id').primary().notNullable();
			table.integer('user_id').references('user_id').inTable('users').notNullable();
			table.integer('replied_message_id').references('message_id');
			table.timestamp('created_at').notNullable();
			table.integer('channel_id').references('channel_id').inTable('bound_channels').notNullable();
			table.integer('guild_id').notNullable();
		});
	}

	const emojiExists = await knex.schema.hasTable('emoji');
	if (!emojiExists) {
		await knex.schema.createTable('emoji', table => {
			table.integer('emoji_id').primary().notNullable();
			table.text('emoji_name').notNullable();
			table.boolean('is_animated').notNullable();
		});
	}

	const relationshipsExist = await knex.schema.hasTable('Messages_Emoji');
	if (!relationshipsExist) {
		await knex.schema.createTable('Messages_Emoji', table => {
			table.integer('message_id').references('message_id').inTable('messages').notNullable();
			table.integer('emoji_id').references('emoji_id').inTable('emoji').notNullable();
		});
	}

	await insertMessages(messages);
	logger.log({
		level: 'info',
		message: `added ${messages.length} message/s to the database successfully`,
	});
};

module.exports = {
	databaseAddMessages,
};

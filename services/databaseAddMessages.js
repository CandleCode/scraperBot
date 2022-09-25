const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

const insertMessages = async (messages) => {
	const prepareUsers = messages.map(message => ({
		user_id: message.author.id,
		username: message.author.username,
	}));
	const prepareMessages = messages.map(message => ({
		message_id: message.id,
		message: message.content,
		user_id: message.author.id,
		replied_message_id: message.reference?.messageId,
		created_at: message.createdTimestamp,
		channel_id: message.channelId,
		guild_id: message.guildId,
	}));
	await knex('users').insert(prepareUsers).onConflict('user_id').ignore();
	await knex('messages').insert(prepareMessages);
};

const databaseAddMessages = async (messages) => {
	console.time();

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
			table.text('message').notNullable();
			table.integer('user_id').references('user_id').inTable('users').notNullable();
			table.integer('replied_message_id').references('message_id');
			table.timestamp('created_at').notNullable();
			table.integer('channel_id').references('channel_id').inTable('bound_channels').notNullable();
			table.integer('guild_id').notNullable();
		});
	}

	await insertMessages(messages);
	console.log('finished adding to db');
	console.timeEnd();
};

module.exports = {
	databaseAddMessages,
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

const parseMessageEmojis = (message) => {
	const emojis = message.match(/<a?:([^:>]{2,}):(\d+)>/g) || [];

	return emojis.map(getEmojiData);
};

const getEmojiData = (source) => {
	const [emoji, name, id] = source.match(/<a?:([^:>]{2,}):(\d+)>/);

	return { emoji, name, id };
};

const parseEmojis = (array, message) => {
	const emojiArray = parseMessageEmojis(message.message);
	if (emojiArray) {
		emojiArray.forEach((emoji) => {
			const index = array.findIndex((value) => value.id === emoji.id);
			if (index === -1) {
				array.push({ ...emoji, count: 1 });
				return;
			}
			array[index].count++;
		});
	}

	return array;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('user info'),
	async execute(interaction) {

		const result = await knex.select('user_id', 'message').from('messages').where('message', 'like', '%<:%>%')
			.andWhere('user_id', 'like', `${interaction.user.id}`);
		const parsedEmojis = result.reduce(parseEmojis, []).sort((a, b) => b.count - a.count);
		console.log(parsedEmojis);


		const exampleEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
			.setDescription('whoa that is a lot of messages')
			.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
			.addFields({ name: `${parsedEmojis[0].emoji}`, value: `${parsedEmojis[0].count} uses`, inline: true })
			.addFields({ name: `${parsedEmojis[1].emoji}`, value: `${parsedEmojis[1].count} uses`, inline: true })
			.addFields({ name: `${parsedEmojis[2].emoji}`, value: `${parsedEmojis[2].count} uses`, inline: true })
			.setTimestamp();

		console.log(interaction.user);
		await interaction.reply({ embeds: [exampleEmbed] });
	},
};

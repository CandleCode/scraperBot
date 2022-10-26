const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const sharp = require('sharp');
const { drawChartCanvas } = require('./drawChartCanvas');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const knex = require('knex')({
	client: 'sqlite3',
	connection: {
		filename: './discord.db',
	},
	useNullAsDefault: true,
});

const drawCanvas = async (emojiArray) => {
	const width = 450;
	const height = 400;
	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext('2d');

	const chart = await drawChartCanvas(emojiArray);

	if (chart) {
		for (const [index, value] of emojiArray.entries()) {
			const imageResponse = await axios.get(`https://cdn.discordapp.com/emojis/${value.emoji_id}.webp?size=44&quality=lossless`, {
				responseType: 'arraybuffer',
			});
			const img = await sharp(imageResponse.data).toFormat('png').toBuffer();
			const image = await loadImage(img);
			ctx.drawImage(image, 0, (index * 50 + 18));
		}
		const chartImage = await loadImage(chart);
		ctx.drawImage(chartImage, 56, 0);
	}
	else {
		ctx.font = '30px Comic Sans MS';
		ctx.fillStyle = '#ffffff';
		ctx.textAlign = 'center';
		ctx.fillText('No emoji data yet! 🐾‍', width / 2, height / 2);
	}

	return canvas;
};

const drawInfoCanvas = async (interaction) => {
	const result = await knex
		.from('messages')
		.innerJoin('Messages_Emoji', 'messages.message_id', '=', 'Messages_Emoji.message_id')
		.innerJoin('emoji', 'Messages_Emoji.emoji_id', '=', 'emoji.emoji_id')
		.select('emoji.emoji_name', knex.raw('CAST (emoji.emoji_id AS CHAR) AS emoji_id'))
		.count('emoji.emoji_name AS count')
		.whereNotNull('emoji.emoji_id')
		.andWhere('messages.user_id', 'like', `${interaction.user.id}`)
		.andWhere('messages.guild_id', 'like', `${interaction.guildId}`)
		.groupBy(['emoji.emoji_name', 'emoji.emoji_id']);

	const emojiArray = result.sort((a, b) => b.count - a.count);
	const totalEmojiCount = emojiArray.reduce((total, emoji) => total + emoji.count, 0);

	const canvas = await drawCanvas(emojiArray.slice(0, 7));
	const file = new AttachmentBuilder(canvas.toBuffer(), { name: 'chart.png', description:'canvas of chart' });

	const embed = new EmbedBuilder()
		.setColor(0x0099FF)
		.setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
		.setDescription(`${totalEmojiCount} emoji total found for this user.`)
		.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
		.setImage('attachment://chart.png')
		.setTimestamp();

	return { file, embed };
};

module.exports = {
	drawInfoCanvas,
};

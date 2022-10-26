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

	const result = await knex.select('user_id', 'message').from('messages').where('message', 'like', '%<:%>%')
		.andWhere('user_id', 'like', `${interaction.user.id}`)
		.andWhere('guild_id', 'like', `${interaction.guildId}`);
	const emojiArray = result.reduce(parseEmojis, []).sort((a, b) => b.count - a.count).slice(0, 7);

	const canvas = await drawCanvas(emojiArray);

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

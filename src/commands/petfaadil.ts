import fs from 'fs';
import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getPetCount, updatePetCount } from '../mongodb.js';

const faadilImages: AttachmentBuilder[] = [];
const folderName = './assets/faadilImages';
fs.readdirSync(folderName).forEach((file) => {
	const path = `${folderName}/${file}`;
	faadilImages.push(new AttachmentBuilder(path));
});

let faadilPetCount = await getPetCount();	// get initial pet count from database

const petfaadilCommand = {
	data: new SlashCommandBuilder()
		.setName('petfaadil')
		.setDescription('Pets faadil c:'),

	async execute(interaction: CommandInteraction) {
		if (faadilPetCount == null)
			throw new Error('faadilPetCount didn\'t get retrieved from the database');

		faadilPetCount++;

		let reply = `faadil has been pet ${faadilPetCount} ${faadilPetCount === 1 ? 'time' : 'times'}`;
		let imgNum = Math.floor(Math.random() * faadilImages.length);
		await interaction.reply({
			content: reply,
			files: [faadilImages[imgNum]]
		});

		await updatePetCount(faadilPetCount);		// update database
	},
};

export default petfaadilCommand;
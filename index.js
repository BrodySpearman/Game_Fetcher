// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path')
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, riotAPIKey } = require('./config.json');

// Require API fetcher
const axios = require('axios');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load slash command palette 
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Receive interactions
client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

// Fetch match data on specified player
async function fetchMatchData(playerName) {
    try {
        const summonerInfo = await axios.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(playerName)}?api_key=${riotAPIKey}`);
        
        const accountId = summonerInfo.data.accountId;
        const matchList = await axios.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${accountId}?api_key=${riotAPIKey}`);

        // Handle match list data here

    } catch (error) {
        console.error('Error fetching match data:', error.response.data);
    }
}

// Example usage
fetchMatchData('summonerName');
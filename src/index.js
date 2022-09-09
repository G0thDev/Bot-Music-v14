const {
  Client,
  GatewayIntentBits,
  InteractionType,
  Collection,
  escapeMarkdown
} = require("discord.js");
const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel
} = require('@discordjs/voice');

const config = require("../config.json");
const ytdl = require("ytdl-core");
const queue = new Map();

const client = new Client({ 
  intents: [ 
    "Guilds",
    "GuildMessages",
    "GuildVoiceStates",
    "GuildMessageTyping",
    "GuildIntegrations",
    "MessageContent",
    "DirectMessageTyping",
    "DirectMessages",
    GatewayIntentBits.Guilds
       ]
    });

module.exports = client;

client.on('interactionCreate', (interaction) => {

  if(interaction.type === InteractionType.ApplicationCommand){

      const cmd = client.slashCommands.get(interaction.commandName);

      if (!cmd) return interaction.reply(`Error`);

      cmd.run(client, interaction,handleVideo, queue, disconnectToChannel);

   }
});

const player = createAudioPlayer();

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
	}
async function disconnectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
		connection.destroy();
		
	}
			
	
async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);

	console.log(video);
	const song = {
		id: video.id,
		title: escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playlist: true,
			loop: false
		};
		queue.set(msg.guild.id, queueConstruct);
	
		queueConstruct.songs.push(song);
	
		try {
			const connection = await connectToChannel(voiceChannel);
			connection.subscribe(player);
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`Eu não pude entrar no canal de voz: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`Eu não pude entrar no canal de voz: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`Agora **${song.title}** foi adicionado a lista!`);
	}
		return undefined;
	}
	
async function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	let stop = false;
	if (!song) {
		disconnectToChannel(serverQueue.voiceChannel);
		queue.delete(guild.id);
		return;
	}
	
	serverQueue.textChannel.send(`Tocando: **${song.title}**`);
	
	const stream = ytdl(song.url, {filter : 'audioonly'});
	const resource = createAudioResource(stream, {
		inputType: StreamType.Arbitrary
	});
	player.play(resource);
	entersState(player, AudioPlayerStatus.Playing);
	player.on(AudioPlayerStatus.Idle,async () => {
		if(!stop){
		if(!serverQueue.loop) serverQueue.songs.shift();
		play(guild, serverQueue.songs[0]);
		stop = true;
		}
	});
	serverQueue.connection = resource.audioPlayer;
	
		
}

client.on('ready', () => {
  console.log(`Estou Pronta!`)
})


client.slashCommands = new Collection()

require('./handler')(client);

client.login(config.token)


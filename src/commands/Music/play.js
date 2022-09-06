const { 
  ApplicationCommandType,
  EmbedBuilder,
  SelectMenuBuilder,
  ApplicationCommandOptionType
} = require('discord.js');

const config = require("../../../config.json");
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(config.youtube);

module.exports = {
name: "play", 
description: "Iniciar musica", 
type: ApplicationCommandType.ChatInput,
options: [
  {
    name: "pesquisa",
    description: "Faça uma pesquisa no youtube ou mande uma URL do youtube",
    type: ApplicationCommandOptionType.String,
    required: false
  }
],

run: async (client, interaction, handleVideo, queue) => {

  const searchString = interaction.options.getString("pesquisa");
  if(!searchString) return interaction.reply({content: `🆘 Não consegui obter nenhum resultado de pesquisa.`});
  const url = searchString.replace(/<(.+)>/g, '$1');
  const serverQueue = queue.get(interaction.guild.id);

  if(!serverQueue){
    const voice_channel_id = interaction.guild.members.cache.get(interaction.member.user.id).voice.channelId;
    if(!voice_channel_id) return interaction.reply({content: `Me desculpe, mas você precisa estar em um canal de voz para tocar música!`});
    return SendVideo(voice_channel_id);
  }else {
    return SendVideo(serverQueue.voiceChannel.id);
  }
  
 
async function SendVideo(channelID){
const channel = interaction.guild.channels.cache.get(channelID);
if(!channel) return interaction.reply({content: "Me desculpe, mas não consegui encontrar o canal de voz."});
if(!channel.permissionsFor(client.user).has('Connect')) return interaction.reply({content: "Não consigo me conectar ao seu canal de voz, verifique se tenho as permissões adequadas !!"});
if(!channel.permissionsFor(client.user).has('Speak')) return interaction.reply({content: "Eu não posso falar neste canal de voz, verifique se eu tenho as permissões adequadas !!"});

try{               
  if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
    const playlist = await youtube.getPlaylist(url);
    const videos = await playlist.getVideos();
    for (const video of Object.values(videos)) {
      const video2 = await youtube.getVideoByID(video.id); 
      await handleVideo(video2, interaction, channel, true); 
    }
    return interaction.reply({content: `Adc Playlist: **${playlist.title}** foi bem adicionada a lista!`, components: []});
    } else {
    try {
      var video = await youtube.getVideo(url);
      
    } catch (error) {
      try {
        var videos = await youtube.searchVideos(searchString, 1);
        var video = await youtube.getVideoByID(videos[0].id);
      } catch (err) {
        console.error(err);
        return interaction.reply({content: '🆘 Não consegui obter nenhum resultado de pesquisa.', components: [] });
      }
    }
    let embed = new EmbedBuilder()
    .setAuthor({ name: `${video.channel.title}`, url: `https://www.youtube.com/channel/${video.channel.id}` })
    .setThumbnail(video.thumbnails.high.url)
    .setColor("#E000FF")
    .setDescription(`**Título: [${video.title}](https://www.youtube.com/watch?v=${video.id})**
**Duração: ${addZero(video.duration.hours)}:${addZero(video.duration.minutes)}:${addZero(video.duration.seconds)}**`);

    interaction.reply({embeds: [embed]})
       
    handleVideo(video, interaction, channel);
  }

}catch (err){ console.log(err) }
}

function addZero(i) {
  if (i < 10) {i = "0" + i}
  return i;
}
              
              
              
          

}
}

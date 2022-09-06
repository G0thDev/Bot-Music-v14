const { 
    ApplicationCommandType,
    EmbedBuilder,

  } = require('discord.js');
  
  module.exports = {
  name: "queue", 
  description: "Ver lista de reprodução atual", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue) => {
  
    const serverQueue = queue.get(interaction.guild.id);
    if(!serverQueue) return interaction.reply({content: `Não a nada tocando.`});
    let i = 0;
    let embed = new EmbedBuilder()
    .setColor("Random")
    .setDescription(`__**Lista de Música:**__

${serverQueue.songs.map(song => `**${++i}** - [${song.title}](${song.url})`).join('\n')}

Tocando agora: **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**`);

    interaction.reply({embeds: [embed]});
  
  }
  }
  
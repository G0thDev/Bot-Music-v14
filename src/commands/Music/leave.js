const { 
    ApplicationCommandType

  } = require('discord.js');
  
  module.exports = {
  name: "leave", 
  description: "Desligar Músicas", 
  type: ApplicationCommandType.ChatInput,
  
  run: async (client, interaction, handleVideo, queue, disconnectToChannel) => {
  
    const serverQueue = queue.get(interaction.guild.id);
    if(!serverQueue) return interaction.reply({content: `Não a nada tocando.`});

    disconnectToChannel(serverQueue.voiceChannel);
  	serverQueue.songs = [];
   	queue.delete(interaction.guild.id);

    interaction.reply({content: "Skip ✅"});
  
  }
  }
  
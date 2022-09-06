const {ApplicationCommandType, EmbedBuilder} = require("discord.js")

module.exports = {
  name: "ping", 
  description: "Veja o ping do bot.", 
  type: ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    
    let ping = client.ws.ping;

    let embed = new EmbedBuilder()
    .setDescription(`**🏓 ${ping}ms**`)
    .setColor("#fff");
    
    interaction.reply({ content: "Ping..." }).then( () => {
        setTimeout( () => {
            interaction.editReply({content: "", embeds: [embed] })
        }, 2000)
    })
  }
}
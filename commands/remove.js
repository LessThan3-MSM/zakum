var fs = require("fs");

module.exports = {
  removeCommand: function (name, channel, guildID, guildData) {
		const kicked = name && name.toLowerCase().trim();
      if(kicked != undefined){
		      guildData.members = guildData.members.filter(member => member.name.toLowerCase() !== kicked)
		      fs.writeFile("./guilds/"+guildID+".json", JSON.stringify(guildData, null, 4), (err) => {
				        if (err) {
				              console.error(err);
						          return;
				        };
				        channel.send(`Successfully removed ${kicked} from the guild roster!`)
		      });
      }else{
        channel.send("Invalid command format. Example: \`remove memberName\`");
      }
  }
};

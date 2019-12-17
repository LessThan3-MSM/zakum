var fs = require("fs");

module.exports = {
  removeCommand: function (message, roster, guildID) {
		const content = message.content.split(" ")
		const kicked = content[1] && content[1].toLowerCase().trim();
      if(kicked != undefined){
		      const newRoster = roster.filter(member => member.name.toLowerCase() !== kicked)
		      fs.writeFile("./guilds/"+guildID+".json", JSON.stringify({"members":newRoster}, null, 4), (err) => {
				        if (err) {
				              console.error(err);
						          return;
				        };
				        message.channel.send(`Successfully removed ${kicked} from the guild roster!`)
		      });
      }else{
        message.channel.send("Invalid command format. Example: \`remove memberName\`");
      }
  }
};

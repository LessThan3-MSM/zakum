const balance = require('./balance.js').balance;
var fs = require("fs");

module.exports = {
  demoteCommand: function (message, guildID, guildData) {
    if(message.content.split(" ").length !== 2) {
      message.channel.send("No input. Please use like so: !demote <IGN>")
      return;
    }
    const name = message.content.split(" ")[1];
    let demoted = guildData.members.find(member => member.name.toLowerCase() === name.toLowerCase())
    if (demoted != undefined) {
  		demoted.leader = false
  		fs.writeFile("./guilds/" + guildID + ".json", JSON.stringify(guildData, null, 4), (err) => {
  				if (err) {
  						console.error(err);
  						return;
  				};
  				message.channel.send(`Removed ${name} from expedition leaders!`)
  		});
    } else {
      message.channel.send(name + " is not in your guild roster! Please try again");
      return;
    }
    var leaders = guildData.members.filter(member => member.name.toLowerCase() !== name.toLowerCase());
    if(guildData.groups && guildData.groups.length){
      balance(leaders, guildData, false, message.channel)
    }
    return;
  }
};

const balance = require('./balance.js').balance;
var fs = require("fs");

module.exports = {
  demoteCommand: function (userName, channel, guildID, guildData, rebalance) {
    if(!userName) {
      channel.send("No input. Please use like so: !demote <IGN>")
      return;
    }

    let demoted = guildData.members.find(member => member.name.toLowerCase() === userName.toLowerCase())
    if (demoted != undefined) {
  		demoted.leader = false
  		fs.writeFile("./guilds/" + guildID + ".json", JSON.stringify(guildData, null, 4), (err) => {
  				if (err) {
  						console.error(err);
  						return;
  				};
  				channel.send(`Removed ${userName} from expedition leaders!`)
  		});
    } else {
      channel.send(userName + " is not in your guild roster! Please try again");
      return;
    }
    var leaders = guildData.members.filter(member => member.leader);
    if(guildData.groups && guildData.groups.length && rebalance){
      balance(leaders, guildData, false, channel)
    }
    return;
  }
};

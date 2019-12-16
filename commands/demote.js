var fs = require("fs");

module.exports = {
  demoteCommand: function (message, roster, leaders, rosterLoc = "./guilds/lt3.json") {
    if(message.content.split(" ").length !== 2) {
      message.channel.send("No input. Please use like so: !demote <IGN>")
      return;
    }
    const name = message.content.split(" ")[1];
    let demoted = roster.find(member => member.name.toLowerCase() === name.toLowerCase())
    if (demoted != undefined) {
  		demoted.leader = false
  		fs.writeFile(rosterLoc, JSON.stringify({"lt3":roster}, null, 4), (err) => {
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
    return leaders.filter(member => member.name.toLowerCase() !== name.toLowerCase())
  }
};

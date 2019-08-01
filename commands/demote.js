var fs = require("fs");

module.exports = {
  demoteCommand: function (message, roster, leaders, name) {
    let demoted = roster.find(member => member.name.toLowerCase() === name.toLowerCase())
		demoted.leader = false
		leaders = leaders.filter(leader => leader.name.toLowerCase() !== name.toLowerCase())
		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
				if (err) {
						console.error(err);
						return;
				};
				message.channel.send(`Removed ${name} from expedition leaders!`)
		});
  }
};

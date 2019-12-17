var fs = require("fs");

module.exports = {
  removeCommand: function (message, roster) {
		const content = message.content.split(" ")
		const kicked = content[1] && content[1].toLowerCase().trim();
		const newRoster = roster.filter(member => member.name.toLowerCase() !== kicked)
		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":newRoster}, null, 4), (err) => {
				if (err) {
						console.error(err);
						return;
				};
				message.channel.send(`Successfully removed ${kicked} from the LessThan3 guild roster!`)
		});
  }
};

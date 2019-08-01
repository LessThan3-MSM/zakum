var fs = require("fs");

module.exports = {
  promoteCommand: function (message, roster, leaders) {
    // if (leaders.length < 2) {
    //   message.channel.send(`Zakum needs two expedition leaders/ groups.`)
    //   return;
    // }
    // if (leaders.length === 2) {
		// 	message.channel.send(`Zakum can't do this! There are already two expedition leaders.`)
		// 	return;
		// }
		const name = message.content.split(" ")[1]
		let promoted = roster.find(member => member.name.toLowerCase() === name.toLowerCase())
		promoted.leader = true
		leaders.push(promoted)
		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
		    if (err) {
		        console.error(err);
		        return;
		    };
		    message.channel.send(`Promoted ${name} to expedition leader!`)
		});
  }
};

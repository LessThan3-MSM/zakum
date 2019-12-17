var fs = require("fs");

module.exports = {
  promoteCommand: function (message, roster, leaders, guildID) {
    if(message.content.split(" ").length !== 2) {
      message.channel.send("No input. Please use like so: !promote <IGN>")
      return;
    }
		const name = message.content.split(" ")[1];

    // i need help with checking if roster has member, doing ugly code to check
    flag = 0;
    roster.forEach(function(member) {
      if (member.name.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0) {
        flag = 1;
      }
    });

    if (flag === 1){
  		let promoted = roster.find(member => member.name.toLowerCase() === name.toLowerCase())
  		promoted.leader = true
  		leaders.push(promoted)
  		fs.writeFile("./guilds/" + guildID + ".json", JSON.stringify({"members":roster}, null, 4), (err) => {
  		    if (err) {
  		        console.error(err);
  		        return;
  		    };
  		    message.channel.send(`Promoted ${name} to expedition leader!`)
  		});
    }
    else {
      message.channel.send(name + " is not in your guild roster! Please try again");
      return;
    }
  }
};

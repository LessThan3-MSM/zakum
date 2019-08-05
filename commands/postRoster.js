var fs = require("fs");

module.exports = {
  postRoster: function (message, roster) {
    let rosterMsg = ""
		roster = roster.map(member => member.name).sort()
		roster.forEach(member => rosterMsg += member + " " )
		message.channel.send(`${rosterMsg} (${roster.length})`)
  }
};

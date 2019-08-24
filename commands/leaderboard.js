var fs = require("fs");

module.exports = {
  leaderboard: function (message, roster) {

    if(message.content.split(" ").length !== 2) { // we want users to input how many
      message.channel.send("Please use like so: !leaderboard <positive integer>");
      return;
    }

    let stringy = "List of beautiful whales <3\n```";
    let amount = message.content.split(" ")[1];
    amount = Math.min(amount, roster.length); //prevents out of index errors

    if (!parseInt(amount)) { //for NaN inputs
      message.channel.send("Use a positive WHOLE number you twat");
      return;
    }

    if (parseInt(amount) < 1) { // for 0 or negatives
      message.channel.send("Stop it. Use a positive WHOLE number");
      return;
    }

    roster = roster.sort((a, b) => b.rank - a.rank);
    for (i = 0; i < amount; i++) {
      const place = i + 1
      // anal about spacing. i need it to look like. discord doesnt allow tables.
      if (place < 10) {
        stringy += "#" + place + "   " + roster[i].name + " ".repeat(Math.abs(roster[i].name.length - 13)) + roster[i].rank + "\n";
      }
      else {
        stringy += "#" + place + "  " + roster[i].name + " ".repeat(Math.abs(roster[i].name.length - 13)) + roster[i].rank + "\n";
      }
    }

    stringy += "```";
    message.channel.send(stringy);
		return;
  }
};

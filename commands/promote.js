const balance = require('./balance.js').balance;
var fs = require("fs");

module.exports = {
  promoteCommand: function (userName, channel, guildID, guildData, rebalance) {
    if(!userName) {
      channel.send("No input. Please use like so: !promote <IGN>")
      return;
    }

    flag = 0;
    guildData.members.forEach(function(member) {
      if (member.name.localeCompare(userName, undefined, { sensitivity: 'accent' }) === 0) {
        flag = 1;
      }
    });

    if (flag === 1){
  		let promoted = guildData.members.find(member => member.name.toLowerCase() === userName.toLowerCase())
  		promoted.leader = true
  		fs.writeFile("./guilds/" + guildID + ".json", JSON.stringify(guildData, null, 4), (err) => {
  		    if (err) {
  		        console.error(err);
  		        return;
  		    };
  		    channel.send(`Promoted ${userName} to expedition leader!`)
  		});

      if (guildData.pool.find( member => member.id === promoted.id  )){ //remove leader from pool if there.
    		  guildData.pool = guildData.pool.filter(member => member.id !== promoted.id)
      }
      if(guildData.waitlist.find( member => member.id === promoted.id  )){//remove leader from waitlist if there as well.
        guildData.waitlist = guildData.waitlist.filter(member => member.id !== promoted.id)
      }
      if(guildData.groups && guildData.groups.length){
        var leaders = guildData.members.filter(member => member.leader);
        if(rebalance){
          balance(leaders, guildData, false, channel)
        }
      }
    }
    else {
      channel.send(userName + " is not in your guild roster! Please try again");
      return;
    }
  }
};

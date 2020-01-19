var fs = require("fs");

module.exports = {
  addCommand: function (id, name, msmclass, dps, channel, guildData, guildID, classes) {
    var roster = guildData.members;
    if(!id || !name || !msmclass || !dps || id.trim()==='' || name.trim()==='' || msmclass.trim()==='' || dps.trim()==='') {
      channel.send("Invalid member add format. Example: \`!add discordID#1234 playerName playerClass playerDPS \`")
      return;
    }
    if (id.split("#").length !== 2){
      channel.send("Invalid Discord ID. Example: \`discordID#1234\`")
      return;
    }
    if(!classes.includes(msmclass.toLowerCase())){
      channel.send(`Invalid class. ${msmclass} does not exist in MapleStory M.`)
      return;
    }
    if(!parseFloat(dps)){
      channel.send(`DPS must be a number.`)
      return;
    }
    const member = {"id":id,"name":name,"rank":parseFloat(dps),"role":msmclass.toLowerCase(),"leader":false}
    if (roster.find(person => person.name.toLowerCase() === member.name.toLowerCase() )){
      channel.send(`${member.name} already exists on the guild roster!`)
      return;
    }else if(roster.find(person => person.id.toLowerCase() === member.id.toLowerCase() )){
      channel.send(`${member.id} already exists on the guild roster!`)
      return;
    }
    roster.push(member)

    fs.writeFile("./guilds/"+guildID+".json", JSON.stringify(guildData, null, 4), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      channel.send(`Successfully added ${member.name} to the guild roster!`)
    });
  }
};

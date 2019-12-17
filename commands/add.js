var fs = require("fs");

module.exports = {
  addCommand: function (message, roster, guildID) {
    const content = message.content.split(" ")
    if(content.length !== 5) {
      message.channel.send("Invalid member add format. Example: \`!add discordID#1234 playerName playerClass playerDPS \`")
      return;
    }
    if (content[1].split("#").length !== 2){
      message.channel.send("Invalid Discord ID. Example: \`discordID#1234\`")
      return;
    }
    const member = {"id":content[1],"name":content[2],"rank":parseFloat(content[4]),"role":content[3].toLowerCase(),"leader":false}
    if (roster.find(person => person.name.toLowerCase() === member.name.toLowerCase() )){
      message.channel.send(`${member.name} already exists on the guild roster!`)
      return;
    }
    roster.push(member)

    fs.writeFile("./guilds/"+guildID+".json", JSON.stringify({"members":roster}, null, 4), (err) => {
      if (err) {
          console.error(err);
          return;
      };
      message.channel.send(`Successfully added ${member.name} to the guild roster!`)
    });
  }
};

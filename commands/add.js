var fs = require("fs");

module.exports = {
  addCommand: function (message, roster) {
    const content = message.content.split(" ")
    if(content.length !== 5) {
      message.channel.send("Invalid member add format. Example: \`!add Horntail#1234 Horntail Bowmaster 5 \`")
      return;
    }
    if (content[1].split("#").length !== 2){
      message.channel.send("Invalid Discord ID. Example: \`Horntail#1234\`")
      return;
    }
    const member = {"id":content[1],"name":content[2],"rank":parseInt(content[4]),"role":content[3],"leader":false}
    if (roster.find(person => person.name.toLowerCase() === member.name.toLowerCase() )){
      message.channel.send(`${member.name} already exists on the LessThan3 guild roster!`)
      return;
    }
    roster.push(member)
    console.log(roster)

    fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    message.channel.send(`Successfully added ${member.name} to the LessThan3 guild roster!`)
    });
  }
};

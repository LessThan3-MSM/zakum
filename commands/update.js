var fs = require("fs");

module.exports = {
  update: function (message, roster, classes) {
    const [AVAILABLE_ARGS, content, id] = [["dps", "id", "name", "class"], message.content.split(" "), `${message.author.username}#${message.author.discriminator}`]
    if(!AVAILABLE_ARGS.includes(content[1])) {
      message.channel.send("Invalid update format. Example: \`!update dps 5.35 \`")
      return;
    } else if (!roster.find(person => person.name === content[2]) && !roster.find(person => person.id === id) ){
      message.channel.send(`Cannot find ${id} on the guild roster! Try updating your id first!`)
      return;
    } else {
      update(message, content[1], content[2], roster, classes)
    }
  }
};

function update(message, type, content, roster, classes){
  switch(type){
    case "class":
      updateClass(message, roster, classes)
      break;
    case "dps":
      updateDps(message, content, roster)
      break;
    case "id":
      updateId(message, content, roster)
      break;
    case "name":
      updateName(message, content, roster)
      break;
  }
}

function updateClass(message, roster, classes){
  const newRole = message.content.split(" ").slice(2).join('')
  if (!classes.includes(newRole)){
    message.channel.send(`Zakum tried his best but does not think that ${newRole} exists in MapleStory M.`)
    return;
  }
  roster.find(member => member.id === `${message.author.username}#${message.author.discriminator}`).role = newRole
  updateRoster(roster, message, "class")
}

function updateDps(message, dps, roster){
  if (!dps || dps.length > 5 || !parseFloat(dps)){
    message.channel.send("Invalid dps value entered. Example: \`!update dps 13.37 \`")
    return;
  }
  roster.find(member => member.id === `${message.author.username}#${message.author.discriminator}`).rank = dps
  updateRoster(roster, message, "dps")
}

function updateId(message, name, roster){
  const newId = `${message.author.username}#${message.author.discriminator}`
  if (!name || name.includes('#')){
    message.channel.send("Invalid name value entered. Example: \`!update id Zakum \`")
    return;
  }
  else if (!roster.find(person => person.name.toLowerCase() === name.toLowerCase())){
    message.channel.send(`Zakum tried his best but can't find ${name} on the guild roster!`)
    return;
  }
  roster.find(member => member.name === name).id = newId
  updateRoster(roster, message, "id")
}

function updateName(message, name, roster){
  if (!name || name.includes('#')){
    message.channel.send("Invalid name value entered. Example: \`!update name Zakum \`")
    return;
  }
  roster.find(member => member.id === `${message.author.username}#${message.author.discriminator}`).name = name
  updateRoster(roster, message, "name")
}

function updateRoster(roster, message, type){
  fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
    if (err) {
        console.error(err);
        return;
    };
    message.channel.send(`Successfully updated the ${type} of ${message.author.username}!`)
  })
}

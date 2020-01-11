var fs = require("fs");

module.exports = {
  update: function (message, guildData, classes) {
    const content = message.content.split(" ")

    const person = content.length >= 4 && guildData.members.find(member => member.name.toLowerCase() === content[1].toLowerCase())
    const [AVAILABLE_ARGS, type, id, value] = [
      ["dps", "id", "name", "class", "multiplier"],
      content.length > 2 ? content[2].toLowerCase() : "",
      content.length >= 4 ? person && person.id : `${message.author.username}#${message.author.discriminator}`,
      content.slice(content.length >= 4 ? 3:2).join("")
    ]
    if(!AVAILABLE_ARGS.includes(type) || content.length < 4) {
      message.channel.send("Invalid update format. Example: \`!update name [dps|id|name|class|multiplier] value \`")
      return;
    } else if (!guildData.members.find(member => member.id === id)){
      message.channel.send(`Zakum cannot find ${id || content[1]} on the guild roster! Try updating your id first!`)
      return;
    } else {
      update(message, type, content, id, value, guildData, classes)
    }
  }
};

function update(message, type, content, id, value, guildData, classes){
  switch(type){
    case "class":
      updateClass(message, id, value, classes, guildData)
      break;
    case "dps":
      updateDps(message, id, value, guildData)
      break;
    case "id":
      updateId(message, id, content.slice(content.length >= 4 ? 3:2).join(" "), guildData)
      break;
    case "name":
      updateName(message, id, value, guildData)
      break;
    case "multiplier":
      updateMulti(message, id, value, guildData)
      break;
  }
}

function updateClass(message, id, role, classes, guildData){
  if (!classes.includes(role)){
    message.channel.send(`Zakum tried his best but does not think that ${role} exists in MapleStory M.`)
    return;
  }
  guildData.members.find(member => member.id === id).role = role
  updateRoster(guildData, message, "class", id)
}

function updateDps(message, id, dps, guildData){
  if (!dps || dps.length > 5 || !parseFloat(dps)){
    message.channel.send("Invalid dps value entered. Example: \`!update name dps 13.37 \`")
    return;
  }
  guildData.members.find(member => member.id === id).rank = parseFloat(dps)
  updateRoster(guildData, message, "dps", id)
}

function updateId(message, id, newId, guildData){
  if (!newId){
    message.channel.send("Invalid new id entered. Example: \`!update name id Zakum#1234 \`")
    return;
  }
  newId = newId || `${message.author.username}#${message.author.discriminator}`
  guildData.members.find(member => member.id === id).id = newId
  updateRoster(guildData, message, "id", newId)
}

function updateName(message, id, newName, guildData){
  guildData.members.find(member => member.id === id).name = newName
  updateRoster(guildData, message, "name", id)
}

function updateMulti(message, id, newMulti, guildData){
  if (!newMulti || newMulti.length > 3 || !parseFloat(newMulti)){
    message.channel.send("Invalid multiplier value entered. Example: \`!update multiplier 2.0 \`")
    return;
  }
  guildData.members.find(member => member.id === id).multiplier = parseFloat(newMulti)
  updateRoster(guildData, message, "multiplier", id)
}

function updateRoster(guildData, message, type, id){
  fs.writeFile("./guilds/"+message.guild.id+".json", JSON.stringify(guildData, null, 4), (err) => {
    if (err) {
        console.error(err);
        return;
    };
  })
  message.channel.send(`Successfully updated the ${type} of ${guildData.members.find(member => member.id === id).name}!`)
}

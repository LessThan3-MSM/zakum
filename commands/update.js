var fs = require("fs");

module.exports = {
  update: function (name, command, val, channel, guildID, username, discriminator, guildData, classes) {

    const AVAILABLE_ARGS = ["dps", "id", "name", "class", "multiplier"];

    if(!command || !AVAILABLE_ARGS.includes(command) || !name || !val) {
      channel.send("Invalid update format. Example: \`!update name [dps|id|name|class|multiplier] value \`")
      return;
    }

    const person = guildData.members.find(member => member.name.toLowerCase() === name.toLowerCase())

    const [type, id, value] = [
      command ? command.toLowerCase() : "",
      person ? person.id : `${username}#${discriminator}`,
      val
    ]

     if (!guildData.members.find(member => member.id === id)){
      channel.send(`Zakum cannot find ${id || content[1]} on the guild roster! Try updating your id first!`)
      return;
    } else {
      update(channel, guildID, username, discriminator, type, id, value, guildData, classes)
    }
  }
};

function update(channel, guildID, username, discriminator, type, id, value, guildData, classes){
  switch(type){
    case "class":
      updateClass(channel, guildID, id, value, classes, guildData)
      break;
    case "dps":
      updateDps(channel, guildID, id, value, guildData)
      break;
    case "id":
      updateId(channel, guildID, username, discriminator, id, value, guildData)
      break;
    case "name":
      updateName(channel, guildID, id, value, guildData)
      break;
    case "multiplier":
      updateMulti(channel, guildID, id, value, guildData)
      break;
  }
}

function updateClass(channel, guildID, id, role, classes, guildData){
  if (!classes.includes(role)){
    channel.send(`Zakum tried his best but does not think that ${role} exists in MapleStory M.`)
    return;
  }
  guildData.members.find(member => member.id === id).role = role
  updateRoster(guildData, channel, guildID, "class", id)
}

function updateDps(channel, guildID, id, dps, guildData){
  if (!dps || dps.length > 5 || !parseFloat(dps)){
    channel.send("Invalid dps value entered. Example: \`!update name dps 13.37 \`")
    return;
  }
  guildData.members.find(member => member.id === id).rank = parseFloat(dps)
  updateRoster(guildData, channel, guildID, "dps", id)
}

function updateId(channel, guildID, username, discriminator, id, newId, guildData){
  if (!newId){
    channel.send("Invalid new id entered. Example: \`!update name id Zakum#1234 \`")
    return;
  }
  newId = newId || `${username}#${discriminator}`
  guildData.members.find(member => member.id === id).id = newId
  updateRoster(guildData, channel, guildID, "id", newId)
}

function updateName(channel, guildID, id, newName, guildData){
  guildData.members.find(member => member.id === id).name = newName
  updateRoster(guildData, channel, guildID, "name", id)
}

function updateMulti(channel, guildID, id, newMulti, guildData){
  if (!newMulti || newMulti.length > 3 || !parseFloat(newMulti)){
    channel.send("Invalid multiplier value entered. Example: \`!update multiplier 2.0 \`")
    return;
  }
  guildData.members.find(member => member.id === id).multiplier = parseFloat(newMulti)
  updateRoster(guildData, channel, guildID, "multiplier", id)
}

function updateRoster(guildData, channel, guildID, type, id){
  fs.writeFile("./guilds/"+guildID+".json", JSON.stringify(guildData, null, 4), (err) => {
    if (err) {
        console.error(err);
        return;
    };
  })
  channel.send(`Successfully updated the ${type} of ${guildData.members.find(member => member.id === id).name}!`)
}

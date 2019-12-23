var fs = require("fs");

module.exports = {
  update: function (message, roster, classes) {
    const content = message.content.split(" ")

    const person = content.length >= 4 && roster.find(member => member.name.toLowerCase() === content[2].toLowerCase())
    const [AVAILABLE_ARGS, type, id, value] = [
      ["dps", "id", "name", "class", "multiplier"],
      content.length > 1 ? content[1].toLowerCase() : "",
      content.length >= 4 ? person && person.id : `${message.author.username}#${message.author.discriminator}`,
      content.slice(content.length >= 4 ? 3:2).join("")
    ]
    if(!AVAILABLE_ARGS.includes(type)) {
      message.channel.send("Invalid update format. Example: \`!update [dps|id|name|class|multiplier] name value \`")
      return;
    } else if (!roster.find(member => member.id === id)){
      message.channel.send(`Zakum cannot find ${id || content[2]} on the guild roster! Try updating your id first!`)
      return;
    } else {
      update(message, type, content, id, value, roster, classes)
    }
  }
};

function update(message, type, content, id, value, roster, classes){
  switch(type){
    case "class":
      updateClass(message, id, value, classes, roster)
      break;
    case "dps":
      updateDps(message, id, value, roster)
      break;
    case "id":
      updateId(message, id, content.slice(content.length >= 4 ? 3:2).join(" "), roster)
      break;
    case "name":
      updateName(message, id, value, roster)
      break;
    case "multiplier":
      updateMulti(message, id, value, roster)
      break;
  }
}

function updateClass(message, id, role, classes, roster){
  if (!classes.includes(role)){
    message.channel.send(`Zakum tried his best but does not think that ${role} exists in MapleStory M.`)
    return;
  }
  roster.find(member => member.id === id).role = role
  updateRoster(roster, message, "class", id)
}

function updateDps(message, id, dps, roster){
  if (!dps || dps.length > 5 || !parseFloat(dps)){
    message.channel.send("Invalid dps value entered. Example: \`!update dps 13.37 \`")
    return;
  }
  roster.find(member => member.id === id).rank = parseFloat(dps)
  updateRoster(roster, message, "dps", id)
}

function updateId(message, id, newId, roster){
  if (!newId){
    message.channel.send("Invalid new id entered. Example: \`!update id Zakum Zakum#1234 \`")
    return;
  }
  newId = newId || `${message.author.username}#${message.author.discriminator}`
  roster.find(member => member.id === id).id = newId
  updateRoster(roster, message, "id", newId)
}

function updateName(message, id, newName, roster){
  roster.find(member => member.id === id).name = newName
  updateRoster(roster, message, "name", id)
}

function updateMulti(message, id, newMulti, roster){
  if (!newMulti || newMulti.length > 3 || !parseFloat(newMulti)){
    message.channel.send("Invalid multiplier value entered. Example: \`!update multiplier 2.0 \`")
    return;
  }
  roster.find(member => member.id === id).multiplier = parseFloat(newMulti)
  updateRoster(roster, message, "multiplier", id)
}

function updateRoster(roster, message, type, id){
  fs.writeFile("./guilds/"+message.guild.id+".json", JSON.stringify({"members":roster}, null, 4), (err) => {
    if (err) {
        console.error(err);
        return;
    };
  })
  message.channel.send(`Successfully updated the ${type} of ${roster.find(member => member.id === id).name}!`)
}

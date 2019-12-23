module.exports = {
  findByClass: function (message, roster, classes) {
    const args = message.content
    const req = args.split(" ").slice(1).join('')

    if(req == undefined || req === ''){
      message.channel.send(':scream: Please supply the name to find.');
      return;
    }

    const member = roster.find(member => member.name.toLowerCase() === req.toLowerCase());

    if(member && member.name.toLowerCase().includes(req.toLowerCase())){
      message.channel.send(`${member.name} plays ${member.role.substring(0,1).toUpperCase() + member.role.substring(1)}. That's a really cool class!`)
      return;
    }

    if(!classes.includes(req.toLowerCase())){
      message.channel.send(`Zakum tried his best but does not think that ${req} exists in MapleStory M.`)
      return;
    }

    const classList = roster.filter(member => member.role.toLowerCase() === req.toLowerCase()).map(member => member.name)
    classList && classList.length ? message.channel.send(`${classList.join(', ')} (${classList.length})`) : message.channel.send(`Zakum could not locate any guild members that play ${req}.`)

  }
};

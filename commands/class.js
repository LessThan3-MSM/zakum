module.exports = {
  findByClass: function (name, channel, roster, classes) {
    if(name == undefined || name === ''){
      channel.send(':scream: Please supply the name to find.');
      return;
    }

    const member = roster.find(member => member.name.toLowerCase() === name.toLowerCase());

    if(member && member.name.toLowerCase().includes(name.toLowerCase())){
      channel.send(`${member.name} plays ${member.role.substring(0,1).toUpperCase() + member.role.substring(1)}. That's a really cool class!`)
      return;
    }

    if(!classes.includes(name.toLowerCase())){
      channel.send(`Zakum tried his best but does not think that ${name} exists in MapleStory M.`)
      return;
    }

    const classList = roster.filter(member => member.role.toLowerCase() === name.toLowerCase()).map(member => member.name)
    classList && classList.length ? channel.send(`${classList.join(', ')} (${classList.length})`) : channel.send(`Zakum could not locate any guild members that play ${name}.`)

  }
};

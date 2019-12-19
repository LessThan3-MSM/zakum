module.exports = {
  joined: function (message, guildData) {
    if(guildData.pool.length){
      message.channel.send(guildData.pool.map(joined => joined.name).sort())
    } else {
      message.channel.send(`Zakum regrets to inform you that no members have yet joined the expedition.`)
    }
  }
};

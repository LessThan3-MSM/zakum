module.exports = {
  joined: function (channel, guildData) {
    if(guildData.pool.length){
      channel.send(guildData.pool.map(joined => joined.name).sort())
    } else {
      channel.send(`Zakum regrets to inform you that no members have yet joined the expedition.`)
    }
  }
};

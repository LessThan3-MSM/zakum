module.exports = {
  joined: function (message, pool) {
    if(pool.length){
      message.channel.send(pool.map(joined => joined.name).sort())
    } else {
      message.channel.send(`Zakum regrets to inform you that no members have yet joined the expedition.`)
    }
  }
};

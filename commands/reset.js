module.exports = {
  reset: function (channel, guildData) {
    guildData.pool.length = 0;
    guildData.groups.length = 0;
    guildData.waitlist.length = 0;

    channel.send(':thumbsup: Zakum has reset all expeditions.');
  }
};

module.exports = {
  reset: function (guildData) {
    guildData.pool.length = 0;
    guildData.groups.length = 0;
    guildData.waitlist.length = 0;
  }
};

module.exports = {
  reset: function (channel, pool, groups, waitlist) {
    pool.length = 0;
    groups.length = 0;
    waitlist.length = 0;
    
    channel.send(':thumbsup: Zakum has reset all expeditions.');
  }
};

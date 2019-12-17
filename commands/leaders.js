module.exports = {
  leaders: function (channel, roster) {
    channel.send(roster.filter(member => member.leader).map(member => member.name).join(", "));
  }
};

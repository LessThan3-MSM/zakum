module.exports = {
  leaders: function (channel, roster) {
    if(roster && roster.length){
    channel.send(roster.filter(member => member.leader).map(member => member.name).join(", "));
  }else{
    channel.send("There are currently no members on the roster.")
  }
  }
};

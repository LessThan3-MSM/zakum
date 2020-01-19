module.exports = {
  postRoster: function (channel, roster) {
    let rosterMsg = ""
		roster = roster.map(member => member.name).sort()
		roster.forEach(member => rosterMsg += member + " " )
    if(roster.length == 0){
        channel.send("You currently have no members on your guild roster! !add some.");
    }else{
		    channel.send(`${rosterMsg} (${roster.length})`)
    }
  }
};

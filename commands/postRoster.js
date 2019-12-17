module.exports = {
  postRoster: function (message, roster) {
    let rosterMsg = ""
		roster = roster.map(member => member.name).sort()
		roster.forEach(member => rosterMsg += member + " " )
    if(roster.length == 0){
        message.channel.send("You currently have no members on your guild roster! !add some.");
    }else{
		    message.channel.send(`${rosterMsg} (${roster.length})`)
    }
  }
};

const promote = require('./promote.js').promoteCommand;
const demote = require('./demote.js').demoteCommand;

module.exports = {
  swap: function (channel, guildData, firstMemberName, secondMemberName, firstMemberIsAdmin, secondMemberIsAdmin, guildID) {
    var groups = guildData.groups;

    channel.send("Zakum used **Swap!**")

    if((groups.length < 1 && guildData.waitlist.length == 0) || !firstMemberName || !secondMemberName){
       channel.send("*But nothing happened!*")
      return;
    }

    let swapGroups = []

    groups.forEach((group, index) => {
      const p1 = group.find(member => member.name.toLowerCase() === firstMemberName.toLowerCase())
      const p2 = group.find(member => member.name.toLowerCase() === secondMemberName.toLowerCase())
      if(p1) swapGroups[0] = ({groupId: index, member:p1})
      if(p2) swapGroups[1] = ({groupId: index, member:p2})
    })

    if(swapGroups.length < 2){ //try the waitlist?
      const p1 = guildData.waitlist.find(member => member.name.toLowerCase() === firstMemberName.toLowerCase())
      const p2 = guildData.waitlist.find(member => member.name.toLowerCase() === secondMemberName.toLowerCase())
      if(p1) swapGroups[0] = ({groupId: -1, member:p1})
      if(p2) swapGroups[1] = ({groupId: -1, member:p2})
    }

    if (swapGroups[0] == undefined || swapGroups[1] == undefined || swapGroups[0].groupId === swapGroups[1].groupId) {
      channel.send("*The attack missed!*")
      return;
    }

    if(swapGroups[0].member.leader != swapGroups[1].member.leader){ //we can't swap a leader and a normal member.
      if(firstMemberIsAdmin || secondMemberIsAdmin){//unless one is an admin
        var demoteUserName = swapGroups[0].member.leader ? swapGroups[0].member.name : swapGroups[1].member.name;
        var promoteUserName = swapGroups[0].member.leader ? swapGroups[1].member.name : swapGroups[0].member.name;
        promote(promoteUserName, channel, guildID, guildData, false);//promote non-leader; do NOT rebalance
        demote(demoteUserName, channel, guildID, guildData, false);//demote leader; do NOT rebalance
      }else{
        var leaderName = swapGroups[0].member.leader ? swapGroups[0].member.name : swapGroups[1].member.name;
        channel.send("*Leader "+leaderName+" dodged the attack!*")
        return;
      }
    }

    if(swapGroups[0].groupId === -1){
      guildData.waitlist = guildData.waitlist.filter(member => member.name.toLowerCase() !== swapGroups[0].member.name.toLowerCase());
      guildData.waitlist.push(swapGroups[1].member);
      guildData.pool.push(swapGroups[0].member);
      guildData.pool = guildData.pool.filter(member => member.name.toLowerCase() !== swapGroups[1].member.name.toLowerCase());
    }else{
      groups[swapGroups[0].groupId] = groups[swapGroups[0].groupId].filter(member => member.name.toLowerCase() !== swapGroups[0].member.name.toLowerCase())
      groups[swapGroups[0].groupId].push(swapGroups[1].member)
    }
    if(swapGroups[1].groupId === -1){
      guildData.waitlist = guildData.waitlist.filter(member => member.name.toLowerCase() !== swapGroups[1].member.name.toLowerCase());
      guildData.waitlist.push(swapGroups[0].member)
      guildData.pool.push(swapGroups[1].member);
      guildData.pool = guildData.pool.filter(member => member.name.toLowerCase() !== swapGroups[0].member.name.toLowerCase());
    }else{
      groups[swapGroups[1].groupId] = groups[swapGroups[1].groupId].filter(member => member.name.toLowerCase() !== swapGroups[1].member.name.toLowerCase())
      groups[swapGroups[1].groupId].push(swapGroups[0].member)
    }
    channel.send("*It was super effective!*")
  }
};

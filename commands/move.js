module.exports = {
  move: function (channel, guildData, memberName, targetMemberName, guildID){
    var groups = guildData.groups;
    const waitlist = 'waitlist';

    channel.send("Zakum used **Move!**")

    if((groups.length < 1 && guildData.waitlist.length == 0) || !memberName || !targetMemberName){
       channel.send("*But nothing happened!*")
      return;
    }

    var sourceGroupID = -1;
    var targetGroupID = targetMemberName.toLowerCase() === waitlist ? waitlist : parseInt(targetMemberName) ? parseInt(targetMemberName)-1 : -1;
    var isOnlyLeader = false;
    var sourceMember;

    groups.forEach((group, index) => {
      const p1 = group.find(member => member.name.toLowerCase() === memberName.toLowerCase())
      var p2;
      if(targetGroupID == -1) p2 = group.find(member => member.name.toLowerCase() === targetMemberName.toLowerCase())
      if(p1) { sourceGroupID = index; sourceMember = p1; isOnlyLeader = p1.leader && group.filter(member => member.leader).length == 1; }
      if(p2) targetGroupID = index;
    });

    if(sourceGroupID == -1 || targetGroupID == -1){ //try the waitlist?
      const p1 = guildData.waitlist.find(member => member.name.toLowerCase() === memberName.toLowerCase())
      var p2;
      if(targetGroupID == -1) p2 = guildData.waitlist.find(member => member.name.toLowerCase() === targetMemberName.toLowerCase())
      if(p1) { sourceGroupID = waitlist; sourceMember = p1; isOnlyLeader = p1.leader && guildData.waitlist.filter(member => member.leader).length == 1; }
      if(p2) targetGroupID = waitlist;
    }

    if (sourceGroupID === targetGroupID || sourceGroupID < 0 || targetGroupID < 0 || (targetGroupID !== waitlist && (groups[targetGroupID]==null || groups[targetGroupID].length >= 10))) {
      channel.send("*The attack missed!*")
      return;
    }else if (isOnlyLeader){
        channel.send("*Leader "+memberName+" dodged the attack!*")
        return;
    }

    //add target to new group.
    if(targetGroupID === waitlist){
      guildData.waitlist.push(sourceMember);
      guildData.pool = guildData.pool.filter(member=>member.name.toLowerCase() !== memberName.toLowerCase());
    }else{
      groups[targetGroupID].push(sourceMember);
    }

    //remove from original group.
    if(sourceGroupID === waitlist){
      guildData.pool.push(sourceMember);
      guildData.waitlist = guildData.waitlist.filter(member => member.name.toLowerCase() !== memberName.toLowerCase());
    }else{
      groups[sourceGroupID] = groups[sourceGroupID].filter(member => member.name.toLowerCase() !== memberName.toLowerCase())
    }

    channel.send("*It was super effective!*")
}
};

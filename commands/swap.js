var fs = require("fs");

module.exports = {
  swap: function (message, groups) {
    message.channel.send("Zakum used **Swap!**")
    let params = message.content.split(" ")
    if(!(groups.length > 1) || params.length !== 3){
       message.channel.send("*But nothing happened!*")
      return;
    }
    const first = params[1]
    const second = params[2]
    let swapGroups = []
    groups.forEach((group, index) => {
      const p1 = group.find(member => member.name.toLowerCase() === first.toLowerCase())
      const p2 = group.find(member => member.name.toLowerCase() === second.toLowerCase())
      p1 && swapGroups.push({groupId: index, member:p1})
      p2 && swapGroups.push({groupId: index, member:p2})
    })
    if (swapGroups.length < 2 || swapGroups[0].groupId === swapGroups[1].groupId) {
      message.channel.send("*The attack missed!*")
      return;
    }
    groups[swapGroups[0].groupId] = groups[swapGroups[0].groupId].filter(member => member.name.toLowerCase() !== swapGroups[0].member.name.toLowerCase())
    groups[swapGroups[1].groupId] = groups[swapGroups[1].groupId].filter(member => member.name.toLowerCase() !== swapGroups[1].member.name.toLowerCase())
    groups[swapGroups[0].groupId].push(swapGroups[1].member)
    groups[swapGroups[1].groupId].push(swapGroups[0].member)
    message.channel.send("*It was super effective!*")

  }
};

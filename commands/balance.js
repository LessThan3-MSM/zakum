
function totalRank(group){
	return group.reduce(function (acc, obj) { return acc + obj.rank * (obj.multiplier || 1); }, 0);
}

module.exports = {
  balance: function (leaders, guildData, sendMsg, channel) {
			var pool = guildData.pool;
			guildData.groups.length = 0;
			var groups = guildData.groups;

    let [bishops, joining, weakest] = [pool.filter(member => member.role.toLowerCase() === "bishop" && !member.leader).sort((a,b) => a.rank-b.rank), pool.slice().sort((a,b) => a.rank*(a.multiplier || 1) - b.rank*(b.multiplier || 1)), [{rank: -1}]]
		let total = [...leaders, ...pool, ...guildData.waitlist].length;
		leaders.forEach((leader, index) => total > (10*index) ? groups[index] = [leader] : joining.push(leader))

		var minBishopsPerGroup = Math.floor(bishops.length/groups.length);
		var maxCapacity = (groups.length * 10) - groups.length; //total num spots - num leader spots = total available spots

		while(joining.length < maxCapacity && guildData.waitlist.length > 0){ //if there are any spots in the groups (due to someone leaving queue, leader promotion)
			var firstWaitingMember = guildData.waitlist.shift();
			joining.push(firstWaitingMember)
			if(firstWaitingMember.role.toLowerCase() === "bishop" && !firstWaitingMember.leader){
				bishops.push(firstWaitingMember);
			}
			pool.push(firstWaitingMember)
			channel.send(`${firstWaitingMember.name} has been moved to an active group.`);
		}

		while(joining.length > maxCapacity){//if there are too many people in the pool due to a leader demotion..
			var lastPoolMember = pool.pop();
			guildData.waitlist.unshift(lastPoolMember);
			joining = joining.filter(member => member !== lastPoolMember)
			bishops = bishops.filter(member => member !== lastPoolMember)
			channel.send(`${lastPoolMember.name} has been moved to the waitlist.`);
		}

		while(joining.length){
      groups.filter(group => !group.full).forEach(group => {
        if(totalRank(weakest) < 0 || totalRank(group) < totalRank(weakest)) weakest = group;
      })
    if(weakest.length === 10){
      weakest.full = true
      weakest = groups.filter(group => !group.full)[0]
      continue;
    }

    weakest.filter(member => member.role.toLowerCase() === "bishop").length < minBishopsPerGroup &&
    bishops.length
      ? weakest.push(bishops[bishops.length - 1]) &&
        joining.splice(joining.indexOf(bishops.pop()), 1)
      : weakest.push(joining.pop())
    }

    if(sendMsg){
      channel.send(`Zakum has successfully rebalanced the groups.`);
    }
  }
};

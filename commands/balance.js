
function totalRank(group){
	return group.reduce(function (acc, obj) { return acc + obj.rank * (obj.multiplier || 1); }, 0);
}

module.exports = {
  balance: function (pool, leaders, groups) {
      groups.length = 0;

    let [bishops, joining, weakest, total] = [pool.filter(member => member.role === "bishop" && !member.leader).sort((a,b) => a.rank-b.rank), pool.slice().sort((a,b) => a.rank*(a.multiplier || 1) - b.rank*(b.multiplier || 1)), [{rank: 100}], [...leaders, ...pool].length]
    leaders.forEach((leader, index) => total > (10*index) ? groups[index] = [leader] : joining.push(leader))
    while(joining.length){
      groups.filter(group => !group.full).forEach(group => {
        if(totalRank(group) < totalRank(weakest)) weakest = group
      })
    if(weakest.length === 10){
      weakest.full = true
      weakest = groups.filter(group => !group.full)[0]
      continue;
    }
    weakest.filter(member => member.role === "bishop").length === 0 &&
    bishops.length
      ? weakest.push(bishops[bishops.length - 1]) &&
        joining.splice(joining.indexOf(bishops.pop()), 1)
      : weakest.push(joining.pop())
    }
  }
};

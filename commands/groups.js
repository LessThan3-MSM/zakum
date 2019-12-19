function formatGroupMessage(name, group) {
	if (!group) return;
	let groupMsg = `${name}: ${group.sort((a,b) => b.rank*(b.multiplier || 1) - a.rank*(a.multiplier || 1)).map(member => member.name).join(", ")}`
	let infoMsg = `(Count: ${group.length}, Strength: ${totalRank(group).toFixed(1)})`
	return `${groupMsg} ${infoMsg} \n`
}

function formatWaitlistMessage(group) {
	if (!group) return;
	let groupMsg = `Waitlist: ${group.map(member => member.name).join(", ")}`
	let infoMsg = `(${group.length})`
	return `${groupMsg} ${infoMsg} \n`
}

function formatDifferenceMessage(difference){
	if(difference === 0){
		return "Zakum has assembled absolutely perfect and balanced groups!"
	}
	else if (difference > 0 && difference < 2){
		return "Zakum has put together wonderful groups for the expedition!"
	}
	else if (difference > 2 && difference < 4){
		return "Zakum created balanced groups for the expedition!"
	}
	else {
		return "Zakum tried his best to balance groups :("
	}
}

function computeDifference(group1, group2, abs){
	const g1 = group1 && totalRank(group1);
	const g2 = group2 && totalRank(group2);
	return abs ? Math.abs(g1-g2) : (g1-g2)
}

function totalRank(group){
	return group.reduce(function (acc, obj) {
		var rank = isNaN(obj.rank) ? 0 : obj.rank;
		return acc + rank * (obj.multiplier || 1);
	}, 0);
}

module.exports = {
  groupCommand: function (message, guildData, leaders) {
		let [differenceMessage, groupMessage] = [formatDifferenceMessage(computeDifference(guildData.groups[0], guildData.groups[1], true)), ""]
		guildData.groups.length ? guildData.groups.forEach((group, key) => groupMessage += formatGroupMessage(`Group ${key+1}`, group)) : groupMessage += formatGroupMessage("Leaders", leaders)

		if(guildData.waitlist && guildData.waitlist.length){
			groupMessage += formatWaitlistMessage(guildData.waitlist)
		}

		message.channel.send("```" + groupMessage + "```" +  `\`Zakum has put together wonderful groups for the expedition!\``)
  }
};

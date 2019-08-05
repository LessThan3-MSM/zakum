var fs = require("fs");

function formatGroupMessage(name, group) {
  // console.log(typeof(group));
	return group ? group.sort((a,b) => b.rank - a.rank).map(member => member.name):[]
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
	const g1 = group1 && group1.reduce(function (acc, obj) { return acc + obj.rank; }, 0);
	const g2 = group2 && group2.reduce(function (acc, obj) { return acc + obj.rank; }, 0);
	return abs ? Math.abs(g1-g2) : (g1-g2)
}

module.exports = {
  formGroups: function (message, roster, groups, pool, waitlist) {
    console.log("GROUPS ", groups);
    console.log("POOL", pool);
    console.log("WAITLIST", waitlist);
    const group1 = formatGroupMessage("Group 1", groups[0] || pool);
		const group2 = formatGroupMessage("Group 2", groups[1]);
		const waitlistGroup = formatGroupMessage("Waitlist", waitlist);
		const differenceMsg = formatDifferenceMessage(computeDifference(groups[0], groups[1], true));

    let msg = `Group 1: ${group1} (${group1.length})`;

    if (groups[1] && groups[1].length) {
			msg += `\nGroup 2: ${group2} (${group2.length})`;
		}

		if (waitlist && waitlist.length) {
			msg += `\nWaitlist: ${waitlistGroup} (${waitlistGroup.length})`;
		}

		console.log("```" + msg + "```");
		message.channel.send("```" + msg + "```");
		groups[1] && groups[1].length && message.channel.send(`\`${differenceMsg}\``);
  }
};

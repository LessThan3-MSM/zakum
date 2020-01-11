function formatGroupMessage(name, group) {
	if (!group) return;
	let groupMsg = `${name}: ${group.sort((a,b) => b.rank*(b.multiplier || 1) - a.rank*(a.multiplier || 1)).map(member => member.name).join(", ")}`
	let infoMsg = `(Count: ${group.length}, Strength: ${totalRank(group).toFixed(1)})`
	return `${groupMsg} ${infoMsg} \n`
}

function getFirstMatch(a, b) {
    for ( var i = 0; i < a.length; i++ ) {
        for ( var e = 0; e < b.length; e++ ) {
            if ( a[i].id === b[e].id ) return a[i];
        }
    }
}

function formatGroupDetailMessage(group, leaders, name, isMembers){
	var msg = `\`\`\`${name} (Count: ${group.length}, Strength: ${totalRank(group).toFixed(1)})\n`;
	var leader;
	if(isMembers){
		leader = getFirstMatch(group,leaders);
		msg += "Leader: \n\t" + formatMemberDetailMessage(leader);
		msg += "\nBishops: \n\t";
		var bishops = group.filter(member => member.role.toLowerCase() === "bishop" && member.name !== leader.name);
		for(var i=0; i<bishops.length; i++){
				msg += formatMemberDetailMessage(bishops[i]);
				if(i != bishops.length-1){
					msg+="\n\t"
				}
		}
		msg += "\nMembers: \n\t";
	}else{
		msg += "\t";
	}


	for(var i=0; i<group.length; i++){
		if(!isMembers || group[i].name !== leader.name && group[i].role.toLowerCase() !== 'bishop'){
			msg += formatMemberDetailMessage(group[i]);
			if(i != group.length-1){
				msg+="\n\t"
			}
		}
	}

	return msg + '\`\`\`';
}

function formatMemberDetailMessage(member){
	var msg = `${member.name} (class: ${member.role}, dps: ${member.rank}`;
	return member.multiplier ? msg + `, multiplier: ${member.multiplier})` : msg + ")";
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
  groupCommand: function (channel, guildData, leaders) {
		let [differenceMessage, groupMessage] = [formatDifferenceMessage(computeDifference(guildData.groups[0], guildData.groups[1], true)), ""]
		guildData.groups.length ? guildData.groups.forEach((group, key) => groupMessage += formatGroupMessage(`Group ${key+1}`, group)) : groupMessage += formatGroupMessage("Leaders", leaders)

		if(guildData.waitlist && guildData.waitlist.length){
			groupMessage += formatWaitlistMessage(guildData.waitlist)
		}

		channel.send("```" + groupMessage + "```" +  `\`Zakum has put together wonderful groups for the expedition!\``)
  },
	groupDetails: function (channel, guildData, leaders){
		var msg = '';
		guildData.groups && guildData.groups.length ? guildData.groups.forEach((group, key) => msg += formatGroupDetailMessage(group, leaders, `Group ${key+1}`, true)) : msg += formatGroupDetailMessage(leaders, leaders, "Leaders", false);
		guildData.waitlist && guildData.waitlist.length ? msg += formatGroupDetailMessage(guildData.waitlist, `Waitlist`, false) : ''
		channel.send(msg);
	}
};

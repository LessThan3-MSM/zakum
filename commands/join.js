const balance = require('./balance.js').balance;
const isguildenabled = require('./timers.js').isguildenabled;
const isBeforeGuildJoinWindow = require('./timers.js').isBeforeGuildJoinWindow;
const isAfterGuildJoinWindow = require('./timers.js').isAfterGuildJoinWindow;

function addMemberToPool(name, roster, leaders, guildData, expoName, isExpo, channel, username, discriminator, guildID, showMsg){
	let user = null;
	expoName =  expoName == undefined ? "Zakum Expedition Finder" : expoName;
	if (name){
		const added = roster.find(member => member.name && member.name.toLowerCase() === name.toLowerCase())
		user = added ? added.id:null
	} else {
		user = username + "#" + discriminator;
	}

	const joined = user && roster.find(member => member.id && member.id.toLowerCase() === user.toLowerCase())
	if (!joined){
		if(showMsg){
			channel.send(`${name || username} does not appear to be on the guild roster. Please contact your guild leader to get added to the roster.`)
		}
		return true;
	}

	const aleader = user && leaders.find(member => member.id && member.id.toLowerCase() === user.toLowerCase())
	if(aleader){
		if(showMsg){
			channel.send(`${name || username} is a leader. Only regular members may join.`)
		}
		return true;
	}
	//Leave
	if(guildData.waitlist && guildData.waitlist.find( member => member.id === joined.id  )){
		if(showMsg){
			channel.send(`Removed ${name || username} from the ${expoName} waitlist.`)
		}
		guildData.waitlist = guildData.waitlist.filter(member => member.id !== joined.id)
		return;
	} else if (guildData.pool.find( member => member.id === joined.id  )){
		guildData.pool = guildData.pool.filter(member => member.id !== joined.id)
		if(showMsg){
			channel.send(`Removed ${name || username} from the ${expoName} queue.`)
		}
		balance(leaders, guildData, false, channel)
		return;
	}

	//Join
	joined.timestamp = Date.now();
	var afterWindow = isAfterGuildJoinWindow(guildID);

	if ((!isExpo && afterWindow) || ("greedy" !== guildData.balance && [...leaders, ...guildData.pool].length >= leaders.length * 10)){
		guildData.waitlist.push(joined)
	} else {
		guildData.pool.push(joined)
		if('greedy' === guildData.balance){
			guildData.pool.sort(function(a, b){
				var rank = b.rank - a.rank; //higher # should go first :)
				if(rank == 0){ //if ranks are the same use the timestamp instead (lowest 1st).
					rank = (a.timestamp ? a.timestamp : 0) - (b.timestamp ? b.timestamp : 0);
				}
				return rank;
			});
		}
		balance(leaders, guildData, false, channel);
	}
	if(showMsg){
		if(guildData.pool.find( member => member.id === joined.id  )){
			channel.send(`${name || username} has joined the ${expoName} queue! :heart:`);
		} else if(!isExpo && afterWindow){
			channel.send(`Sorry ${name || username}! Sign-ups are now closed. Adding you to the waitlist!`);
		}else{
			channel.send(`Sorry ${name || username}! All expeditions are full. Adding you to the waitlist!`);
		}
	}
}

function joinExpoReact(expoData, expoName, members, channel, username, discriminator, guildID){
  var anyError = addMemberToPool(null, members, expoData.leaders, expoData, expoName, true, channel, username, discriminator, guildID, false)
	return anyError;
}

module.exports = {
	joinReact: function(expoData, expoName, members, channel, username, discriminator, guildID){
		return joinExpoReact(expoData, expoName, members, channel, username, discriminator, guildID);
	},
  join: function (joiners, username, discriminator, channel, guildID, roster, leaders, guildData, expoName, isExpo) {
		if(!isExpo && !isguildenabled(guildID)){
			channel.send(":thumbsdown: Expeditions are disabled.");
		}else if(!isExpo && isBeforeGuildJoinWindow(guildID)){
			channel.send(":thumbsdown: You cannot join the expedition until closer to start time.");
		}else if(!joiners || joiners.length == 0){
			addMemberToPool(null, roster, leaders, guildData, expoName, isExpo, channel, username, discriminator, guildID, true)
		}else{
			joiners.forEach(function (joiner, index){
						addMemberToPool(joiner, roster, leaders, guildData, expoName, isExpo, channel, username, discriminator, guildID, true)
					})
  	}
}
};

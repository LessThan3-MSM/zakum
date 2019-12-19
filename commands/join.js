const balance = require('./balance.js').balance;
const isguildenabled = require('./timers.js').isguildenabled;

function addMemberToPool(name, message, roster, leaders, guildData){
	let user = null;
	if (name){
		const added = roster.find(member => member.name.toLowerCase() === name.toLowerCase())
		user = added ? added.id:null
	} else {
		user = message.author.username + "#" + message.author.discriminator
	}

	const joined = roster.find(member => member.id === user)
	if (!joined){
		message.channel.send(`${name || message.author.username} does not appear to be on the guild roster. Please contact your guild leader to get added to the roster.`)
	}
	if(joined.leader){
		message.channel.send(`${name || message.author.username} is a leader. Only regular members may join.`)
	}

	if(guildData.waitlist && guildData.waitlist.find( member => member.id === joined.id  )){
		message.channel.send(`Removed ${name || message.author.username} from the Zakum Expedition Finder waitlist.`)
		guildData.waitlist = guildData.waitlist.filter(member => member.id !== joined.id)
	} else if (guildData.pool.find( member => member.id === joined.id  )){
		guildData.pool = guildData.pool.filter(member => member.id !== joined.id)
		message.channel.send(`Removed ${name || message.author.username} from the Zakum Expedition Finder queue.`)
		if(guildData.waitlist && guildData.waitlist.length){
			guildData.pool.push(guildData.waitlist[0])
			guildData.waitlist = guildData.waitlist.filter(member => member !== guildData.waitlist[0])
		}
		balance(leaders, guildData, false, null)
	} else if ([...leaders, ...guildData.pool].length >= leaders.length * 10){
		message.channel.send(`Sorry ${name || message.author.username}! Looks like we've reached capacity. Adding you to the waitlist!`)
		guildData.waitlist.push(joined)
	} else {
		guildData.pool.push(joined)
		balance(leaders, guildData, false, null)
		message.channel.send(`${name || message.author.username} has joined the Zakum Expedition Finder queue! :heart:`)
	}
}

module.exports = {
  join: function (message, roster, leaders, guildData) {
		if(isguildenabled(message.guild.id)){
		message.content.split(" ").forEach(function (joiner, index){
			if(message.content.split(" ").length === 1){
				addMemberToPool(null, message, roster, leaders, guildData)
			}else if(message.content.split(" ").length > 1 && joiner.length > 1 && index !== 0){
				addMemberToPool(joiner, message, roster, leaders, guildData)
			}
		})
	}else{
		message.channel.send(":thumbsdown: Expeditions are disabled.");
	}
  }
};

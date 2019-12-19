const balance = require('./balance.js').balance;
const isguilddisabled = require('./timers.js').isguilddisabled;

function addMemberToPool(name, message, roster, waitlist, pool, leaders, groups){
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
		return;
	}
	if(joined.leader){
		message.channel.send(`${name || message.author.username} is a leader. Only regular members may use !join.`)
		return;
	}

	if(waitlist && waitlist.find( member => member.id === joined.id  )){
		message.channel.send(`Removed ${name || message.author.username} from the Zakum Expedition Finder waitlist.`)
		waitlist = waitlist.filter(member => member.id !== joined.id)
	} else if (pool.find( member => member.id === joined.id  )){
		pool = pool.filter(member => member.id !== joined.id)
		message.channel.send(`Removed ${name || message.author.username} from the Zakum Expedition Finder queue.`)
		if(waitlist && waitlist.length){
			pool.push(waitlist[0])
			waitlist = waitlist.filter(member => member !== waitlist[0])
		}
		balance(pool, leaders, groups, false, null)
		return;
	} else if ([...leaders, ...pool].length >= leaders.length * 10){
		message.channel.send(`Sorry ${name || message.author.username}! Looks like we've reached capacity. Adding you to the waitlist!`)
		waitlist.push(joined)
	} else {
		pool.push(joined)
		balance(pool, leaders, groups, false, null)
		message.channel.send(`${name || message.author.username} has joined the Zakum Expedition Finder queue! :heart:`)
	}
}

module.exports = {
  join: function (message, roster, waitlist, pool, leaders, groups) {
		if(isguilddisabled(message.guild.id)){
		message.content.split(" ").forEach(function (joiner, index){
			message.content.split(" ").length === 1 && addMemberToPool(null, message, roster, waitlist, pool, leaders, groups)
			message.content.split(" ").length > 1 && joiner.length > 1 && index !== 0 && addMemberToPool(joiner, message, roster, waitlist, pool, leaders, groups)
		})
	}else{
		message.channel.send(":thumbsdown: Expeditions are disabled.");
	}
  }
};

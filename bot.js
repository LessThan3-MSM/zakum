const Discord = require('discord.js');
const {prefix, token} = require('./config.json')
const {lt3} = require("./guilds/lt3.json")
const {MAPLE_STORY_CLASSES} = require("./constants.json")
const client = new Discord.Client();
var fs = require("fs");

let groups = [];
let pool = [];
let waitlist = [];
let leaders = [];

client.once('ready', () => {
	console.log('Ready!');
	const initialLeaders = getRoster().filter(member => member.leader)
	initialLeaders[0] && leaders.push(initialLeaders[0])
	initialLeaders[1] && leaders.push(initialLeaders[1])
});

client.on('message', message => {
	const DISCORD_ID = `${message.author.username}#${message.author.discriminator}`
	const isAdmin = getAdmins().find(admin => admin === DISCORD_ID)
	if (message.author.bot) return;
  if (message.content.substring(0,5) === `${prefix}join` && message.content.substring(0,7) !== `${prefix}joined` ) {
			const roster = getRoster()
			message.content.split(" ").forEach(function (joiner, index){
			message.content.split(" ").length === 1 && addMemberToPool(null, message, roster)
			message.content.split(" ").length > 1 && joiner.length > 1 && index !== 0 && addMemberToPool(joiner, message, roster)
		})
	}

	if (message.content.substring(0,4) === `${prefix}add` && isAdmin){
		const content = message.content.split(" ")
		if(content.length !== 5) {
			message.channel.send("Invalid member add format. Example: \`!add Horntail#1234 Horntail Bowmaster 5 \`")
			return;
		}
		if (content[1].split("#").length !== 2){
			message.channel.send("Invalid Discord ID. Example: \`Horntail#1234\`")
			return;
		}
		const member = {"id":content[1],"name":content[2],"rank":parseInt(content[4]),"role":content[3],"leader":false}
		const roster = getRoster()
		if (roster.find(person => person.name.toLowerCase() === member.name.toLowerCase() )){
			message.channel.send(`${member.name} already exists on the LessThan3 guild roster!`)
			return;
		}
		roster.push(member)
		console.log(roster)

		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
		    if (err) {
		        console.error(err);
		        return;
		    };
		    message.channel.send(`Successfully added ${member.name} to the LessThan3 guild roster!`)
		});
	}

	if (message.content.substring(0,7) === `${prefix}remove` && isAdmin){
		// make this better
		const content = message.content.split(" ")
		const kicked = content[1] && content[1].toLowerCase().trim();
		const roster = getRoster().filter(member => member.name.toLowerCase() !== kicked)
		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
				if (err) {
						console.error(err);
						return;
				};
				message.channel.send(`Successfully removed ${kicked} from the LessThan3 guild roster!`)
		});
	}

	if (message.content === `${prefix}lt3` || message.content === `${prefix}roster`) {
		let roster = getRoster()
		let rosterMsg = ""
		roster = roster.map(member => member.name).sort()
		roster.forEach(member => rosterMsg += member + " " )
		message.channel.send(`${rosterMsg} (${roster.length})`)
	}

	if (message.content === `${prefix}groups`) {
		const group1 = formatGroupMessage("Group 1", groups[0] || pool)
		const group2 = formatGroupMessage("Group 2", groups[1])
		const waitlistGroup = formatGroupMessage("Waitlist", waitlist)
		const differenceMsg = formatDifferenceMessage(computeDifference(groups[0], groups[1], true))
		let msg = `Group 1: ${group1} (${group1.length})`
		if (groups[1] && groups[1].length){
			msg += `\nGroup 2: ${group2} (${group2.length})`
		}
		if (waitlist && waitlist.length){
			msg += `\nWaitlist: ${waitlistGroup} (${waitlistGroup.length})`
		}
		console.log("```" + msg + "```")
		message.channel.send("```" + msg + "```")
		groups[1] && groups[1].length && message.channel.send(`\`${differenceMsg}\``)
	}

	if (message.content.substring(0,5) === `${prefix}pool` || message.content.substring(0,7) === `${prefix}joined`) {
		pool.length && message.channel.send(pool.map(joined => joined.name).sort())
	}

	if (message.content.substring(0,6) === `${prefix}reset` && isAdmin) {
		pool = [];
		groups = [];
		waitlist = [];
	}

	if (message.content.substring(0,5) === `${prefix}find` && isAdmin) {
		const personToFind = message.content.split(" ")[1].toLowerCase()
		let member = null
		if (personToFind){
		 member = getRoster().find(member => member.name.toLowerCase() === personToFind)
		}
		member ? message.channel.send(JSON.stringify(member)) : message.channel.send(`Can't find ${personToFind} on the guild roster.`)
	}

	if (message.content.substring(0,8) === `${prefix}promote` && isAdmin) {
		if (leaders.length === 2){
			message.channel.send(`Zakum can't do this! There are already two expedition leaders.`)
			return;
		}
		const name = message.content.split(" ")[1]
		let roster = getRoster()
		let promoted = roster.find(member => member.name.toLowerCase() === name.toLowerCase())
		promoted.leader = true
		leaders.push(promoted)
		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
		    if (err) {
		        console.error(err);
		        return;
		    };
		    message.channel.send(`Promoted ${name} to expedition leader!`)
		});
	}

	if (message.content.substring(0,7) === `${prefix}demote` && isAdmin) {
		const name = message.content.split(" ")[1]
		let roster = getRoster()
		let demoted = roster.find(member => member.name.toLowerCase() === name.toLowerCase())
		demoted.leader = false
		leaders = leaders.filter(leader => member.name.toLowerCase() !== name.toLowerCase())
		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
				if (err) {
						console.error(err);
						return;
				};
				message.channel.send(`Removed ${name} from expedition leaders!`)
		});
	}

	if(message.content.substring(0,6) === `${prefix}class`){
		const args = message.content
		const req = args.split(" ").slice(1).join('')
		const roster = getRoster()
		const member = roster.find(member => member.name.toLowerCase() === req.toLowerCase())

		if(member && member.name.toLowerCase().includes(req.toLowerCase())){
			message.channel.send(`${member.name} plays ${member.role.substring(0,1).toUpperCase() + member.role.substring(1)}. That's a really cool class!`)
			return;
		}

		if(!MAPLE_STORY_CLASSES.includes(req.toLowerCase())){
			message.channel.send(`Zakum tried his best but does not think that ${req} exists in MapleStory M.`)
			return;
		}

		const classList = roster.filter(member => member.role.toLowerCase() === req.toLowerCase()).map(member => member.name)
		classList && classList.length ? message.channel.send(`${classList.join(', ')} (${classList.length})`) : message.channel.send(`Zakum could not locate any guild members that play ${req}.`)
	}

});

function formatGroupMessage(name, group) {
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

function balance(pool, message){
	groups[0] = [];
	groups[1] = [];
	if (pool.length <= 8){
		groups[0] = [leaders[0], leaders[1], ...pool]
	} else {
		message.channel.send("Zakum has detected two groups! Balancing groups...")
		let difference = 1000;
		let g0 = [leaders[0]]
		let g1 = [leaders[1]]
		let poolToJoin = pool.filter(person => person !== leaders[0] && person !== leaders[1]).sort((a,b) => b.rank-a.rank)

		while(poolToJoin.length){
			let diff = computeDifference(g0, g1, false)
			var max = poolToJoin.sort((a,b) => b.rank-a.rank)[0].rank
			if(g0.length === 1 && g1.length === 1){
				const memberToJoin = poolToJoin.find(member => member.rank === max)
				g0.push(memberToJoin)
				poolToJoin = poolToJoin.filter(member => member !== memberToJoin)
			}
			else if (g0.length === 10){
				const memberToJoin = poolToJoin.find(member => member.rank === max)
				g1.push(memberToJoin)
				poolToJoin = poolToJoin.filter(member => member !== memberToJoin)
			}
			else if (g1.length === 10){
				const memberToJoin = poolToJoin.find(member => member.rank === max)
				g0.push(memberToJoin)
				poolToJoin = poolToJoin.filter(member => member !== memberToJoin)
			}
			else if (diff > 0) {
				const memberToJoin = poolToJoin.find(member => member.rank === max)
				g1.push(memberToJoin)
				poolToJoin = poolToJoin.filter(member => member !== memberToJoin)
			}
			else {
				const memberToJoin = poolToJoin.find(member => member.rank === max)
				g0.push(memberToJoin)
				poolToJoin = poolToJoin.filter(member => member !== memberToJoin)
			}
		}
		groups[0] = g0
		groups[1] = g1
	}
}

function computeDifference(group1, group2, abs){
	const g1 = group1 && group1.reduce(function (acc, obj) { return acc + obj.rank; }, 0);
	const g2 = group2 && group2.reduce(function (acc, obj) { return acc + obj.rank; }, 0);
	return abs ? Math.abs(g1-g2) : (g1-g2)
}

function getRoster(){
	return JSON.parse(fs.readFileSync('./guilds/lt3.json', 'utf8')).lt3
}

function getAdmins(){
	return JSON.parse(fs.readFileSync('./config.json', 'utf8')).admins
}

function addMemberToPool(name, message, roster){
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

	if(waitlist && waitlist.find( member => member.id === joined.id  )){
		message.channel.send(`Removed ${name || message.author.username} from the Zakum Expedition Finder waitlist.`)
		waitlist = waitlist.filter(member => member.id !== joined.id)
	}
	else if (pool.find( member => member.id === joined.id  )){
		pool = pool.filter(member => member.id !== joined.id)
		message.channel.send(`Removed ${name || message.author.username} from the Zakum Expedition Finder queue.`)
		if(waitlist && waitlist.length){
			pool.push(waitlist[0])
			waitlist = waitlist.filter(member => member !== waitlist[0])
		}
		balance(pool, message)
		return;
	} else if (groups[0] && groups[1] && groups[0].length === 10 && groups[1].length === 10){
		message.channel.send(`Sorry ${name || message.author.username}! Looks like we've reached capacity. Adding you to the waitlist!`)
		waitlist.push(joined)
		return;
	} else {
		pool.push(joined)
		balance(pool, message)
		message.channel.send(`${name || message.author.username} has joined the Zakum Expedition Finder queue! :heart:`)
	}
}

client.login(token);

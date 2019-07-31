const Discord = require('discord.js');
const {prefix, token} = require('./config.json')
const {lt3} = require("./guilds/lt3.json")
const {MAPLE_STORY_CLASSES} = require("./constants.json")
const client = new Discord.Client();

/* importing functions from the commands dir */
var add = require('./commands/add.js');
var remove = require('./commands/remove.js');

var fs = require("fs");
var CronJob = require('cron').CronJob;
var serverTimeZone = 'America/Anchorage'; //This is Scania's Server time. Modify as needed.
var timerChannels = require ('./timerchannels.json');
const commands = require ('./commands.json');

let groups = {};
let pool = [];
let waitlist = [];
let leaders = [];

client.once('ready', () => {
	console.log('Ready!');
	leaders = getRoster().filter(member => member.leader);
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
		let roster = getRoster();
		add.addCommand(message, roster); // function located in /commands/add.js
	}

	if (message.content.substring(0,7) === `${prefix}remove` && isAdmin){
		let roster = getRoster();
		remove.removeCommand(message, roster); // function located in /commands/remove.js
	}

	if (message.content === `${prefix}lt3` || message.content === `${prefix}roster`) {
		let roster = getRoster()
		let rosterMsg = ""
		roster = roster.map(member => member.name).sort()
		roster.forEach(member => rosterMsg += member + " " )
		message.channel.send(`${rosterMsg} (${roster.length})`)
	}

	if (message.content === `${prefix}groups`) {
		const groupSize = Object.keys(groups).length;
		let msg = [];
		for(i=1; i <= groupSize; i++){
			var currGroup = groups['group'+i];
			msg.push(`Group ${i}: ${formatGroupMessage(currGroup)} (Count: ${currGroup.length}, Strength: ${totalRank(currGroup)})`)
		}
		if (waitlist && waitlist.length){
			msg.push(`Waitlist: ${formatGroupMessage(waitlist)} (Count: ${waitlist.length}, Strength: ${totalRank(waitlist)})`)
		}
		msg = msg.join("\n")
		message.channel.send(msg)
		message.channel.send(formatDifferenceMessage())
	}

	if (message.content.substring(0,5) === `${prefix}pool` || message.content.substring(0,7) === `${prefix}joined`) {
		pool.length && message.channel.send(pool.map(joined => joined.name).sort())
	}

	if (message.content.substring(0,6) === `${prefix}reset` && isAdmin) {
		pool = [];
		groups = {};
		waitlist = [];
	}

	if (message.content.substring(0,5) === `${prefix}find` && isAdmin) {
		const personToFind = message.content.split(" ")[1]
		if (!personToFind) {
			message.channel.send(`No input, please use like this: !find <IGN>`)
			return;
		}
		const foundMember = getRoster().find(member => member.name.toLowerCase() === personToFind.toLowerCase())
		foundMember ? message.channel.send(JSON.stringify(foundMember)) : message.channel.send(`Zakum can't find ${personToFind} on the guild roster.`)
	}

	if (message.content.substring(0,8) === `${prefix}balance` && isAdmin) {
		message.channel.send(`Rebalancing...`)
		balance(pool, message)
	}

	if (message.content.substring(0,8) === `${prefix}promote` && isAdmin) {
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
		leaders = leaders.filter(leader => leader.name.toLowerCase() !== name.toLowerCase())
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

	if(message.content.substring(0,11) === `${prefix}timerChAdd`){
		if(!isAdmin){
			message.channel.send(`Zakum is unable to acquiesce to the demands of a regular user.`);
		}else{
			addTimerCh(message.channel);
		}
	}else if(message.content.substring(0,14) === `${prefix}timerChRemove`){
		if(!isAdmin){
			message.channel.send(`Zakum is unable to acquiesce to the demands of a regular user.`);
		}else{
			removeTimerCh(message.channel);
		}
	}else if(message.content.substring(0,12) === `${prefix}timerChList`){
		message.channel.send('['+timerChannels.toString()+']');
	}

	if(message.content.substring(0,9).toLowerCase() === `${prefix}commands`){
		listCommands(message.channel, isAdmin);
	}

});

function formatGroupMessage(group) {
	return group ? group.sort((a,b) => b.rank - a.rank).map(member => member.name).join(', '):[]
}

function formatDifferenceMessage(){
	let difference = computeDifference();
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
	if(pool.length <= 10){
		groups['group1'] = pool;
		return
	}
	let leaders = pool.filter(member => member.leader).sort((a,b) => b.rank-a.rank); 												 // gimmie my leaders sorted by rank
	let bishops = pool.filter(member => member.role.toLowerCase() == 'bishop').sort((a,b) => b.rank-a.rank); // gimmie my bishops sorted by rank
	let poolToJoin = pool.filter(member => !member.leader && member.role.toLowerCase() != 'bishop') 				 // gimmie my non-leaders/non-bishops
	let groupCount = initializeGroups(leaders, bishops);
	bishops = bishops.filter(member => !leaders.includes(member)) // update bishops to exclude leaders

	// ALLOCATION
	for(var group in groups){ groups[group].push(leaders.pop()) } // allocate leaders
	for(var group in groups){
		if(!groups[group].map(member => member.role.toLowerCase()).includes('bishop') && bishops.length > 0) groups[group].push(bishops.pop()) // allocate bishops		
	}
		
	poolToJoin = poolToJoin.concat(leaders).concat(bishops).sort((a,b) => b.rank-a.rank); // add unused leaders and bishops back into pool and sort by rank

	// MESSAGE GROUP STATUS
	let msg = "Zakum has detected " + groupCount + " " + maybePluralize(groupCount, 'group') + "!";
	if(groupCount > 1){ 
		msg = msg.concat(" Balancing groups...") 
	}
	message.channel.send(msg)

	/*
		Group every else by rank, key is rank and value is array of members with corresponding rank
		shape looks like
		{
			7: [{},{},{}]
			8: [{},{}]
			12: [{}]
		}
	*/
	let ranked = poolToJoin.reduce(function(rv, x) {
	  (rv[x['rank']] = rv[x['rank']] || []).push(x);
	  return rv;
	}, {});
	let rankLevels = Object.keys(ranked).sort(function(a,b){return b-a}) // pull out available levels

	// Iterate through each rank level, shuffle the member belonging to the rank, then delegate them to the group with the lowest point total
	rankLevels.forEach(function(rank){
		shuffle(ranked[rank]).forEach(function(selected){ // Make the results more unpredictable but still balanced
			var foundGroup = false;
			// groupsPrioritized().forEach(function(group){ // go through all the groups in order of priority
			for(let group of groupsPrioritized()){ 
				// if a max count hasn't been reached, dump them in
				if(groups[group].length < 10){
					groups[group].push(selected);
					break;
				}
			};
		})
	})
	// generate waitlist
	waitlist = pool.filter(member => !flattenGroupsIds().includes(member.id))
}

function initializeGroups(leaders, bishops){
	let groupsBySize = Math.ceil(pool.length/7);
	let maxGroups = Math.min(leaders.length, bishops.length, groupsBySize);
	for(i=1; i <= maxGroups; i++){ groups['group'+i.toString()]=[] }
	return Object.keys(groups).length;
 }

function flattenGroupsIds(){
	return Object.values(groups).reduce(function(acc, obj){return acc.concat(obj)}).map(member => member.id);
}

function maybePluralize(count, noun){
  return count > 1 ? noun.concat('s') : noun;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

// always chooses group with lowest total rank
function groupsPrioritized(){
	let lowestRank = [];
	for(var group in groups){
		lowestRank.push([group, groups[group]]); // ex: ['group1', [{},{}]]
	}
	return lowestRank.sort((a,b) => totalRank(a[1]) - totalRank(b[1])).map(g => g[0]);
}

function computeDifference(){
	let ranks = Object.values(groups).map(g => totalRank(g))
	return Math.max(...ranks) - Math.min(...ranks)
}

function totalRank(group){
	return group.reduce(function (acc, obj) { return acc + obj.rank; }, 0);
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
	} else {
		pool.push(joined)
		balance(pool, message)
		message.channel.send(`${name || message.author.username} has joined the Zakum Expedition Finder queue! :heart:`)
	}
}

client.login(token);

/************TIMERS******************/
/** Timers MUST be global and cannot be inside a JS method. This puts them out of scope.**/
/** This REQUIRES cron npm to be installed **/

/** Tommy - feel free to move wherever. Could include a file? Not sure how that works. To Test! **/
//17:30 server time post a message!

var expoMsg = '@everyone I am Zakumbot, the expedition group assistant-koom! Type !join to sign up for expeditions and type the command again to leave.';
var expoTimer = new CronJob('30 17 * * *', function(){
			for(var i = 0; i < timerChannels.length; i++){
				var channel = client.channels.get(timerChannels[i]);
				if(channel != undefined){
					channel.send(expoMsg);
				}
			}
}, null, true, serverTimeZone);

expoTimer.start();

function addTimerCh(channel){
	if(timerChannels.indexOf(channel.id) === -1) {
		timerChannels.push(channel.id);
		writeToTimerFile(channel);
    } else {
		channel.send(':scream: This channel already exists and cannot be added again.');
	}
}

function removeTimerCh(channel){
	var removed = false;
	timerChannels = timerChannels.filter(function(value, index, arr){
		if(value == channel.id){
			removed = true;
		}
		return value != channel.id;
	});
	if(removed){
		writeToTimerFile(channel);
	} else {
		channel.send(':scream: This channel does not currently exist and cannot be removed.');
	}
}

function writeToTimerFile(channel){
	var exported = true;
	require('fs').writeFile(
		'./timerchannels.json', JSON.stringify(timerChannels, null, 4), 'utf-8',

    function (err) {
        if (err) {
            channel.send(':scream: Unable to add timer channel.');
			exported = false;
        }
    }

	);

	if(exported){
		channel.send(':thumbsup: Zakum has successfully modified the channel list.');
	}
}

function listCommands(channel, isUserAdmin){
	let helpMsg = '__Zakum Commands__ \n';
	const commandsCanAccess = !isUserAdmin ? commands.filter(command => command.admin === false) : commands
	commandsCanAccess.forEach(command => helpMsg += `**!${command.name}** ${command.required.length && `**{${command.required.join(", ")}}**`}  : ${command.description} \n` )
	channel.send(helpMsg);
}

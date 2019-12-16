const Discord = require('discord.js');
const {prefix, token} = require('./config.json')
const {lt3} = require("./guilds/lt3.json")
const {MAPLE_STORY_CLASSES} = require("./constants.json")
const client = new Discord.Client();

/* importing functions from the commands dir */
const add = require('./commands/add.js').addCommand;
const demote = require('./commands/demote.js').demoteCommand;
const find = require('./commands/find.js').findCommand;
const groupCommand = require('./commands/groups.js').groupCommand;
const postRoster = require('./commands/postRoster.js').postRoster;
const promote = require('./commands/promote.js').promoteCommand;
const remove = require('./commands/remove.js').removeCommand;
const swap = require('./commands/swap.js').swap;
const update = require('./commands/update.js').update;
const leaderboard = require('./commands/leaderboard.js').leaderboard;
const listCommands = require('./commands/commands.js').listCommands;

var fs = require("fs");
var CronJob = require('cron').CronJob;
var serverTimeZone = 'Pacific/Pitcairn'; //This is Scania's Server time. Modify as needed.
var timerChannels = require ('./timerchannels.json');

let groups = [];
let pool = [];
let waitlist = [];
let leaders = [];

client.once('ready', () => {
	console.log('Ready!');
	leaders = getRoster().filter(member => member.leader)
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
		add(message, roster);
	}

	if (message.content.substring(0,7) === `${prefix}remove` && isAdmin){
		let roster = getRoster();
		remove(message, roster);
	}

	if (message.content === `${prefix}lt3` || message.content === `${prefix}roster`) {
		// probably should just remove the `${prefix}lt3` above or change it to
		// import from ./guilds/{filename} strip the .json for porability and customization for other guilds
		let roster = getRoster()
		postRoster(message, roster);
	}

	if (message.content === `${prefix}groups`) {
		groupCommand(message, groups, pool, waitlist, leaders);
	}

	if (message.content.substring(0,5) === `${prefix}pool` || message.content.substring(0,7) === `${prefix}joined`) {
		pool.length && message.channel.send(pool.map(joined => joined.name).sort())
	}

	if (message.content.substring(0,6) === `${prefix}reset` && isAdmin) {
		pool = [];
		groups = [];
		waitlist = [];
	}

	if (message.content.substring(0,5) === `${prefix}find`) {
		let roster = getRoster();
		find(message, roster);
	}

	if (message.content.substring(0,8) === `${prefix}balance` && isAdmin) {
		message.channel.send(`rebalancing...`);
		balance(pool, message);
	}

	if (message.content.substring(0,8) === `${prefix}promote` && isAdmin) {
		let roster = getRoster();
		promote(message, roster, leaders);
	}

	if (message.content.substring(0,8) === `${prefix}leaders` && isAdmin) {
		let roster = getRoster();
		message.channel.send(roster.filter(member => member.leader).map(member => member.name).join(", "));
	}

	if (message.content.substring(0,7) === `${prefix}demote` && isAdmin) {
		const name = message.content.split(" ")[1]
		leaders = leaders.filter(member => member.name.toLowerCase() !== name.toLowerCase())
		demote(message, getRoster());
	}

	if (message.content.substring(0,12) === `${prefix}leaderboard`) {
		let roster = getRoster()
		leaderboard(message, roster)
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

	if(message.content.substring(0,5).toLowerCase() === `${prefix}swap` && isAdmin){
		swap(message, groups)
	}

	if(message.content.substring(0,7).toLowerCase() === `${prefix}update` && isAdmin){
		update(message, getRoster(), MAPLE_STORY_CLASSES)
	}
});

function balance(pool, message){
		groups = [];
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

function totalRank(group){
	return group.reduce(function (acc, obj) { return acc + obj.rank * (obj.multiplier || 1); }, 0);
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
	} else if ([...leaders, ...pool].length >= leaders.length * 10){
		message.channel.send(`Sorry ${name || message.author.username}! Looks like we've reached capacity. Adding you to the waitlist!`)
		waitlist.push(joined)
		return;
	} else {
		if(joined.leader) return;
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

var expoMsg = '@everyone I am Zakumbot, the expedition group assistant-koom! Type !join to sign up for expeditions and type the command again to leave. Expedition groups are assembled at :25 and waitlist invites start at :30!';

var expoTimer = new CronJob('30 17 * * *', function(){
			for(var i = 0; i < timerChannels.length; i++){
				var channel = client.channels.get(timerChannels[i]);
				if(channel != undefined){
					pool = [];
					groups = [];
					waitlist = [];
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

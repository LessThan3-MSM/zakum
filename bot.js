const Discord = require('discord.js');
const client = new Discord.Client();

const {PREFIX, ADMIN_ROLE, MAPLE_STORY_CLASSES} = require("./resources/constants.json")
const {TOKEN} = require('./resources/config.json')

/* importing functions from the commands dir */
const add = require('./commands/add.js').addCommand;
const balance = require('./commands/balance.js').balance;
const findByClass = require('./commands/class.js').findByClass;
const listCommands = require('./commands/commands.js').listCommands;
const demote = require('./commands/demote.js').demoteCommand;
const find = require('./commands/find.js').findCommand;
const groupCommand = require('./commands/groups.js').groupCommand;
const join = require('./commands/join.js').join;
const joined = require('./commands/joined.js').joined;
const leaderboard = require('./commands/leaderboard.js').leaderboard;
const leadersCommand = require('./commands/leaders.js').leaders;
const postRoster = require('./commands/postRoster.js').postRoster;
const promote = require('./commands/promote.js').promoteCommand;
const remove = require('./commands/remove.js').removeCommand;
const reset = require('./commands/reset.js').reset;
const swap = require('./commands/swap.js').swap;
const addTimerCh = require('./commands/timers.js').addTimerCh;
const listTimerCh = require('./commands/timers.js').listTimerCh;
const removeTimerCh = require('./commands/timers.js').removeTimerCh;
const getTimerCh = require('./commands/timers.js').getTimerCh;
const update = require('./commands/update.js').update;

var fs = require("fs");

let groups = [];
let pool = [];
let waitlist = [];

client.on('message', message => {
	if (message.author.bot) return;

	if(message.content.substring(0, PREFIX.length) === PREFIX){
		const isAdmin = isGuildAdmin(message.member._roles, message.guild.id);
		var commands = message.content.substring(PREFIX.length).toLowerCase().split(' ');

		switch(commands[0]){
			case "pool":
			case "joined":
				joined(message, pool);
				return;
			case "join":
				join(message, getRoster(message), waitlist, pool, getLeaders(message), groups);
				return;
			case "roster":
				postRoster(message, getRoster(message));
				return;
			case "groups":
				groupCommand(message, groups, pool, waitlist, getLeaders(message));
				return;
			case "find":
				find(message, getRoster(message));
				return;
			case "leaderboard":
				leaderboard(message, getRoster(message))
				return;
			case "class":
				findByClass(message, getRoster(message), MAPLE_STORY_CLASSES);
				return;
			case "timerchlist":
				listTimerCh(message.channel);
				return;
			case "commands":
				listCommands(message.channel, isAdmin);
				return;
			}

			if(isAdmin){
				switch(commands[0]){
					case "add":
						add(message, getRoster(message), message.guild.id);
						return;
					case "timerchadd":
						addTimerCh(message);
						return;
					case "timerchremove":
						removeTimerCh(message);
						return;
					case "remove":
						remove(message, getRoster(message), message.guild.id);
						return;
					case "reset":
						reset(message.channel, pool, groups, waitlist);
						return;
					case "balance":
						balance(pool, getLeaders(message), groups, true, message.channel);
						return;
					case "promote":
						promote(message, getRoster(message), getLeaders(message), message.guild.id);
						return;
					case "leaders":
						leadersCommand(message.channel, getRoster(message));
						return;
					case "demote":
						demote(message, getRoster(message), getLeaders(message), message.guild.id);
						return;
					case "swap":
						swap(message, groups, waitlist)
						return;
					case "update":
						update(message, getRoster(message), MAPLE_STORY_CLASSES)
						return;
					}
				}

				message.channel.send("Zakum either does not recognize that command, or you are not privileged as a " + ADMIN_ROLE + ".");

			}
});

function getLeaders(message){
	return getRoster(message).filter(member => member.leader);
}

function getRoster(message){
	var roster;
	try{
		roster = JSON.parse(fs.readFileSync('./guilds/' + message.guild.id +'.json', 'utf8')).members;
	} catch (err) {
		roster = createNewGuild(message.guild.id, message.channel);
	}

	return roster;
}

function createNewGuild(guildID, channel){
	var roster = [];
	fs.writeFileSync("./guilds/" + guildID + ".json", JSON.stringify({"members":roster}, null, 4), function (err) {
		if (err){
			channel.send(":scream: We were unable to find or create a roster. Please contact an admin.");
		}
	});
	return roster;
}

function isGuildAdmin(roleList, guildID){
	for(var i = 0; i < roleList.length; i++){
		if(ADMIN_ROLE === client.guilds.get(guildID).roles.get(roleList[i]).name){
			return true;
		}
	}
	return false;
}

client.login(TOKEN);

/************TIMERS******************/
/** Timers MUST be global and cannot be inside a JS method. This puts them out of scope.**/
var CronJob = require('cron').CronJob; /** Timers REQUIRE cron npm to be installed **/

var serverTimeZone = 'Pacific/Pitcairn'; //This is Scania's Server time. Modify as needed.
var expoMsg = '@everyone I am Zakumbot, the expedition group assistant-koom! Type !join to sign up for expeditions and type the command again to leave. Expedition groups are assembled at :25 and waitlist invites start at :30!';

var expoTimer = new CronJob('30 17 * * *', function(){
	var timerChannels = getTimerCh();
			for(var i = 0; i < timerChannels.length; i++){
				var channel = client.channels.get(timerChannels[i]);
				if(channel != undefined){
					pool.length = 0;
					groups.length = 0;
					waitlist.length = 0;
					channel.send(expoMsg);
				}
			}
}, null, true, serverTimeZone);

expoTimer.start();

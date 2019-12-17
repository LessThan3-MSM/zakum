const Discord = require('discord.js');
const client = new Discord.Client();

const {prefix, token} = require('./config.json')
const {MAPLE_STORY_CLASSES} = require("./constants.json")

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

	const isAdmin = isGuildAdmin(message);

	if (message.author.bot) return;

  if (message.content.substring(0,5) === `${prefix}join` && message.content.substring(0,7) !== `${prefix}joined` ) {
		join(message, getRoster(message.guild.id), waitlist, pool, getLeaders(message.guild.id), groups);
	}

	if (message.content.substring(0,4) === `${prefix}add` && isAdmin){
		add(message, getRoster(message.guild.id));
	}

	if (message.content.substring(0,7) === `${prefix}remove` && isAdmin){
		remove(message, getRoster(message.guild.id));
	}

	if (message.content === `${prefix}lt3` || message.content === `${prefix}roster`) {
		postRoster(message, getRoster(message.guild.id));
	}

	if (message.content === `${prefix}groups`) {
		groupCommand(message, groups, pool, waitlist, getLeaders(message.guild.id));
	}

	if (message.content.substring(0,5) === `${prefix}pool` || message.content.substring(0,7) === `${prefix}joined`) {
		joined(message, pool);
	}

	if (message.content.substring(0,6) === `${prefix}reset` && isAdmin) {
			reset(message.channel, pool, groups, waitlist);
	}

	if (message.content.substring(0,5) === `${prefix}find`) {
		find(message, getRoster(message.guild.id));
	}

	if (message.content.substring(0,8) === `${prefix}balance` && isAdmin) {
		balance(pool, getLeaders(message.guild.id), groups, true, message.channel);
	}

	if (message.content.substring(0,8) === `${prefix}promote` && isAdmin) {
		promote(message, getRoster(message.guild.id), getLeaders(message.guild.id), message.guild.id);
	}

	if (message.content.substring(0,8) === `${prefix}leaders` && isAdmin) {
		leadersCommand(message.channel, getRoster(message.guild.id));
	}

	if (message.content.substring(0,7) === `${prefix}demote` && isAdmin) {
		demote(message, getRoster(message.guild.id), getLeaders(message.guild.id), message.guild.id);
	}

	if (message.content.substring(0,12) === `${prefix}leaderboard`) {
		leaderboard(message, getRoster(message.guild.id))
	}

	if(message.content.substring(0,6) === `${prefix}class`){
		findByClass(message, getRoster(message.guild.id), MAPLE_STORY_CLASSES);
	}

	if(message.content.substring(0,11) === `${prefix}timerChAdd`){
		addTimerCh(message, isAdmin);
	}else if(message.content.substring(0,14) === `${prefix}timerChRemove`){
		removeTimerCh(message, isAdmin);
	}else if(message.content.substring(0,12) === `${prefix}timerChList`){
		listTimerCh(message.channel);
	}

	if(message.content.substring(0,9).toLowerCase() === `${prefix}commands`){
		listCommands(message.channel, isAdmin);
	}

	if(message.content.substring(0,5).toLowerCase() === `${prefix}swap` && isAdmin){
		swap(message, groups, waitlist)
	}

	if(message.content.substring(0,7).toLowerCase() === `${prefix}update` && isAdmin){
		update(message, getRoster(message.guild.id), MAPLE_STORY_CLASSES)
	}
});

function getLeaders(guildID){
	return getRoster(guildID).filter(member => member.leader);
}

function getRoster(guildID){
	return JSON.parse(fs.readFileSync('./guilds/' + guildID +'.json', 'utf8')).members
}

function isGuildAdmin(message){
	var admins = getAdmins(message.guild.id);
	if(admins != undefined){
		const discordID = `${message.author.username}#${message.author.discriminator}` //user's discord ID
		return admins.find(admin => admin === discordID)
	} else {
		return false;
	}
}

function getAdmins(guildID){
	var admins = JSON.parse(fs.readFileSync('./guilds/admins.json', 'utf8'));
	return admins[guildID];
}

client.login(token);

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

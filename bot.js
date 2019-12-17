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

	const isAdmin = isGuildAdmin(message.member._roles, message.guild.id);

  if (message.content.substring(0,5) === `${PREFIX}join` && message.content.substring(0,7) !== `${PREFIX}joined` ) {
		join(message, getRoster(message.guild.id), waitlist, pool, getLeaders(message.guild.id), groups);
	}

	if (message.content.substring(0,4) === `${PREFIX}add` && isAdmin){
		add(message, getRoster(message.guild.id));
	}

	if (message.content.substring(0,7) === `${PREFIX}remove` && isAdmin){
		remove(message, getRoster(message.guild.id));
	}

	if (message.content === `${PREFIX}lt3` || message.content === `${PREFIX}roster`) {
		postRoster(message, getRoster(message.guild.id));
	}

	if (message.content === `${PREFIX}groups`) {
		groupCommand(message, groups, pool, waitlist, getLeaders(message.guild.id));
	}

	if (message.content.substring(0,5) === `${PREFIX}pool` || message.content.substring(0,7) === `${PREFIX}joined`) {
		joined(message, pool);
	}

	if (message.content.substring(0,6) === `${PREFIX}reset` && isAdmin) {
			reset(message.channel, pool, groups, waitlist);
	}

	if (message.content.substring(0,5) === `${PREFIX}find`) {
		find(message, getRoster(message.guild.id));
	}

	if (message.content.substring(0,8) === `${PREFIX}balance` && isAdmin) {
		balance(pool, getLeaders(message.guild.id), groups, true, message.channel);
	}

	if (message.content.substring(0,8) === `${PREFIX}promote` && isAdmin) {
		promote(message, getRoster(message.guild.id), getLeaders(message.guild.id), message.guild.id);
	}

	if (message.content.substring(0,8) === `${PREFIX}leaders` && isAdmin) {
		leadersCommand(message.channel, getRoster(message.guild.id));
	}

	if (message.content.substring(0,7) === `${PREFIX}demote` && isAdmin) {
		demote(message, getRoster(message.guild.id), getLeaders(message.guild.id), message.guild.id);
	}

	if (message.content.substring(0,12) === `${PREFIX}leaderboard`) {
		leaderboard(message, getRoster(message.guild.id))
	}

	if(message.content.substring(0,6) === `${PREFIX}class`){
		findByClass(message, getRoster(message.guild.id), MAPLE_STORY_CLASSES);
	}

	if(message.content.substring(0,11) === `${PREFIX}timerChAdd`){
		addTimerCh(message, isAdmin);
	}else if(message.content.substring(0,14) === `${PREFIX}timerChRemove`){
		removeTimerCh(message, isAdmin);
	}else if(message.content.substring(0,12) === `${PREFIX}timerChList`){
		listTimerCh(message.channel);
	}

	if(message.content.substring(0,9).toLowerCase() === `${PREFIX}commands`){
		listCommands(message.channel, isAdmin);
	}

	if(message.content.substring(0,5).toLowerCase() === `${PREFIX}swap` && isAdmin){
		swap(message, groups, waitlist)
	}

	if(message.content.substring(0,7).toLowerCase() === `${PREFIX}update` && isAdmin){
		update(message, getRoster(message.guild.id), MAPLE_STORY_CLASSES)
	}
});

function getLeaders(guildID){
	return getRoster(guildID).filter(member => member.leader);
}

function getRoster(guildID){
	return JSON.parse(fs.readFileSync('./guilds/' + guildID +'.json', 'utf8')).members
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

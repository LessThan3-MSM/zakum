const Discord = require('discord.js');
const client = new Discord.Client();

const {prefix, token} = require('./config.json')
const {lt3} = require("./guilds/lt3.json")
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
		join(message, getRoster(), waitlist, pool, leaders, groups);
	}

	if (message.content.substring(0,4) === `${prefix}add` && isAdmin){
		add(message, getRoster());
	}

	if (message.content.substring(0,7) === `${prefix}remove` && isAdmin){
		remove(message, getRoster());
	}

	if (message.content === `${prefix}lt3` || message.content === `${prefix}roster`) {
		postRoster(message, getRoster());
	}

	if (message.content === `${prefix}groups`) {
		groupCommand(message, groups, pool, waitlist, leaders);
	}

	if (message.content.substring(0,5) === `${prefix}pool` || message.content.substring(0,7) === `${prefix}joined`) {
		joined(message, pool);
	}

	if (message.content.substring(0,6) === `${prefix}reset` && isAdmin) {
			reset(message.channel, pool, groups, waitlist);
	}

	if (message.content.substring(0,5) === `${prefix}find`) {
		find(message, getRoster());
	}

	if (message.content.substring(0,8) === `${prefix}balance` && isAdmin) {
		balance(pool, leaders, groups, true, message.channel);
	}

	if (message.content.substring(0,8) === `${prefix}promote` && isAdmin) {
		promote(message, getRoster(), leaders);
	}

	if (message.content.substring(0,8) === `${prefix}leaders` && isAdmin) {
		leadersCommand(message.channel, getRoster());
	}

	if (message.content.substring(0,7) === `${prefix}demote` && isAdmin) {
		leaders = demote(message, getRoster(), leaders);
	}

	if (message.content.substring(0,12) === `${prefix}leaderboard`) {
		leaderboard(message, getRoster())
	}

	if(message.content.substring(0,6) === `${prefix}class`){
		findByClass(message, getRoster(), MAPLE_STORY_CLASSES);
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
		update(message, getRoster(), MAPLE_STORY_CLASSES)
	}
});

function getRoster(){
	return JSON.parse(fs.readFileSync('./guilds/lt3.json', 'utf8')).lt3
}

function getAdmins(){
	return JSON.parse(fs.readFileSync('./config.json', 'utf8')).admins
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

const Discord = require('discord.js');
const client = new Discord.Client();

const {PREFIX, ADMIN_ROLE, SERVER_TIME_ZONE} = require("./resources/constants.json")
const {TOKEN} = require('./resources/config.json')

var BOT_ADMINS = require("./resources/botadmins.json");
var MAPLE_STORY_CLASSES = require("./resources/maplestoryclasses.json")

/* importing functions from the commands dir */
const add = require('./commands/add.js').addCommand;
const balance = require('./commands/balance.js').balance;
const findByClass = require('./commands/class.js').findByClass;
const listCommands = require('./commands/commands.js').listCommands;
const demote = require('./commands/demote.js').demoteCommand;
const manageExpo = require('./commands/expo.js').manageExpo;
const deleteExpo = require('./commands/expo.js').deleteExpo;
const resetExpo = require('./commands/expo.js').resetExpo;
const getGroupExpo = require('./commands/expo.js').getGroupExpo;
const joinReact = require('./commands/join.js').joinReact;
const find = require('./commands/find.js').findCommand;
const groupCommand = require('./commands/groups.js').groupCommand;
const groupDetails = require('./commands/groups.js').groupDetails;
const join = require('./commands/join.js').join;
const joined = require('./commands/joined.js').joined;
const leaderboard = require('./commands/leaderboard.js').leaderboard;
const leadersCommand = require('./commands/leaders.js').leaders;
const postRoster = require('./commands/postRoster.js').postRoster;
const promote = require('./commands/promote.js').promoteCommand;
const remove = require('./commands/remove.js').removeCommand;
const reset = require('./commands/reset.js').reset;
const swap = require('./commands/swap.js').swap;
const move = require('./commands/move.js').move;
const addTimerCh = require('./commands/timers.js').addTimerCh;
const removeTimerCh = require('./commands/timers.js').removeTimerCh;
const getTimerCh = require('./commands/timers.js').getTimerCh;
const setTimerMsg = require('./commands/timers.js').setTimerMsg;
const listTimerMsg = require('./commands/timers.js').listTimerMsg;
const toggleexpos = require('./commands/timers.js').toggleexpos;
const update = require('./commands/update.js').update;
const setAmPmExpos = require('./commands/timers.js').setAmPmExpos;
const setWindow = require('./commands/timers.js').setWindow;
const addBotAdmin = require('./commands/botadmin.js').addBotAdmin;
const removeBotAdmin = require('./commands/botadmin.js').removeBotAdmin;
const addClass = require('./commands/manageclasses.js').addClass;
const removeClass = require('./commands/manageclasses.js').removeClass;

var fs = require("fs");

let guilds = [];

client.on('message', message => {
	if (message.author.bot) return;

	var gprefix = getGuildPrefix(message.guild.id, message.channel);

	if(message.content.substring(0, gprefix.length).toLowerCase() === gprefix.toLowerCase()){
		const isAdmin = isGuildAdmin(message.member._roles, message.guild.id, message.channel);
		const isBotAdmin = getBotAdmin(message.author.username, message.author.discriminator);

		var commands = message.content.substring(gprefix.length).split(' ').filter(Boolean);
		var theCmd = commands[0] && commands[0].toLowerCase();
		switch(theCmd){
			case "pool":
			case "joined":
				joined(message.channel, getGuildData(message.guild.id, message.channel));
				return;
			case "join":
				join(commands.slice(1), message.author.username, message.author.discriminator, message.channel, message.guild.id, getMembers(message.guild.id,message.channel), getLeaders(message.guild.id,message.channel), getGuildData(message.guild.id, message.channel), null, false);
				return;
			case "roster":
				postRoster(message.channel, getMembers(message.guild.id,message.channel));
				return;
			case "groups":
				groupCommand(message.channel, getGuildData(message.guild.id, message.channel), getLeaders(message.guild.id,message.channel));
				return;
			case "groupdetails":
				groupDetails(message.channel, getGuildData(message.guild.id, message.channel), getLeaders(message.guild.id,message.channel));
				return;
			case "find":
				find(commands.slice(1).join(" "), message.channel, getMembers(message.guild.id,message.channel));
				return;
			case "leaderboard":
				leaderboard(commands[1], message.channel, getMembers(message.guild.id,message.channel))
				return;
			case "classes":
				message.channel.send(MAPLE_STORY_CLASSES.join('\n'));
				return;
			case "class":
				findByClass(commands.slice(1).join(' '), message.channel, getMembers(message.guild.id,message.channel), MAPLE_STORY_CLASSES);
				return;
			case "commands":
				listCommands(message.channel, isAdmin, isBotAdmin);
				return;
			case "timers":
			case "info":
				listTimerMsg(message.channel, message.guild.id);
				return;
			}

			if(isAdmin){
				switch(theCmd){
					case "add":
						//added so you can add IDs with spaces.
						const msg = commands.slice(1).join(" ");
						const pound = msg.search("#");
						const space = msg.substring(pound).search(" ");
						var discordID = msg.substring(0,pound+space);
						//other commands must be shifted by same amount. messy. may be a better way to do.
						commands = msg.substring(pound+space+1).split(" ");
						add(discordID, commands[0], commands[1], commands[2], message.channel, getGuildData(message.guild.id,message.channel), message.guild.id, MAPLE_STORY_CLASSES);
						return;
					case "timerchadd":
						addTimerCh(message.channel, commands[1], message.guild.id);
						return;
					case "timerchremove":
						removeTimerCh(message.channel, commands[1], message.guild.id);
						return;
					case "remove":
						remove(commands[1],  message.channel, message.guild.id, getGuildData(message.guild.id,message.channel));
						return;
					case "reset":
						reset(getGuildData(message.guild.id, message.channel));
						message.channel.send(':thumbsup: Zakum has reset all expeditions.');
						return;
					case "balance":
						balance(getLeaders(message.guild.id,message.channel), getGuildData(message.guild.id, message.channel), true, message.channel);
						return;
					case "promote":
						promote(commands[1], message.channel, message.guild.id, getGuildData(message.guild.id, message.channel), true);
						return;
					case "leaders":
						leadersCommand(message.channel, getMembers(message.guild.id, message.channel));
						return;
					case "demote":
						demote(commands[1], message.channel, message.guild.id, getGuildData(message.guild.id, message.channel), true);
						return;
					case "move":
						move(message.channel, getGuildData(message.guild.id, message.channel), commands[1], commands[2], message.guild.id);
						return;
					case "swap":
						const firstMemberIsAdmin = isGuildAdminByName(message.guild.members, message.guild.id, message.channel, commands[1]);
						const secondMemberIsAdmin = isGuildAdminByName(message.guild.members, message.guild.id, message.channel, commands[2]);
						swap(message.channel, getGuildData(message.guild.id, message.channel), commands[1], commands[2], firstMemberIsAdmin, secondMemberIsAdmin, message.guild.id)
						return;
					case "update":
						update(commands[1], commands[2], commands.slice(3).join(" "), message.channel, message.guild.id, getGuildData(message.guild.id,message.channel), MAPLE_STORY_CLASSES)
						return;
					case "toggleexpos":
						toggleexpos(message.guild.id, message.channel);
						return;
					case "setmsg":
						setTimerMsg(commands[1], commands.slice(2).join(' '), message.channel, message.guild.id);
						return;
					case "setexpo":
						setAmPmExpos(commands[1], commands[2], message.channel, message.guild.id);
						return;
					case "setwindow":
						setWindow(commands[1], commands[2], message.channel, message.guild.id);
						return;
					case "expo":
						manageExpo(getGuildData(message.guild.id, message.channel).expos, getMembers(message.guild.id,message.channel),
							commands[1], commands[2], commands.splice(3).join(" "), message.author.username, message.author.discriminator, message.channel, message.guild.id, client.channels);
						return;
					case "export":
						writeGuildToFile(message.guild.id, getGuildData(message.guild.id, message.channel), message.channel);
						message.channel.send("Guild data successfully exported to file.");
						return;
					case "setadminrole":
						setGuildAdminRole(commands[1], message.guild.id, message.channel)
						return;
					case "setprefix":
						setGuildPrefix(commands[1], message.guild.id, message.channel);
						return;
					case "botadmins":
						message.channel.send(BOT_ADMINS.join('\n'));
						return;
					}
					if(theCmd.includes("fuck")){
						message.channel.send("Lappu is a bot.");
					}
				}

				if(isBotAdmin){
					switch(theCmd){
						case "addbotadmin":
							addBotAdmin(commands.slice(1).join(" "), BOT_ADMINS, message.channel);
							return;
						case "removebotadmin":
							removeBotAdmin(commands.slice(1).join(" "),BOT_ADMINS, message.channel);
							return;
						case "addclass":
							addClass(commands.slice(1).join(" "), MAPLE_STORY_CLASSES, message.channel);
							return;
						case "removeclass":
							removeClass(commands.slice(1).join(" "), MAPLE_STORY_CLASSES, message.channel);
							return;
					}
				}
			}
});

client.on('messageReactionAdd', (reaction, user) => {
	if (user.bot) return;
				var expos = getGuildData(reaction.message.guild.id, null).expos;

				for(var i = 0; i <expos.length; i++){
					if(reaction.message.id === expos[i].messageID){
						var isAdmin = user.lastMessage.member && isGuildAdmin(user.lastMessage.member._roles, reaction.message.guild.id, reaction.message.channel);

						if (reaction.emoji.name == '👍') {
							var anyError = joinReact(expos[i], expos[i].name, getMembers(reaction.message.guild.id, reaction.message.channel), reaction.message.channel, user.username, user.discriminator, reaction.message.guild.id);
							if(anyError){
								reaction.remove(user);
							}
							return;
						}else if(isAdmin && reaction.emoji.name == '👎'){
							return;
						}else if(isAdmin && reaction.emoji.name == '🧐'){
							getGroupExpo(expos, expos[i].name, reaction.message.channel);
						}else if(isAdmin && reaction.emoji.name == '🔁'){
							resetExpo(expos, expos[i].name, reaction.message.channel, reaction.message.channel);
						}else if(isAdmin && reaction.emoji.name == '💣'){
							deleteExpo(expos, expos[i].name, reaction.message.channel);
						}
					}
						reaction.remove(user);
				}
});

client.on('messageReactionRemove', (reaction, user) => {
	if (user.bot) return;
				var expos = getGuildData(reaction.message.guild.id, null).expos;
				for(var i = 0; i <expos.length; i++){
					if(reaction.message.id === expos[i].messageID){
						if (reaction.emoji.name == '👍') {
							joinReact(expos[i], expos[i].name, getMembers(reaction.message.guild.id, reaction.message.channel), reaction.message.channel, user.username, user.discriminator, reaction.message.guild.id);
						}
					}
				}
});

function getBotAdmin(username, discriminator){
	let uid = username + '#' + discriminator;
	let isbotadmin = BOT_ADMINS.includes(uid);
	return isbotadmin;
}

function getGuildData(guildID, channel){
		if(guilds[guildID] == undefined) {guilds[guildID] = getGuildJSON(guildID, channel)}
		return guilds[guildID];
}

function getLeaders(guildID, channel){
	return getGuildData(guildID, channel).members.filter(member => member.leader);
}

function getGuildPrefix(guildID, channel){
	var gprefix = getGuildData(guildID, channel).prefix === undefined ? PREFIX : getGuildData(guildID, channel).prefix;
	return gprefix;
}

function setGuildPrefix(gprefix, guildID, channel){
	if(gprefix.indexOf("!") != -1){
		channel.send(":scream: ! may not be included. This is automatically added after your prefix.");
	}else if(gprefix != undefined){
		var guildData = getGuildData(guildID, channel);
		guildData.prefix = gprefix + "!";
		writeGuildToFile(guildID, guildData, channel);
		channel.send(":thumbsup: Guild prefix successfully updated.");
	}else{
		channel.send(":scream: Please provide the new prefix to be used.");
	}

}

function getGuildAdminRole(guildID, channel){
	var adminRole = getGuildData(guildID, channel).adminrole == undefined ? ADMIN_ROLE : getGuildData(guildID, channel).adminrole;
	return adminRole;
}

function setGuildAdminRole(gadminrole, guildID, channel){
	if(gadminrole != undefined){
		var guildData = getGuildData(guildID, channel);
		guildData.adminrole = gadminrole;
		writeGuildToFile(guildID, guildData, channel);
		channel.send(":thumbsup: Guild admin role successfully updated.");
	}else{
		channel.send(":scream: Please provide the new admin role name to be used.");
	}
}

function getMembers(guildID, channel){
	return getGuildData(guildID, channel).members;
}

function getGuildJSON(guildID, channel){
	var guildInfo;
	try{
		guildInfo = JSON.parse(fs.readFileSync('./guilds/' + guildID +'.json', 'utf8'));
	} catch (err) {
		guildInfo = createNewGuild(guildID, channel);
	}

	return guildInfo;
}

function createNewGuild(guildID, channel){
	var newGuild = {"prefix":PREFIX, "adminrole":ADMIN_ROLE, "members":[], "pool":[],"groups":[],"waitlist":[], "expos":[]};
	writeGuildToFile(guildID, newGuild, channel);
	return newGuild;
}

function writeGuildToFile(guildID, guildInfo, channel){
	fs.writeFileSync("./guilds/" + guildID + ".json", JSON.stringify(guildInfo, null, 4), function (err) {
		if (err && channel != null){
			channel.send(":scream: We were unable to find or create guild information. Please contact an admin.");
		}
	});
}

function isGuildAdmin(roleList, guildID, channel){
	var guildAdminRole = getGuildAdminRole(guildID, channel);
	for(var i = 0; i < roleList.length; i++){
		if(guildAdminRole === client.guilds.get(guildID).roles.get(roleList[i]).name){
			return true;
		}
	}
	return false;
}

function isGuildAdminByName(memberList, guildID, channel, userName){
	if(!userName) return false;

		var guildAdminRole = getGuildAdminRole(guildID, channel);

		var aGuild = client.guilds.get(guildID);
    var guildAdminRoleID = aGuild.roles.find(role => role.name === guildAdminRole).id;
		var aUser = memberList.find(member => member.user.username && member.user.username.toLowerCase() === userName.toLowerCase());
		if(!aUser) aUser = memberList.find(member => member.nickname && member.nickname.toLowerCase() === userName.toLowerCase());
		var hasRole = aUser && aUser._roles.find(element => element === guildAdminRoleID) ? true : false;

		return hasRole;
}

client.login(TOKEN);

/************TIMERS******************/
/** Timers MUST be global and cannot be inside a JS method. This puts them out of scope.**/
var CronJob = require('cron').CronJob; /** Timers REQUIRE cron npm to be installed **/

//Expedition Timer
var expoTimer = new CronJob('0 17,9 * * *', function(){
	var timerChannels = getTimerCh();

	for(key in timerChannels) {
		var serverTime = new Date().toLocaleString("en-US", {timeZone: SERVER_TIME_ZONE});
		serverTime = new Date(serverTime);
		if((serverTime.getHours() == 17 && timerChannels[key].pmExpos) ||
				(serverTime.getHours() == 9 && timerChannels[key].amExpos)){
					var guildData = getGuildData(key, null);
					guildData.pool.length = 0;
					guildData.groups.length = 0;
					guildData.waitlist.length = 0;

					writeGuildToFile(key, guildData, null);

					for(var i =0; i< timerChannels[key].timerChannels.length; i++){
						var channel = client.channels.get(timerChannels[key].timerChannels[i]);
						if(channel != undefined){
							if(timerChannels[key].enabled){
								channel.send(timerChannels[key].enabledMsg);
							}else{
								channel.send(timerChannels[key].disabledMsg);
							}
						}
					}
				}
	}

}, null, true, SERVER_TIME_ZONE);

expoTimer.start();

//Server Reset Timer
var serverResetTimer = new CronJob('0 0 * * *', function(){
	var timerChannels = getTimerCh();

	for(key in timerChannels) {
		var guildData = getGuildData(key, null);
		guildData.pool.length = 0;
		guildData.groups.length = 0;
		guildData.waitlist.length = 0;

		writeGuildToFile(key, guildData, null);

		if(timerChannels[key].autoReset && !timerChannels[key].enabled){
				timerChannels[key].enabled = true;
		}
	}

}, null, true, SERVER_TIME_ZONE);

serverResetTimer.start();

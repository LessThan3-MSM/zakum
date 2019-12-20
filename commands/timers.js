var TIMER_LOC = "./resources/timerchannels.json";
var timerChannels = require ("." + TIMER_LOC);
const {SERVER_TIME_ZONE} = require("../resources/constants.json")

function isInGuildWindow(guildID, before){
  var notInWindow = false;
  if(timerChannels[guildID] && timerChannels[guildID].signUpWindow){
    var currServerTime = new Date().toLocaleString("en-US", {timeZone: SERVER_TIME_ZONE});
    currServerTime = new Date(currServerTime);

    let[expoTime1Hr, expoTime2Hr] = [10,18];

    var expoTime1 = new Date();
    expoTime1.setHours(expoTime1Hr);
    expoTime1.setMinutes(0);
    expoTime1.setSeconds(0);
    expoTime1.setMilliseconds(0);

    var expoTime2 = new Date();
    expoTime2.setHours(expoTime2Hr);
    expoTime2.setMinutes(0);
    expoTime2.setSeconds(0);
    expoTime2.setMilliseconds(0);

    var expoTime1End = new Date();
    expoTime1End = new Date();
    expoTime1End.setHours(expoTime1Hr + 1);
    expoTime1End.setMinutes(0);
    expoTime1End.setSeconds(0);
    expoTime1End.setMilliseconds(0);

    var expoTime2End = new Date();
    expoTime2End.setHours(expoTime2Hr + 1);
    expoTime2End.setMinutes(0);
    expoTime2End.setSeconds(0);
    expoTime2End.setMilliseconds(0);

    if(before){
      var expoTime1MinusMinutes = new Date(expoTime1);
      expoTime1MinusMinutes.setMinutes(expoTime1.getMinutes() - timerChannels[guildID].minBeforeStart)
      var expoTime2MinusMinutes = new Date(expoTime2);
      expoTime2MinusMinutes.setMinutes(expoTime2.getMinutes() - timerChannels[guildID].minBeforeStart)

      notInWindow = (timerChannels[guildID].amExpos && !(currServerTime >= expoTime1MinusMinutes && currServerTime < expoTime1End)) ||
        (timerChannels[guildID].pmExpos && !(currServerTime >= expoTime2MinusMinutes && currServerTime < expoTime2End));
    }else{
      var expoTime1PlusMinutes = new Date(expoTime1);
      expoTime1PlusMinutes.setMinutes(expoTime1.getMinutes() + timerChannels[guildID].minAfterStart)
      var expoTime2PlusMinutes = new Date(expoTime2);
      expoTime2PlusMinutes.setMinutes(expoTime2.getMinutes() + timerChannels[guildID].minAfterStart)

      notInWindow = (timerChannels[guildID].amExpos && currServerTime > expoTime1PlusMinutes && currServerTime <= expoTime1) ||
        (timerChannels[guildID].pmExpos && currServerTime > expoTime2PlusMinutes && currServerTime <= expoTime2);
    }
  }

  return notInWindow;
}

function isBeforeGuildJoinWindow(guildID){
  return isInGuildWindow(guildID, true);
}

function isAfterGuildJoinWindow(guildID){
  return isInGuildWindow(guildID, false);
}

function setWindow(message){
  if(timerChannels[message.guild.id] == undefined){
    message.channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
  }else{ //setwindow [before|after] minutes
      var commands = message.content.toLowerCase().split(' ');
      if(commands.length < 2 || (commands[1] !== 'before' && commands[1] !== 'after') || (isNaN(commands[2]))){
        message.channel.send(':scream: Usage: setwindow [before|after] minutes');
      }else{
        if(commands[1] === 'before'){
          timerChannels[message.guild.id].minBeforeStart = commands[2]
        }else if(commands[1] === 'after'){
          timerChannels[message.guild.id].minAfterStart = commands[2]
        }
        writeToTimerFile(message.channel, true);
      }
  }
}

function setAmPmExpos(message){
  if(timerChannels[message.guild.id] == undefined){
    message.channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
  }else{ //settimer am on, settimer pm off
      var commands = message.content.toLowerCase().split(' ');
      if(commands.length < 2 || (commands[1] !== 'am' && commands[1] !== 'pm' && commands[1] !== 'window') || (commands[2] !== 'on' && commands[2] !== 'off')){
        message.channel.send(':scream: Usage: setexpo [am|pm|window] [on|off]');
      }else{
        if(commands[1] === 'pm'){
          timerChannels[message.guild.id].pmExpos = commands[2] === 'on'
        }else if(commands[1] === 'am'){
          timerChannels[message.guild.id].amExpos = commands[2] === 'on'
        }else if(commands[1] === 'window'){
          timerChannels[message.guild.id].signUpWindow = commands[2] === 'on'
        }
        writeToTimerFile(message.channel, true);
      }
  }
}

function setTimerMsg(message, enabled){
    if(timerChannels[message.guild.id] == undefined){
      message.channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
    }else if(message.content.indexOf(" ") != -1){
      var msg = message.content.substring(message.content.indexOf(" ")+1);
      if(enabled){
        timerChannels[message.guild.id].enabledMsg = msg;
      }else{
        timerChannels[message.guild.id].disabledMsg = msg;
      }
      writeToTimerFile(message.channel, true);
    }else{
      message.channel.send(':scream: Please enter a message for the timer.');
    }
}

function addCh(message){
  var channel = message.content.split(" ")[1];
  if(timerChannels[message.guild.id] == undefined){
    timerChannels[message.guild.id] = {"enabled": true,
    "timerChannels": [],
    "enabledMsg": "@everyone I am Zakumbot, the expedition group assistant-koom! Type !join to sign up for expeditions and type the command again to leave.",
    "disabledMsg": "@everyone Expedition sign-ups are currently disabled.",
    "amExpos": true, "pmExpos": true, "signUpWindow": false, "minBeforeStart":"30", "minAfterStart":"30"};
  }
	if(timerChannels[message.guild.id].timerChannels.indexOf(channel) === -1) {
		timerChannels[message.guild.id].timerChannels.push(channel);
		writeToTimerFile(message.channel, true);
    } else {
		message.channel.send(':scream: This channel already exists and cannot be added again.');
	}
}

function removeCh(message){
	var removed = false;
  var channel = message.content.split(" ")[1];
  if(timerChannels[message.guild.id] != undefined){
	   timerChannels[message.guild.id].timerChannels = timerChannels[message.guild.id].timerChannels.filter(function(value, index, arr){
		     if(value == channel){
			        removed = true;
		     }
		 return value != channel;
	 });
  }

	if(removed){
		writeToTimerFile(message.channel, true);
	} else {
		message.channel.send(':scream: This channel does not currently exist and cannot be removed.');
	}
}

function writeToTimerFile(channel, msg){
	var exported = true;
	require('fs').writeFileSync(
		TIMER_LOC, JSON.stringify(timerChannels, null, 4), (err) => {
      if (err) {
          channel.send(':scream: Unable to add timer channel.');
          exported = false;
      };
	});

	if(exported && msg){
		channel.send(':thumbsup: Zakum has successfully modified the expo timer.');
	}
}

module.exports = {
  addTimerCh: function (message) {
		addCh(message);
  },
  removeTimerCh: function (message){
    removeCh(message);
  },
  getTimerCh: function(){
    return timerChannels;
  },
  toggleexpos: function(guildID, channel){
    if(timerChannels[guildID] != undefined){
      timerChannels[guildID].enabled = !timerChannels[guildID].enabled;
      writeToTimerFile(channel, false);
      var msg = timerChannels[guildID].enabled ? "enabled." : "disabled.";
      channel.send(':thumbsup: Expeditions have been ' + msg);
    }else{
      message.channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
    }
  },
  isguildenabled: function(guildID){
    return timerChannels[guildID] == undefined || timerChannels[guildID].enabled;
  },
  setTimerMsg: function(message, enabled){
    setTimerMsg(message, enabled)
  },
  listTimerMsg: function(message){
    if(timerChannels[message.guild.id] != undefined){
      var amexpos = timerChannels[message.guild.id].amExpos ? "on." : "off."
      var pmexpos = timerChannels[message.guild.id].pmExpos ? "on." : "off."
      var expos = timerChannels[message.guild.id].enabled ? "enabled." : "disabled."
      var window = timerChannels[message.guild.id].signUpWindow ? "enabled" : "disabled."
      message.channel.send("The AM Expo timer is "+ amexpos +
      "\nThe PM Expo timer is "+pmexpos+
      "\nExpedition sign-ups are "+ expos +
      "\nExpedition join windows are " + window +
      (timerChannels[message.guild.id].signUpWindow ? ("\n\tand will allow sign-ups " + timerChannels[message.guild.id].minBeforeStart + " minutes before expedition start" +
      "\n\tand will waitlist members " + timerChannels[message.guild.id].minAfterStart + " minutes after expedition start.") : "") +
      "\nEnabled Msg: "+timerChannels[message.guild.id].enabledMsg +
      "\nDisabled Msg: " + timerChannels[message.guild.id].disabledMsg +
      "\nTimers will display in channel(s): " + '['+timerChannels[message.guild.id].timerChannels.toString()+']');
    }else{
      message.channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
    }
  },
  setAmPmExpos: function(message){
    setAmPmExpos(message);
  },
  setWindow: function(message){
    setWindow(message);
  },
  isBeforeGuildJoinWindow: function(guildID){
    return isBeforeGuildJoinWindow(guildID);
  },
  isAfterGuildJoinWindow: function(guildID){
    return isAfterGuildJoinWindow(guildID);
  }
};

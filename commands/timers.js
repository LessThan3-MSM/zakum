var TIMER_LOC = "./resources/timerchannels.json";
var timerChannels = require ("." + TIMER_LOC);
const {SERVER_TIME_ZONE} = require("../resources/constants.json")

function isInGuildWindow(guildID, before){
  var inWindow = before;

  if(timerChannels[guildID] && timerChannels[guildID].signUpWindow){
    var currServerTime = new Date().toLocaleString("en-US", {timeZone: SERVER_TIME_ZONE});
    currServerTime = new Date(currServerTime);
    currServerTime.setMonth(1,1);
    currServerTime.setYear(2011);

    let[expoTime1Hr, expoTime2Hr] = [10,18];

    var expoTime1 = new Date();
    expoTime1.setHours(expoTime1Hr);
    expoTime1.setMinutes(0);
    expoTime1.setSeconds(0);
    expoTime1.setMilliseconds(0);
    expoTime1.setMonth(1,1);
    expoTime1.setYear(2011);

    var expoTime2 = new Date();
    expoTime2.setHours(expoTime2Hr);
    expoTime2.setMinutes(0);
    expoTime2.setSeconds(0);
    expoTime2.setMilliseconds(0);
    expoTime2.setMonth(1,1);
    expoTime2.setYear(2011);

    var expoTime1End = new Date();
    expoTime1End.setHours(expoTime1Hr + 1);
    expoTime1End.setMinutes(0);
    expoTime1End.setSeconds(0);
    expoTime1End.setMilliseconds(0);
    expoTime1End.setMonth(1,1);
    expoTime1End.setYear(2011);

    var expoTime2End = new Date();
    expoTime2End.setHours(expoTime2Hr + 1);
    expoTime2End.setMinutes(0);
    expoTime2End.setSeconds(0);
    expoTime2End.setMilliseconds(0);
    expoTime2End.setMonth(1,1);
    expoTime2End.setYear(2011);

    var abs = 0;
    if(before){
      abs = Math.abs(timerChannels[guildID].minBeforeStart);
    }else{
      abs = Math.abs(timerChannels[guildID].minAfterStart);
    }

    var expoTime1PlusMinutes = new Date(expoTime1);
    var expoTime2PlusMinutes = new Date(expoTime2);

      if((!before && timerChannels[guildID].minAfterStart > 0) || (before && timerChannels[guildID].minBeforeStart < 0)){
        expoTime1PlusMinutes.setMinutes(expoTime1.getMinutes() + abs)
        expoTime2PlusMinutes.setMinutes(expoTime2.getMinutes() + abs)
      }else{
        expoTime1PlusMinutes.setMinutes(expoTime1.getMinutes() - abs)
        expoTime2PlusMinutes.setMinutes(expoTime2.getMinutes() - abs)
      }

      inWindow = (timerChannels[guildID].amExpos && (currServerTime >= expoTime1PlusMinutes) && (currServerTime < expoTime1End)) ||
        (timerChannels[guildID].pmExpos && (currServerTime >= expoTime2PlusMinutes) && (currServerTime < expoTime2End));
  }

  return inWindow;
}

function isBeforeGuildJoinWindow(guildID){
  return !isInGuildWindow(guildID, true);
}

function isAfterGuildJoinWindow(guildID){
  return isInGuildWindow(guildID, false);
}

function setWindow(command, minutes, channel, guildID){
  if(timerChannels[guildID] == undefined){
    channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
  }else{ //setwindow [before|after] minutes
      command = !command ? command : command.toLowerCase();
      if((command !== 'before' && command !== 'after') || (isNaN(minutes))){
        channel.send(':scream: Usage: setwindow [before|after] minutes');
      }else{
        if(command === 'before'){
          timerChannels[guildID].minBeforeStart = minutes
        }else if(command === 'after'){
          timerChannels[guildID].minAfterStart = minutes
        }
        writeToTimerFile(channel, true);
      }
  }
}

function setAmPmExpos(command, onOrOff, channel, guildID){
  if(timerChannels[guildID] == undefined){
    channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
  }else{ //settimer am on, settimer pm off
      command = !command ? command : command.toLowerCase();
      onOrOff = !onOrOff ? onOrOff : onOrOff.toLowerCase();
      if((command !== 'am' && command !== 'pm' && command !== 'window' && command !== 'autoreset' && command !== 'join') || (onOrOff !== 'on' && onOrOff !== 'off')){
        channel.send(':scream: Usage: setexpo [am|pm|join|window|autoreset] [on|off]');
      }else{
        if(command === 'pm'){
          timerChannels[guildID].pmExpos = onOrOff === 'on'
        }else if(command === 'am'){
          timerChannels[guildID].amExpos = onOrOff === 'on'
        }else if(command === 'window'){
          timerChannels[guildID].signUpWindow = onOrOff === 'on'
        }else if(command === 'autoreset'){
          timerChannels[guildID].autoReset = onOrOff === 'on'
        }else if(command === 'join'){
			timerChannels[guildID].enabled = onOrOff === 'on'
		}
        writeToTimerFile(channel, true);
      }
  }
}

function setTimerMsg(command, msg, channel, guildID){
    if(timerChannels[guildID] == undefined){
      channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
    }else{
		if(command !== 'on' && command !== 'off'){
			channel.send(':scream: Usage: setmsg [on|off] message');
		}else{
			if(command === 'on'){
				timerChannels[guildID].enabledMsg = msg;
			}else{
				timerChannels[guildID].disabledMsg = msg;
			}
      writeToTimerFile(channel, true);
    }
}
}

function addCh(channel, chToAdd, guildID){
  if(chToAdd == undefined){
    channel.send(':scream: Please supply the channel to be added.');
    return;
  }
  if(timerChannels[guildID] == undefined){
    timerChannels[guildID] = {"enabled": true,
    "timerChannels": [],
    "enabledMsg": "@everyone I am Zakumbot, the expedition group assistant-koom! Type !join to sign up for expeditions and type the command again to leave.",
    "disabledMsg": "@everyone Expedition sign-ups are currently disabled.",
    "amExpos": true, "pmExpos": true, "signUpWindow": false, "minBeforeStart":"30", "minAfterStart":"30", "autoReset":true};
  }
	if(timerChannels[guildID].timerChannels.indexOf(chToAdd) === -1) {
		timerChannels[guildID].timerChannels.push(chToAdd);
		writeToTimerFile(channel, true);
    } else {
		channel.send(':scream: This channel already exists and cannot be added again.');
	}
}

function removeCh(channel, chToRemove, guildID){
	var removed = false;
  if(chToRemove == undefined){
    channel.send(':scream: Please supply the channel to be removed.');
    return;
  }
  if(timerChannels[guildID] != undefined){
	   timerChannels[guildID].timerChannels = timerChannels[guildID].timerChannels.filter(function(value, index, arr){
		     if(value == chToRemove){
			        removed = true;
		     }
		 return value != chToRemove;
	 });
  }

	if(removed){
		writeToTimerFile(channel, true);
	} else {
		channel.send(':scream: This channel does not currently exist and cannot be removed.');
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
  addTimerCh: function (channel, chToAdd, guildID) {
		addCh(channel, chToAdd, guildID);
  },
  removeTimerCh: function (channel, chToRemove, guildID){
    removeCh(channel, chToRemove, guildID)
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
  setTimerMsg: function(command, msg, channel, guildID){
    setTimerMsg(command, msg, channel, guildID)
  },
  listTimerMsg: function(channel, guildID){
    if(timerChannels[guildID] != undefined){
      var amexpos = timerChannels[guildID].amExpos ? "on." : "off."
      var pmexpos = timerChannels[guildID].pmExpos ? "on." : "off."
      var expos = timerChannels[guildID].enabled ? "enabled." : "disabled"
      var window = timerChannels[guildID].signUpWindow ? "enabled" : "disabled."
      var autoReset = timerChannels[guildID].autoReset ? "" : "not "
      channel.send("The AM Expo timer is "+ amexpos +
      "\nThe PM Expo timer is "+pmexpos+
      "\nExpedition sign-ups are "+ expos +
      (!timerChannels[guildID].enabled ? ("\n\tand will " + autoReset + "auto reset at server reset to enabled status."): "") +
      "\nExpedition join windows are " + window +
      (timerChannels[guildID].signUpWindow ? ("\n\tand will allow sign-ups " + timerChannels[guildID].minBeforeStart + " minutes before expedition start" +
      "\n\tand will waitlist members " + timerChannels[guildID].minAfterStart + " minutes after expedition start.") : "") +
      "\nEnabled Msg: "+timerChannels[guildID].enabledMsg +
      "\nDisabled Msg: " + timerChannels[guildID].disabledMsg +
      "\nTimers will display in channel(s): " + '['+timerChannels[guildID].timerChannels.toString()+']');
    }else{
      channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
    }
  },
  setAmPmExpos: function(command, onOrOff, channel, guildID){
    setAmPmExpos(command, onOrOff, channel, guildID);
  },
  setWindow: function(command, minutes, channel, guildID){
    setWindow(command, minutes, channel, guildID);
  },
  isBeforeGuildJoinWindow: function(guildID){
    return isBeforeGuildJoinWindow(guildID);
  },
  isAfterGuildJoinWindow: function(guildID){
    return isAfterGuildJoinWindow(guildID);
  }
};

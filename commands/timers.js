var TIMER_LOC = "./resources/timerchannels.json";
var timerChannels = require ("." + TIMER_LOC);

function setAmPmExpos(message){
  if(timerChannels[message.guild.id] == undefined){
    message.channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
  }else{ //settimer am on, settimer pm off
      var commands = message.content.toLowerCase().split(' ');
      if(commands.length < 2 || (commands[1] !== 'am' && commands[1] !== 'pm') || (commands[2] !== 'on' && commands[2] !== 'off')){
        message.channel.send(':scream: Usage: setexpo [am|pm] [on|off]');
      }else{
        if(commands[1] === 'pm'){
          timerChannels[message.guild.id].pmExpos = commands[2] === 'on'
        }else if(commands[1] === 'am'){
          timerChannels[message.guild.id].amExpos = commands[2] === 'on'
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
    "amExpos": true, "pmExpos": true};
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
      message.channel.send("The AM Expo timer is "+ amexpos +
      "\nThe PM Expo timer is "+pmexpos+
      "\nExpedition sign-ups are "+ expos +
      "\nEnabled Msg: "+timerChannels[message.guild.id].enabledMsg +
      "\nDisabled Msg: " + timerChannels[message.guild.id].disabledMsg +
      "\nTimers will display in channel(s): " + '['+timerChannels[message.guild.id].timerChannels.toString()+']');
    }else{
      message.channel.send(':scream: No timer channels exist for this server. Use !timerchadd to add some.');
    }
  },
  setAmPmExpos: function(message){
    setAmPmExpos(message);
  }
};

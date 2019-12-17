var TIMER_LOC = "./resources/timerchannels.json";
var timerChannels = require ("." + TIMER_LOC);

function addCh(message){
  var channel = message.content.split(" ")[1];
  if(timerChannels[message.guild.id] == undefined){
    timerChannels[message.guild.id] = {"enabled": true, "timerChannels": []};
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
		channel.send(':thumbsup: Zakum has successfully modified the channel list.');
	}
}

module.exports = {
  addTimerCh: function (message) {
		addCh(message);
  },
  removeTimerCh: function (message){
    removeCh(message);
  },
  listTimerCh: function (message){
    if(timerChannels[message.guild.id] != undefined){
      message.channel.send('['+timerChannels[message.guild.id].timerChannels.toString()+']');
    }else{
      message.channel.send('[]');
    }
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
      message.channel.send('No timer channels exist for this server. Use !timerchadd to add some.');
    }
  },
  isguilddisabled: function(guildID){
    return timerChannels[guildID] == undefined || timerChannels[guildID].enabled;
  }
};

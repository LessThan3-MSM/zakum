var TIMER_LOC = "./resources/timerchannels.json";
var timerChannels = require ("." + TIMER_LOC);

function addCh(message){
  var channel = message.content.split(" ")[1];
	if(timerChannels.indexOf(channel) === -1) {
		timerChannels.push(channel);
		writeToTimerFile(message.channel);
    } else {
		message.channel.send(':scream: This channel already exists and cannot be added again.');
	}
}

function removeCh(message){
	var removed = false;
  var channel = message.content.split(" ")[1];
	timerChannels = timerChannels.filter(function(value, index, arr){
		if(value == channel){
			removed = true;
		}
		return value != channel;
	});
	if(removed){
		writeToTimerFile(message.channel);
	} else {
		channel.send(':scream: This channel does not currently exist and cannot be removed.');
	}
}

function writeToTimerFile(channel){
	var exported = true;
	require('fs').writeFile(
		TIMER_LOC, JSON.stringify(timerChannels, null, 4), (err) => {
      if (err) {
          channel.send(':scream: Unable to add timer channel.');
          exported = false;
      };
	});

	if(exported){
		channel.send(':thumbsup: Zakum has successfully modified the channel list.');
	}
}

module.exports = {
  addTimerCh: function (message, isAdmin) {
    if(!isAdmin){
			message.channel.send(`Zakum is unable to acquiesce to the demands of a regular user.`);
		}else{
			addCh(message);
		}
  },
  removeTimerCh: function (message, isAdmin){
    if(!isAdmin){
      message.channel.send(`Zakum is unable to acquiesce to the demands of a regular user.`);
    }else{
      removeCh(message);
    }
  },
  listTimerCh: function (channel){
    channel.send('['+timerChannels.toString()+']');
  },
  getTimerCh: function(){
    return timerChannels;
  }
};

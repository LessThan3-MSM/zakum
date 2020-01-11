const groupCommand = require('./groups.js').groupCommand;
const groupDetails = require('./groups.js').groupDetails;
const swap = require('./swap.js').swap;
const balance = require('./balance.js').balance;
const reset = require('./reset.js').reset;
const join = require('./join.js').join;

function start(expoData, name, channel){
  if (!expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase())){
    channel.send(":scream: The specified expo does not exist.");
  } else {
    var anExpo = expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase());
    anExpo.groups = [];
    anExpo.pool = [];
    anExpo.waitlist = [];

    channel.send(anExpo.message).then(sentMessage => {
      sentMessage.react("👍");
      sentMessage.react("👎");
      anExpo.messageID = sentMessage.id;
    });

  }
}

function resetExpo(expoData, name, channel){
  if('all' === name){
    if(expoData.length == 0){
      channel.send(":scream: No expos exist.")
    }else{
      for (var i =0; i< expoData.length; i++) {
        reset(expoData[i]);
        expoData[i].messageID = "";
      }
    channel.send(`:thumbsup: All expos have been reset.`);
    }
  } else if (!expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase())){
    channel.send(":scream: The specified expo does not exist.");
  } else {
    var anExpo = expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase());
    reset(anExpo);
    anExpo.messageID = "";
    channel.send(`:thumbsup: The ${name} expo has been reset.`);
  }
}

function setbalance(expoData, expoName, balance, channel){
  if(!expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase())){
    channel.send(":scream: The specified expo does not exist.");
  }else if (!(balance === 'greedy'|| balance === 'first')){
    channel.send(":scream: Invalid balance algorithm. Please specify greedy or first.");
  }else{
    var anExpo = expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase());
    if(anExpo.balance !== balance){
      anExpo.pool = anExpo.pool.concat(anExpo.waitlist);
      if('first' === balance){
			     anExpo.pool.sort(function(a, b){
				         return (a.timestamp ? a.timestamp : 0) - (b.timestamp ? b.timestamp : 0);
			            });
		   }else{
         anExpo.pool.sort(function(a, b){
   				var rank = b.rank - a.rank;
   				if(rank == 0){
   					rank = (a.timestamp ? a.timestamp : 0) - (b.timestamp ? b.timestamp : 0);
   				}
   				return rank;
   			});
       }
    anExpo.balance = balance
    anExpo.waitlist.length = 0;
     balanceExpo(expoData, expoName, channel)
  }
  channel.send(`:thumbsup: Balance algorithm for the ${expoName} expo set to ${balance}.`);
}
}

function setmessage(expoData, name, message, channel){
  if(expoData == undefined){
    channel.send(":scream: The specified expo does not exist.");
  }else{
    expoData.message = message;
    channel.send(`:thumbsup: Message for the ${name} expo set to: ${message}.`);
  }
}

function setchannel(expoData, channel){
  if(expoData == undefined){
    channel.send(":scream: The specified expo does not exist.");
  }else{
    expoData.channel = channel.id;
    channel.send(`:thumbsup: If this expo is locked, joining will only be allowed for the current channel.`);
  }
}

function setlock(expoData, expoName, isLocked, channel){
  if(isLocked !== 'on' && isLocked !== 'off'){
    channel.send("Usage: !expo setlock {expo name} [on|off].");
  }else if(!expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase())){
    channel.send(":scream: The specified expo does not exist.");
  }else{
    expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase()).lock = isLocked === 'on';
    channel.send(`:thumbsup: Lock for the ${expoName} expo set to ${isLocked}.`);
  }
}

function add(expoData, name, channel, message, roster){
  if('all' === name){
    channel.send(":scream: You cannot name a group 'all'. Please pick a different name.")
  } else if(expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase())) {
    channel.send(":scream: This expo already exists. Please pick a different name.")
  } else {
    var newExpo = {"name":name ,"groups":[], "pool":[], "waitlist":[], "leaders":[], "message":`Use !expo join ${name} to join expo!`, "balance":"greedy", "channel": channel.id, "lock": true, "messageID": ""};
    expoData.push(newExpo);
    addLeader(message, roster, expoData, name, null)
    channel.send(`:thumbsup: The ${name} expo has been successfully added!`);
  }
}

function addLeader(message, roster, expoData, expoName, userName){
  var removed;
  let user = null;
	if (userName){
		const added = roster.find(member => member.name.toLowerCase() === userName.toLowerCase())
		user = added ? added.id:null
	} else {
		user = message.author.username + "#" + message.author.discriminator
	}

	const joined = roster.find(member => member.id === user)
	if (!joined){
		message.channel.send(`${name || message.author.username} does not appear to be on the guild roster. Please contact your guild leader to get added to the roster.`)
	}else{
    anExpo = expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase());
    if(anExpo && !anExpo.leaders.find(member => member.id === user)){
      anExpo.leaders.push(joined);
      removed = joined;
    }
  }
  return removed;
}

function removeLeader(message, roster, expoData, expoName, userName){
  var removed;
  let user = null;
	if (userName){
		const added = roster.find(member => member.name.toLowerCase() === userName.toLowerCase())
		user = added ? added.id:null
	} else {
		user = message.author.username + "#" + message.author.discriminator
	}

	const joined = roster.find(member => member.id === user)
	if (!joined){
		message.channel.send(`${name || message.author.username} does not appear to be on the guild roster. Please contact your guild leader to get added to the roster.`)
	}else{
    anExpo = expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase());
    if(anExpo && anExpo.leaders.find(member => member.id === user)){
      anExpo.leaders.pop(joined);
      removed = joined;
    }
  }

  return removed;
}

function deleteExpo(expoData, name, channel){
  if('all' === name){
    expoData.length = 0;
    channel.send(`:thumbsup: All expos have been deleted.`);
  } else if(!expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase())) {
    channel.send(":scream: The specified expo does not exist.")
  } else {
    var index = expoData.findIndex(expo => expo.name.toLowerCase() === name.toLowerCase());
    expoData.splice(index,1);
    channel.send(`:thumbsup: The ${name} expo has been deleted.`);
  }
}

function swapPeople(expoData, message){
  if(!expoData){
    channel.send(":scream: The specified expo does not exist.");
  }else{
    swap(message, expoData);
  }
}

function balanceExpo(expoData, expoName, channel){
  if(!expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase())){
    channel.send(`:scream: The ${expoName} expo does not exist.`);
  }else{
    balance(expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase()).leaders, expoData.find(expo => expo.name.toLowerCase() === expoName.toLowerCase()), true, channel);
  }
}

function joinExpo(expoData, expoName, members, message, startIndex){
  if(!expoData){
    channel.send(":scream: The specified expo does not exist.");
  }else{
    join(message, members, expoData.leaders, expoData, expoName, true, startIndex);
  }
}

function printDetail(expoData, name, channel){
  if('all' === name){
    if(expoData.length == 0){
      channel.send(":scream: No expos exist.")
    }else{
      for (var i=0; i<expoData.length; i++) {
        groupDetails(channel, expoData[i], expoData[i].leaders);
      }
    }
  } else if(!expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase())) {
    channel.send(":scream: The specified expo does not exist.")
  } else {
    groupDetails(channel, expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase()), expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase()).leaders);
  }
}

function printGroups(expoData, name, channel){
  if('all' === name){
    if(expoData.length == 0){
      channel.send(":scream: No expos exist.")
    }else{
      for (var i =0; i < expoData.length; i++) {
        groupCommand(channel, expoData[i], expoData[i].leaders);
      }
    }
  } else if(!expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase())) {
    channel.send(":scream: The specified expo does not exist.")
  } else {
    groupCommand(channel, expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase()), expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase()).leaders);
  }
}

function printInfo(expoData, name, channel){
  if('all' === name){
    if(expoData.length == 0){
      channel.send(":scream: No expos exist.")
    }else{
      for (var i =0; i<expoData.length; i++) {
        var info = `${expoData[i].name} expo: \n\tBalance: ${expoData[i].balance}\n\tMessage: ${expoData[i].message}\n\tChannel: ${expoData[i].channel}\n\tLocked: ${expoData[i].lock}`;
        channel.send(info);
      }
    }
  }else if(!expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase())){
    channel.send(":scream: The specified expo does not exist.")
  }else{
    var anExpo = expoData.find(expo => expo.name.toLowerCase() === name.toLowerCase());
    var info = `${name} expo: \n\tBalance: ${anExpo.balance}\n\tMessage: ${anExpo.message}\n\tChannel: ${anExpo.channel}\n\tLocked: ${anExpo.lock}`;
    channel.send(info);
  }
}

module.exports = {
  joinExpo: function(expoData, expoName, members, message, startIndex){
    joinExpo(expoData, expoName, members, message, startIndex);
  },
  manageExpo: function (expoData, members, message) {
    const content = message.content.toLowerCase().split(" ");

    if(content.length < 3 || content[2].length < 1 || (content[2].startsWith('set') && content.length < 4)) {
      message.channel.send(":scream: Invalid format. Example: \`!expo add cpb\`")
      return;
    }else if(expoData[content[2]] && expoData[content[2]].channelLocked && message.channel.id !== expoData[content[2]].channel){
      message.channel.send(":scream: This channel does not have permissions for this expo.")
      return;
    }

    var anExpo = expoData.find(expo => expo.name.toLowerCase() === content[2].toLowerCase());

    switch(content[1]){
      case "add":
        add(expoData, content[2], message.channel, message, members);
        break;
      case "balance":
        balanceExpo(expoData, content[2], message.channel);
        break;
      case "channel":
        setchannel(anExpo, message.channel);
        break;
      case "delete":
        deleteExpo(expoData, content[2], message.channel);
        break;
      //case "join":
        //joinExpo(anExpo, content[2], members, message, 3);
        //break;
      case "groups":
        printGroups(expoData, content[2], message.channel);
        break;
      case "detail":
        printDetail(expoData, content[2], message.channel);
        break;
      case "info":
        printInfo(expoData, content[2], message.channel);
        break;
      case "reset":
        resetExpo(expoData, content[2], message.channel);
        break;
      case "setbalance":
        setbalance(expoData, content[2], content[3], message.channel);
        break;
      case "setlock":
        setlock(expoData, content[2], content[3], message.channel);
        break;
      case "setmsg":
        var name = content[2];
        var msg = content.splice(3,content.length).join(" ");
        setmessage(anExpo, name, msg, message.channel);
        break;
      case "start":
        start(expoData, content[2], message.channel);
        break;
      case "swap":
        message.content = content.splice(2,content.length).join(" ");
        swapPeople(anExpo, message);
        break;
      case "promote":
        var promoted = addLeader(message, members, expoData, content[2], content[3])
        if(promoted){
          message.channel.send(`${promoted.name} has been promoted.`)
          if (anExpo.pool.find( member => member.id === promoted.id  )){ //remove leader from pool if there.
              anExpo.pool = anExpo.pool.filter(member => member.id !== promoted.id)
            }
            if (anExpo.waitlist.find( member => member.id === promoted.id  )){ //remove leader from waitlist if there.
              anExpo.waitlist = anExpo.waitlist.filter(member => member.id !== promoted.id)
            }
            balanceExpo(expoData, content[2], message.channel);
          }
        break;
      case "demote":
        var removed = removeLeader(message, members, expoData, content[2], content[3])
        if(removed){
          message.channel.send(`${removed.name} has been demoted.`)
          balanceExpo(expoData, content[2], message.channel);
        }
        break;
    }
  }
};

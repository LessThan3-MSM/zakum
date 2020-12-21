var fs = require("fs");

module.exports = {
  addBotAdmin: function (uid, botadmins, channel) {
    if(uid == undefined || uid === ''){
      channel.send(':scream: Please supply the UID of the bot administrator to add.');
      return;
    }
    if(!botadmins.includes(uid)){
      botadmins.push(uid);
      writeToBotAdminFile(botadmins);
    }
    channel.send(`:thumbsup: Successfully added ${uid} to the list of bot administrators.`);

  },
  removeBotAdmin: function (uid, botadmins, channel){
    if(uid == undefined || uid === ''){
      channel.send(':scream: Please supply the UID of the bot administrator to remove.');
      return;
    }

    let pos = botadmins.indexOf(uid);
    if(pos !== -1) {
      botadmins.splice(pos, 1);
      writeToBotAdminFile(botadmins);
      channel.send(`:thumbsup: Successfully removed ${uid} from the list of bot administrators.`);
    }else{
      channel.send(`:eyes: ${uid} does not exist in the list of bot administrators and was therefore not removed.`);
    }

  }
};

function writeToBotAdminFile(botadmins){
  fs.writeFile("./resources/botadmins.json", JSON.stringify(botadmins, null, 4), (err) => {
      if (err) {
          console.error(err);
      };
  });
}

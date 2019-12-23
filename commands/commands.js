const commands = require ('../resources/commands.json'); //list of all the commands used.

module.exports = {
  listCommands: function (channel, isUserAdmin) {
    let helpMsg = '__Zakum Commands__ \n';
    const commandsCanAccess = !isUserAdmin ? commands.filter(command => command.admin === false) : commands

    commandsCanAccess.forEach( function(command){
      var newMsg = `**!${command.name}**${command.required && command.required.length>0 ? ` **{${command.required.join(", ")}}**` : ''}${command.optional && command.optional.length>0 ? ` *****{${command.optional.join(", ")}}*****`:''}: ${command.description} \n`
       if((helpMsg + newMsg).length > 2000){
         channel.send(helpMsg);
         helpMsg = newMsg;
       }else{
         helpMsg += newMsg;
       }
     });
     channel.send(helpMsg);

    //helpMsg = helpMsg.match(/[\s\S]{1,2000}/g) || [];
  //  for(var i = 0; i < helpMsg.length; i++){
    //    channel.send(helpMsg[i]);
  //  }

  }
};

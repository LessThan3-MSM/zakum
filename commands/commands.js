const commands = require ('../resources/commands.json'); //list of all the commands used.

module.exports = {
  listCommands: function (channel, isUserAdmin, isBotAdmin) {
    let helpMsg = '__Zakum Commands__ \n';
    let commandsCanAccess = !isUserAdmin ? commands.filter(command => command.admin === false) : commands
    commandsCanAccess = !isBotAdmin ? commandsCanAccess.filter(command => command.botadmin === false) : commands;

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
  }
};

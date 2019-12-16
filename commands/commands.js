const commands = require ('../commands.json'); //list of all the commands used.

module.exports = {
  listCommands: function (channel, isUserAdmin) {
    let helpMsg = '__Zakum Commands__ \n';
    const commandsCanAccess = !isUserAdmin ? commands.filter(command => command.admin === false) : commands
    commandsCanAccess.forEach(command => helpMsg += `**!${command.name}** ${command.required && `**{${command.required.join(", ")}}**`}  : ${command.description} \n` )
    channel.send(helpMsg);
  }
};

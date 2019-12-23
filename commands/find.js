module.exports = {
  findCommand: function (message, roster) {
    const personToFind = message.content.split(" ")[1]
		if (!personToFind) {
			message.channel.send(`No input, please use like this: !find <IGN>`)
			return;
		}
		var foundMember = roster.find(member => member.name.toLowerCase() === personToFind.toLowerCase())
    foundMember = !foundMember ?  roster.find(member => member.id.toLowerCase() === personToFind.toLowerCase()) : foundMember;
		foundMember
      ? message.channel.send(`\`\`\`ID: ${foundMember.id}\nName: ${foundMember.name}\nClass: ${foundMember.role}\nDPS: ${foundMember.rank}\nMultiplier: ${foundMember.multiplier || 1}\`\`\``)
      : message.channel.send(`Zakum can't find ${personToFind} on the guild roster.`)
  }
};

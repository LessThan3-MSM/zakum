module.exports = {
  findCommand: function (personToFind, channel, roster) {
		if (!personToFind) {
			channel.send(`No input, please use like this: !find <IGN>`)
			return;
		}
		var foundMember = roster.find(member => member.name.toLowerCase() === personToFind.toLowerCase())
    foundMember = !foundMember ?  roster.find(member => member.id.toLowerCase() === personToFind.toLowerCase()) : foundMember;
		foundMember
      ? channel.send(`\`\`\`ID: ${foundMember.id}\nName: ${foundMember.name}\nClass: ${foundMember.role}\nDPS: ${foundMember.rank}\nMultiplier: ${foundMember.multiplier || 1}\`\`\``)
      : channel.send(`Zakum can't find ${personToFind} on the guild roster.`)
  }
};

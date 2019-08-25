module.exports = {
  leaderboard: function (message, roster) {

    if(message.content.split(" ").length > 2) {
      message.channel.send("Invalid format. Example: \`!leaderboard 5 \`");
      return;
    }

    let amount = 10;
    if (message.content.split(" ")[1]) {
      amount = Math.min(message.content.split(" ")[1], roster.length); //prevents out of index errors
    }

    if (!parseInt(amount) || parseInt(amount) < 1) { //for NaN inputs and <= 0 inputs
      message.channel.send("Invalid input. Example: \`!leaderboard 5 \`");
      return;
    }

    message.channel.send(`\`\`\`${roster.sort((a, b) => b.rank - a.rank)
          .map((member,index) => `#${index+1} ${" ".repeat(Math.abs((index+1).toString().length - 2))} ${member.name} ${" ".repeat(Math.abs(member.name.length - 12))} ${member.rank}`)
          .slice(0, amount)
          .join('\n')}\`\`\``);

		return;
  }
};

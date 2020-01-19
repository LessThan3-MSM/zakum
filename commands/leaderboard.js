module.exports = {
  leaderboard: function (topNum, channel, roster) {
    let amount = !topNum || "" === topNum.trim() ? 10 : topNum;

    if (!parseInt(amount) || parseInt(amount) < 1) { //for NaN inputs and <= 0 inputs
      channel.send("Invalid input. Example: \`!leaderboard 5 \`");
      return;
    }

    amount = Math.min(amount, roster.length); //prevents out of index errors

    channel.send(`\`\`\`${roster.sort((a, b) => b.rank - a.rank)
          .map((member,index) => `#${index+1} ${" ".repeat(Math.abs((index+1).toString().length - 2))} ${member.name} ${" ".repeat(Math.abs(member.name.length - 12))} ${member.rank}`)
          .slice(0, amount)
          .join('\n')}\`\`\``);

		return;
  }
};

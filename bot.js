const Discord = require('discord.js');
const {prefix, token} = require('./config.json')
const {lt3} = require("./guilds/lt3.json")
const client = new Discord.Client();
var fs = require("fs");

let groups = [];
let pool = [];

client.once('ready', () => {
	console.log('Ready!');
	const leaders = lt3.filter(member => member.leader)
	pool.push(leaders[0])
	pool.push(leaders[1])
	console.log(pool)
});

client.on('message', message => {
	if (message.author.bot) return;
  if (message.content.substring(0,5) === `${prefix}join` && message.content.substring(0,7) !== `${prefix}joined` ) {
		const roster = getRoster()
		let user = null;
		let name = null;

		if (message.content.split(" ").length > 1){
			const added = roster.find(member => member.name.toLowerCase() === message.content.split(" ")[1].toLowerCase())
			name = message.content.split(" ")[1]
			user = added ? added.id:null
		} else {
			user = message.author.username + "#" + message.author.discriminator
		}

		const joined = roster.find(member => member.id === user)
		if (!joined){
			message.channel.send(`${name || message.author.username} does not appear to be on the guild roster. Please contact your guild leader to get added to the roster.`)
			return;
		}

		if (pool.find( member => member.id === joined.id  )){
			pool = pool.filter(member => member.id !== joined.id)
			message.channel.send(`Removed ${name || message.author.username} from the Zakum Expedition Finder queue.`)
			return;
		} else {
			pool.push(joined)
			balance(pool)
			message.channel.send(`${name || message.author.username} has joined the Zakum Expedition Finder queue! :heart:`)
		}
	}

	if (message.content.substring(0,4) === `${prefix}add`){
		const content = message.content.split(" ")
		if(content.length !== 5) {
			message.channel.send("Invalid member add format. Example: \`!add Horntail#1234 Horntail DPS 5 \`")
			return;
		}
		if (content[3].toLowerCase() !== "buccaneer" && content[3].toLowerCase() !== "bishop" && content[3].toLowerCase().trim() !== "dps"){
			message.channel.send("Invalid member add format. Role must be of type DPS, Bishop, or Buccaneer.")
			return;
		}
		if (content[1].split("#").length !== 2){
			message.channel.send("Invalid Discord ID. Example: \`Horntail#1234\`")
			return;
		}
		const member = {"id":content[1],"name":content[2],"rank":content[4],"role":content[3],"leader":false}
		const roster = getRoster()
		if (roster.find(person => person.name.toLowerCase() === member.name.toLowerCase() )){
			message.channel.send(`${member.name} already exists on the LessThan3 guild roster!`)
			return;
		}
		roster.push(member)
		console.log(roster)

		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
		    if (err) {
		        console.error(err);
		        return;
		    };
		    message.channel.send(`Successfully added ${member.name} to the LessThan3 guild roster!`)
		});
	}

	if (message.content.substring(0,7) === `${prefix}remove`){
		// make this better
		const content = message.content.split(" ")
		const kicked = content[1] && content[1].toLowerCase().trim();
		const roster = getRoster().filter(member => member.name.toLowerCase() !== kicked)
		fs.writeFile("./guilds/lt3.json", JSON.stringify({"lt3":roster}, null, 4), (err) => {
				if (err) {
						console.error(err);
						return;
				};
				message.channel.send(`Successfully removed ${kicked} from the LessThan3 guild roster!`)
		});
	}

	if (message.content === `${prefix}lt3` || message.content === `${prefix}roster`) {
		let roster = getRoster()
		let rosterMsg = ""
		roster = roster.map(member => member.name).sort()
		roster.forEach(member => rosterMsg += member + " " )
		message.channel.send(`${rosterMsg} (${roster.length})`)
	}

	if (message.content === `${prefix}groups`) {
		const group1 = formatGroupMessage("Group 1", groups[0] || pool)
		const group2 = formatGroupMessage("Group 2", groups[1])
		const msg = `Group 1: ${group1}`
		if (groups[1]){
			msg += "\n \nGroup 2: \n" + group2
		}
		message.channel.send("```" + msg + "```")
	}

	if (message.content.substring(0,5) === `${prefix}pool` || message.content.substring(0,7) === `${prefix}joined`) {
		pool.length && message.channel.send(pool.map(joined => joined.name).sort())
	}

	if (message.content.substring(0,5) === `${prefix}find`) {
		const personToFind = message.content.split(" ")[1].toLowerCase()
		let member = null
		if (personToFind){
		 member = getRoster().find(member => member.name.toLowerCase() === personToFind)
		}
		member ? message.channel.send(JSON.stringify(member)) : message.channel.send(`Can't find ${personToFind} on the guild roster.`)
	}

	function formatGroupMessage(name, group) {
		return group ? group.map(member => member.name).sort():[]
	}

	function balance(pool){
		if (pool.length <= 10){
			groups[0] = pool
		}
	}

	function getRoster(){
		return JSON.parse(fs.readFileSync('./guilds/lt3.json', 'utf8')).lt3
	}

});

client.login(token);

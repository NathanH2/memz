const Discord = require("discord.js");
const ms = require("ms");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return errors.noPerms(message, "MANAGE_MESSAGES");
    if(args[0] == "help"){
        message.reply("Usage: ~tempmute <user> <1s/m/h/d>")
        return;
    }
    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!tomute) return message.reply("Couldn't find user.");
    if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply("Can't mute them.");
    let muterole = message.guild.roles.find(`name`, "Muted");
    if(!muterole){
        try{
            muterole = await message.guild.createRole({
                name: "Muted",
                color: "#454746",
                permissions:[]
            });
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muterole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
        }catch(e){
            console.log(e.stack);
        }
    }
    
    let mutetime = args[1];
    if(!mutetime) return message.reply("You didn't specify a time.");
    let reason = args.join(" ").slice(22);
    
    let muteEmbed = new Discord.RichEmbed()
    .setDescription("Reports")
    .setColor("#d3680a")
    .addField("Muted User", `${tomute} with ID: ${tomute.id}`)
    .addField("Muted By", `${message.author} with ID: ${message.author.id}`)
    .addField("Channel", message.channel)
    .addField("Time", reason);
    
    let incidentschannel = message.guild.channels.find(`name`, "logs");
    if(!incidentschannel) return message.channel.send("Couldn't find the logs channel.");

    message.delete().catch(O_o=>{});
    incidentschannel.send(muteEmbed);
    
    await(tomute.addRole(muterole.id));
    message.channel.sendMessage(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`);

    setTimeout(function(){
        tomute.removeRole(muterole.id);
        message.channel.send(`<@${tomute.id}> has been unmuted.`)
    }, ms(mutetime));

}

module.exports.help = {
    name: "tempmute"
}
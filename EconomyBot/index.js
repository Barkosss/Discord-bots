const { Client, Options, Intents, Collection, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const client = new Client(
    {
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_PRESENCES,
        ],
        partials: [
            "CHANNEL",
            "GUILD_MEMBER",
            "MESSAGE",
            "USER"
        ]
    }
)

const config = require('./config.json');
const fs = require('fs');

// Database - Moonlifedb
const { Database, LocalStorage, JSONFormatter, Showflake } = require('moonlifedb');
const db = new Database(new LocalStorage({ path: 'database'}), { useTabulation: new JSONFormatter({ whitespace: "\t "}) });
// Database - Moonlidedb

client.commands = new Collection();
const commands = fs.readdirSync(__dirname + '/commands/').filter(file => file.endsWith('.js'));
var isConnected = false;
client.login(config.token);

client.on('ready', async() => {
    try{
        if (commands.length == 0) console.log('Commands not found');
        for(let file of commands) {
            const commandName = file.split('.')[0];
            const command = require(`./commands/${commandName}`);
            client.commands.set(commandName, command);
        }
        isConnected = true;
        console.log(`${client.user.username} is ready!`)

    } catch(error) {
        console.log(error);
    }
})

client.on('interactionCreate', async(interaction) => {
    try {
        if (!isConnected) return;
        var command = client.commands.get(interaction.commandName);

        if (interaction.isButton()) {
            command = client.commands.get(interaction.customId.split('_')[0])
            return command.run(client, interaction, interaction.customId)
        }
        else if (interaction.isSelectMenu()) {
            command = client.commands.get(interaction.customId.split('_')[0])
            return command.run(client, interaction, interaction.customId)
        }
        else if (interaction.isModalSubmit()) {
            command = client.commands.get(interaction.customId.split('_')[0])
            return command.run(client, interaction, interaction.customId)
        }
        try {
            if (interaction.guild) command.run(client, interaction)
            else return;
        } catch (error) {
            interaction.reply(
                {
                    content: 'Something went wrong',
                    ephemeral: true
                }
            )
            console.log(error);
        }

        
    } catch(error) {
        console.log(error);
    }

    // Lissa Squence
})

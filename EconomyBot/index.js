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
const { isModuleNamespaceObject } = require('util/types');
const db = new Database(new LocalStorage({ path: 'database'}), { useTabulation: new JSONFormatter({ whitespace: "\t "}) });
// Database - Moonlidedb

client.commands = new Collection();
const commands = fs.readdirSync(__dirname + '/commands/').filter(file => file.endsWith('.js'));
var isConnected = false;
client.login(config.token);

client.on('ready', async() => {
    try{
        if (commands.length == 0) console.log('Commands not found');
        const commandName = file.split('.')[0];
        const command = require(`./commands/${commandName}`);
        client.commands.set(commandName, command);
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
        // Use Button
        if (interaction.isButton()) {
            command = client.command.get(interaction.customId.split('_')[0]);
            return command.run(client, interaction, interaction.customId);
        }

        // Use Select Menu
        else if (interaction.isSelectMenu()) {
            command = client.command.get(interaction.customId.split('_')[0]);
            return command.run(client, interaction, interaction.customId);
        }

        // Use Modal Submit
        else if (interaction.isModalSubmit()) {
            command = client.command.get(interaction.customId.split('_')[0]);
            return command.run(client, interaction, interaction.customId);
        }
        
    } catch(error) {
        console.log(error);
    }

    // Lissa Squence
})

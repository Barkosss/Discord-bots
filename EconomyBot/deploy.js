const { SlashCommandBuilder, ContextMenuCommandBuilder } = require('@discordjs/builders');
const config = require('./config.json')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const commands = [
    
    new SlashCommandBuilder()
        .setName('balance')
        .setDMPermission(false)
        .setDescription('View your balance and other user\'s balance'),

    new SlashCommandBuilder()
        .setName('deposit')
        .setDMPermission(false)
        .setDescription('Deposit money to your bank account'),

    new SlashCommandBuilder()
        .setName('withdraw')
        .setDMPermission(false)
        .setDescription('Withdraw money from a bank account'),

    new SlashCommandBuilder()
        .setName('give')
        .setDMPermission(false)
        .setDescription('Give money to another user'),

    new SlashCommandBuilder()
        .setName('pay')
        .setDMPermission(false)
        .setDescription('Transfer money to another user'),

    new SlashCommandBuilder()
        .setName('inventory')
        .setDMPermission(false)
        .setDescription('View your inventory'),

    new SlashCommandBuilder()
        .setName('shop')
        .setDMPermission(false)
        .setDescription('Open shop'),

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);
(async() => {
    try {
        console.log('reloading...');

        await rest.put(
            Routes.applicationCommands(config.clientId),
            {
                body: commands
            }
        );

        console.log('reloaded')
    } catch(error) {
        console.error(error);
    }
})();
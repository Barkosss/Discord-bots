const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow } = require('discord.js');
const timestamp = require('discord-timestamp');

// Database - Moonlifedb
const { Database, LocalStorage, JSONFormatter, Snowflake } = require('moonlifedb');
const db = new Database(new LocalStorage({ path: 'database' }), { useTabulation: new JSONFormatter({ whitespace: '\t' }) });
const snowflake = new Snowflake({ worker: 0, epoch: 1680288360 });
// Database - Moonlifedb

/* Command - Give

EN: 
---------------
RU: Передача наличных денег другому пользователю

*/

module.exports.run = async (client, interaction) => {

    try {
        const userData = db.read('account', { key: `${interaction.user.id}` });
        const lang = db.read('lang', { key: `${(interaction.locale == 'ru') ? ('ru') : ('en')}` });

        const targetMember = interaction.options.getUser('member');
        const amount = interaction.options.getNumber('amount');
        // Ошибка, если пользователь хочет выдать самому себе наличные
        if (targetMember.id == interaction.user.id) return await interaction.reply({ content: lang.give.error.giveMeToMe, ephemeral: true });

        // Если сумма передачи больше, чем есть у пользователя на руках
        if (amount > userData.userCash) return await interaction.reply({ content: lang.give.error.amountMoreAvailable, ephemeral: true });

        const targetMemberData = db.read('account', { key: `${targetMember.id}` }); // Информация о текущем кол-ве наличных у получаемого пользователя
        db.edit('account', { key: `${interaction.user.id}.userCash`, value: userData.userCash - amount }); // Изменяем кол-во наличных пользователю, который передаёт
        db.edit('account', { key: `${targetMember.id}.userCash`, value: targetMemberData.userCash + amount }); // Изменяем кол-во наличных пользователю, который получает

        const embed = new MessageEmbed()
        embed.setTitle(`${lang.give.title}`)
        embed.addFields([
            { name: `${lang.give.field1}`, value: `` },
            { name: `${lang.give.field2}`, value: `` },
            { name: `${lang.give.field3}`, value: `` },
        ])
        embed.setColor(`79b7ff`)
        
        await interaction.reply({ embeds:[embed], ephemeral: true });

    } catch (error) {
        console.log(error);
    }
}
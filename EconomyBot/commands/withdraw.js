const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow } = require('discord.js');
const timestamp = require('discord-timestamp');

// Database - Moonlifedb
const { Database, LocalStorage, JSONFormatter, Snowflake } = require('moonlifedb');
const db = new Database(new LocalStorage({ path: 'database' }), { useTabulation: new JSONFormatter({ whitespace: '\t' }) });
const snowflake = new Snowflake({ worker: 0, epoch: 1680288360 });
// Database - Moonlifedb

/* Command - Withdraw

EN: 
---------------
RU: 

*/

module.exports.run = async (client, interaction) => {

    try {
        const userData = db.read('account', { key: `${interaction.user.id}` });
        const lang = db.read('lang', { key: `${(interaction.locale == 'ru') ? ('ru') : ('en')}` });

        if (interaction.isModalSubmit()) {
            const amount = interaction.fields.getTextInputValue('amount');
            var eventCode = snowflake.generate(); // Генератор номера операции
            db.edit('account', { key: `${interaction.user.id}.userBank`, value: userData.userBank - amount});
            db.edit('account', { key: `${interaction.user.id}.userCash`, value: userData.userCash + amount });
            db.edit('account', { key: `${interaction.user.id}.history.${eventCode}`, value: {
                "action": "withdraw",
                "timestamp": timestamp(Date.now()),
                "amount": amount
            }, newline: true })
            let bank = db.read('account', { key: `${interaction.user.id}.userBank` });
            let cash = db.read('account', { key: `${interaction.user.id}.userCash` });
            cash = new Intl.NumberFormat("de").format(cash);
            bank = new Intl.NumberFormat("de").format(bank);
            
            const embed = new MessageEmbed()
            embed.setTitle(`${lang.withdraw.title}`)
            embed.addFields([
                { name: `${lang.withdraw}`, value: `` },
                { name: `${lang.withdraw}`, value: `` },
                { name: `${lang.withdraw}`, value: `` }
            ])
            embed.setFooter({ text: `${lang.withdraw.footer}: ${eventCode}` })
            embed.setColor(`79b7ff`)

            await interaction.reply({ embeds:[embed], ephemeral: true });
            return;
        }

        const modal = new Modal()
            .setCustomId(`withdraw`)
            .setTitle(`${lang.withdraw.title}`)

        const amount = new TextInputComponent()
            .setCustomId(`amount`)
            .setLabel(`${lang.withdraw.label}`)
            .setPlaceholder(`${lang.withdraw.placeholder} - ${userData.userBank}`)
            .setRequired(true)

        const amountRow = new MessageActionRow().addComponents(amount);
        modal.addComponents(amountRow);
        await interaction.showModal(modal);

    } catch (error) {
        console.log(error);
    }
}
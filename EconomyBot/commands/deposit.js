const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow } = require('discord.js');
const timestamp = require('discord-timestamp');

// Database - Moonlifedb
const { Database, LocalStorage, JSONFormatter, Snowflake } = require('moonlifedb');
const db = new Database(new LocalStorage({ path: 'database' }), { useTabulation: new JSONFormatter({ whitespace: '\t' }) });
const snowflake = new Snowflake({ worker: 0, epoch: 1680288360 });
// Database - Moonlifedb

/* Command - Deposit

EN: 
---------------
RU: 

*/

module.exports.run = async (client, interaction) => {

    try {
        const userData = db.read('account', { key: `${interaction.user.id}` });
        const lang = db.read('lang', { key: `${(interaction.locale == 'ru') ? ('ru') : ('en')}` });

        if (interaction.isModalSubmit()) {
            const amount = parseInt(interaction.fields.getTextInputValue('amount'));
            var eventCode = snowflake.generate(); // Генератор номера операции
            db.edit('account', { key: `${interaction.user.id}.userBank`, value: userData.userBank + amount });
            db.edit('account', { key: `${interaction.user.id}.userCash`, value: userData.userCash - amount });
            db.edit('account', {
                key: `${interaction.user.id}.history.${eventCode}`, value: {
                    "action": "deposit",
                    "timestamp": timestamp(Date.now()),
                    "amount": amount,
                    "eventCode": eventCode
                }, newline: true
            })
            let cash = new Intl.NumberFormat("de").format(db.read('account', { key: `${interaction.user.id}.userCash` }));
            let oldUserBank = new Intl.NumberFormat("de").format(db.read('account', { key: `${interaction.user.id}.userBank` }) - amount);
            let bank = new Intl.NumberFormat("de").format(db.read('account', { key: `${interaction.user.id}.userBank` }));

            const embed = new MessageEmbed()
            embed.setTitle(`${lang.deposit.title}: +${amount}`)
            embed.addFields([
                { name: `${lang.deposit.field1}`, value: `> ~~\`${oldUserBank}\`~~ **\`->\`** \`${bank}\`` },
                { name: `${lang.deposit.field2}`, value: `> \`${cash}\`` },
            ])
            embed.setFooter({ text: `${lang.deposit.footer}: ${eventCode}` })
            embed.setColor(`79b7ff`)

            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const modal = new Modal()
            .setCustomId(`deposit`)
            .setTitle(`${lang.deposit.modal.title}`)

        const amount = new TextInputComponent()
            .setCustomId(`amount`)
            .setStyle('SHORT')
            .setLabel(`${lang.deposit.modal.label}`)
            .setPlaceholder(`${lang.deposit.modal.placeholder} - ${userData.userCash}`)
            .setRequired(true)

        const amountRow = new MessageActionRow().addComponents(amount);
        modal.addComponents(amountRow);
        await interaction.showModal(modal);

    } catch (error) {
        console.log(error);
    }
}

const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const timestamp = require('discord-timestamp');

// Database - Moonlifedb
const { Database, LocalStorage, JSONFormatter, Snowflake } = require('moonlifedb');
const db = new Database(new LocalStorage({ path: 'database' }), { useTabulation: new JSONFormatter({ whitespace: '\t' }) });
const snowflake = new Snowflake({ worker: 0, epoch: 1680288360 });
// Database - Moonlifedb

/* Command - History

EN: 
---------------
RU: Просмотр истории операций

*/

module.exports.run = async (client, interaction) => {

    try {
        const userData = db.read('account', { key: `${interaction.user.id}` });
        const lang = db.read('lang', { key: `${(interaction.locale == 'ru') ? ('ru') : ('en')}` });
        const emoji = db.read('props', { key: `emoji` });

        if (interaction.isButton()) {
            switch(interaction.customId.split('_')[1]) {

                case 'prevPage': { // Предыдущая страница

                    await interaction.update({ embeds: [embed] });
                    break;
                }

                case 'enterPage': { // Указать страницу

                    const modal = new Modal()

                    await interaction.showModal(modal);
                    break;
                }

                case 'nextPage': { // Следующая страница

                    await interaction.update({ embeds:[embed] });
                    break;
                }
            }
            return;
        }

        if (interaction.isModalSubmit()) {
            switch (interaction.customId.split('_')[1]) {

                case 'enterPage': { // Отобразить указанную страницу

                    break;
                }
            }
            return;
        }
        console.log(userData);
        const embed = new MessageEmbed()
        embed.setTitle(lang.history.title)
        if (Object.keys(userData.history).size) { // Если история операций не пуста
            var addFieldsEmbed = []; let count = 0;
            for (let event of userData.history) {
                if (count >= 25) break;
                let operation = lang.history.operation[event.action];
                let createdOper = event.timestamp;
                let content = lang.history.action + ': ' + operation + '\n';
                switch (operation) {
                    case 'pay': { // Если операция - Перевод
                        content += lang.history.amount + ': ' + event.amount + '\n' + lang.history.sender + ': ' + event.sender + '\n' + lang.history.receiver + ': ' + event.receiver;
                        break;
                    }

                    case 'deposit': { // Если операция - Пополнение
                        content += lang.history.amount + ': ' + event.amount;
                        break;
                    }

                    case 'withdraw': { // Если операция - Снятие
                        content += lang.history.amount + ': ' + event.amount;
                        break;
                    }
                }
                addFieldsEmbed.push({ name: '<t:' + createdOper + ':t> (<t:' + createdOper + ':R>)', value: content });
                count++;
            }
            embed.addFields(addFieldsEmbed)

        } else { // Если история операций пустая
            embed.setDescription(lang.history.empty)
        }
        embed.setFooter({ text: lang.history.footer + ': 0/' + Math.ceil(userData.history.size / 25) })
        embed.setColor(`79b7ff`)


        const button = new MessageActionRow()
            .addComponents( // Предыдующая страница
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`history_prevPage`)
                    .setEmoji(emoji.prevPage)
                    .setDisabled(true)
            )
            .addComponents( // Указать свою страницу
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`history_enterPage`)
                    .setLabel('0/' + Math.ceil(userData.history.size / 25))
                    .setDisabled((userData.history.size <= 25) ? (true) : (false))
            )
            .addComponents( // Следующая страница
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`history_nextPage`)
                    .setEmoji(emoji.nextPage)
                    .setDisabled((userData.history.size <= 25) ? (true) : (false))
            )

        await interaction.reply({ embeds:[embed], components:[button], ephemeral: true });

    } catch (error) {
        console.log(error);
    }
}
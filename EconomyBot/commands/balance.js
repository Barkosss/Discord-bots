const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow } = require('discord.js');

// Database - Moonlifedb
const { Database, LocalStorage, JSONFormatter, Snowflake } = require('moonlifedb');
const db = new Database(new LocalStorage({ path: 'database'}), { useTabulation: new JSONFormatter({ whitespace: '\t' }) });
// Database - Moonlifedb

/* Command - Balance

EN: Display the user's current balance.
Ability to make withdrawals and top-ups through your profile (When viewing your balance).
When viewing another person's balance, give an opportunity to make a transfer.
---------------
RU: Отображение текущего баланса у пользователя.
Возможность сделать снятие денег с банковского счёта и пополнение через свой профиль (При просмотре своего баланса).
При просмотре баланса чужого человека дать возможность совершить перевод.

*/

module.exports.run = async(client, interaction) => {

    try {
        
        const embed = new MessageEmbed()
        embed.setTitle(``)
        embed.addFields([
            { name: ``, value: `` },
            { name: ``, value: `` },
            { name: ``, value: `` },
        ])
        embed.setFooter({ text: ``, iconURL: `` });
        embed.setColor(``)

        const button = new MessageActionRow()
        if (interaction.user.id != targetMember.id) { // Если просмотр чужого профиля
            button.addComponents( // Перевод
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setLabel(``)
                    .setEmoji(``)
            )
        } else { // Если просмотр своего профиля
            button.addComponents( // Снятие денег со счёта
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setLabel(``)
                    .setEmoji(``)
                    
            ).addComponents( // Пополнение счёта
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setLabel(``)
                    .setEmoji(``)
            )
        }

        await interaction.reply({ embeds:[embed], components:[button], ephemeral: true });

    } catch(error) {
        console.log(error);
    }
}
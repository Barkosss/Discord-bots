const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow } = require('discord.js');
const timestamp = require('discord-timestamp');

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
        if (!db.check('account', { key: `${interaction.user.id}` })) { // Если пользователя нет в БазеДанных
            db.edit('account', { key: `${interaction.user.id}`, value: {
                'userCash': 0,
                'userBank': 0,
                'createdAt': timestamp(Date.now())
            }, newline: true });
        }
        const userData = db.read('account', { key: `${interaction.user.id}` });
        const lang = db.read('lang', { key: `${(interaction.locale == 'ru') ? ('ru') : ('en')}` });
        const targetMember = (interaction.options.getUser('member')) ?? (interaction.user);

        if (targetMember.bot) return await interaction.reply({ content: `${lang.balance.error.isBot}`, ephemeral: true });

        const cash = new Intl.NumberFormat("de").format(parseInt(userData.userCash));
        const bank = new Intl.NumberFormat("de").format(parseInt(userData.userBank));
        const total = new Intl.NumberFormat("de").format(userData.userCash + userData.userBank);

        const embed = new MessageEmbed()
        embed.setTitle(`${lang.balance.title} - ${targetMember.username}`)
        embed.addFields([
            { name: `${lang.balance.bank}:`, value: '**`🪙\| ' + ' '.repeat(((9 - String(bank).length) >= 0) ? (9 - String(bank).length) : (0)) + String(bank) + ' Đ`**', inline: true }, // Bank | Банк
            { name: `${lang.balance.cash}:`, value: '**`🪙\| ' + ' '.repeat(((9 - String(cash).length) >= 0) ? (9 - String(cash).length) : (0)) + String(cash) + ' Đ`**', inline: true }, // Cash | Наличные
            { name: `${lang.balance.total}:`, value: '**`🪙\| ' + ' '.repeat(((26 - String(total).length) >= 0) ? (26 - String(total).length) : (0)) + String(total) + ' Đ`**', inline: false }, // Total | Всего
        ])
        embed.setFooter({ text: `User ID: ${targetMember.id}` });
        embed.setColor(`79b7ff`)

        const button = new MessageActionRow()
        if (interaction.user.id != targetMember.id) { // Если просмотр чужого профиля
            button.addComponents( // Перевод
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`pay_${targetMember.id}`)
                    .setLabel(`${lang.balance.payCash}`)
                    .setEmoji(`⤵️`)
            )
        } else { // Если просмотр своего профиля
            button.addComponents( // Снятие денег со счёта
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`withdraw`)
                    .setLabel(`${lang.balance.withdrawCash}`)
                    .setEmoji(`⬆️`)
                    .setDisabled((userData.userBank <= 0) ? (true) : (false))
                    
            ).addComponents( // Пополнение счёта
                new MessageButton()
                    .setStyle(`SECONDARY`)
                    .setCustomId(`deposit`)
                    .setLabel(`${lang.balance.depositCash}`)
                    .setEmoji(`⬇️`)
                    .setDisabled((userData.userCash <= 0) ? (true) : (false))
            )
        }

        await interaction.reply({ embeds:[embed], components:[button], ephemeral: true });

    } catch(error) {
        console.log(error);
    }
}
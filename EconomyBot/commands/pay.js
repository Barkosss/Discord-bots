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

        const targetMember = interaction.options.getUser('member');
        const amount = interaction.options.getNumber('amount');

        // Проверка на корректного получателя
        if (interaction.user.id == targetMember.id)
            return await interaction.reply({ content: lang.pay.error.payMeToMe, ephemeral: true });

        // Проверка на корректуню сумму
        if (amount <= 0 || amount > userData.userBank) 
            return await interaction.reply({ content: lang.pay.error.amountMoreUserBank, ephemeral: true })

        let targetMemberData = db.read('account', { key: targetMember.id });
        db.edit('account', { key: `${interaction.user.id}.userBank`, value: userData.userBank - amount });
        db.edit('account', { key: `${targetMember.id}.userBank`, value: targetMemberData.userBank + amount });
        db.edit('account', {
            key: `${interaction.user.id}.history.${eventCode}`, value: {
                "action": "pay",
                "timestamp": timestamp(Date.now()),
                "amount": amount,
                "sender": interaction.user.id,
                "receiver": targetMember.id,
                "eventCode": eventCode
            }, newline: true
        });
        db.edit('account', {
            key: `${targetMember.id}.history.${eventCode}`, value: {
                "action": "pay",
                "timestamp": timestamp(Date.now()),
                "amount": amount,
                "sender": interaction.user.id,
                "receiver": targetMember.id,
                "eventCode": eventCode
            }, newline: true
        });

        let cash = new Intl.NumberFormat("de").format(userData.userCash);
        let oldUserBank = new Intl.NumberFormat("de").format(userData.userBank);
        let bank = new Intl.NumberFormat("de").format(userData.userData + amount);

        const embed = new MessageEmbed()
        embed.setTitle(`${lang.pay.title}: -${amount}`)
        embed.addFields([
            { name: lang.pay.field1, value: `> ~~\`${oldUserBank}\`~~ **\`->\`** \`${bank}\`` },
            { name: lang.pay.field2, value: '> ' + targetMember },
        ])
        embed.setFooter({ text: `${lang.pay.footer}: ${eventCode}` })
        embed.setColor(`79b7ff`)

        await interaction.reply({ embeds:[embed], ephemeral: true });

    } catch (error) {
        console.log(error);
    }
}
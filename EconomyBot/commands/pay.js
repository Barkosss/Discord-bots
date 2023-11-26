const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow, Message } = require('discord.js');
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

        if (interaction.isButton()) {
            const targetMemberID = interaction.customId.split('_')[1]; // ID пользователя, которому надо перевести

            const modal = new Modal()
                .setCustomId(`pay_${targetMemberID}`)
                .setTitle(`${lang.pay.modal.title}`)

            const amount = new TextInputComponent()
                .setCustomId(`amount`)
                .setStyle('SHORT')
                .setLabel(`${lang.pay.modal.amount.label}`)
                .setPlaceholder(`${lang.pay.modal.amount.placeholder}`)
                .setRequired(true)
            
            const amountRow = new MessageActionRow().addComponents(amount);
            modal.addComponents(amountRow);
            await interaction.showModal(modal);
            return;
        }

        if (interaction.isModalSubmit()) {
            const targetMemberID = interaction.customId.split('_')[1];
            const amount = interaction.fields.getTextInputValue('amount');

            if (!db.check('account', { key: `${targetMemberID}` })) { // Если пользователя нет в БазеДанных
                db.edit('account', { key: `${targetMemberID}`, value: {
                    'userCash': 0,
                    'userBank': 0,
                    'createdAt': timestamp(Date.now())
                }, newline: true });
            }

            // Проверка на корректного получателя
            if (interaction.user.id == targetMemberID)
            return await interaction.reply({ content: lang.pay.error.payMeToMe, ephemeral: true });

            // Проверка на корректуню сумму
            if (amount <= 0 || amount > userData.userBank) 
                return await interaction.reply({ content: lang.pay.error.amountMoreUserBank, ephemeral: true })

            let targetMemberData = db.read('account', { key: targetMemberID });
            db.edit('account', { key: `${interaction.user.id}.userBank`, value: userData.userBank - amount });
            db.edit('account', { key: `${targetMember.id}.userBank`, value: targetMemberData.userBank + amount });
            db.edit('account', {
                key: `${interaction.user.id}.history.${eventCode}`, value: {
                    "action": "pay",
                    "timestamp": timestamp(Date.now()),
                    "amount": amount,
                    "sender": interaction.user.id,
                    "receiver": targetMemberID,
                    "eventCode": eventCode
                }, newline: true
            });
            db.edit('account', {
                key: `${targetMember.id}.history.${eventCode}`, value: {
                    "action": "pay",
                    "timestamp": timestamp(Date.now()),
                    "amount": amount,
                    "sender": interaction.user.id,
                    "receiver": targetMemberID,
                    "eventCode": eventCode
                }, newline: true
            });

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
            return;
        }

        const targetMember = interaction.options.getUser('member');
        const amount = interaction.options.getNumber('amount');

        if (!db.check('account', { key: `${targetMemberID}` })) { // Если пользователя нет в БазеДанных
            db.edit('account', { key: `${targetMemberID}`, value: {
                'userCash': 0,
                'userBank': 0,
                'createdAt': timestamp(Date.now())
            }, newline: true });
        }

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
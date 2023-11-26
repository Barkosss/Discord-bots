const { Modal, TextInputComponent, MessageEmbed, MessageButton, MessageSelectMenu, MessageActionRow, Message } = require('discord.js');
const timestamp = require('discord-timestamp');

// Database - Moonlifedb
const { Database, LocalStorage, JSONFormatter, Snowflake } = require('moonlifedb');
const db = new Database(new LocalStorage({ path: 'database' }), { useTabulation: new JSONFormatter({ whitespace: '\t' }) });
const snowflake = new Snowflake({ worker: 0, epoch: 1680288360 });
// Database - Moonlifedb

/* Command - Pay

EN: 
---------------
RU: 

*/

module.exports.run = async (client, interaction) => {

    try {
        const userData = db.read('account', { key: `${interaction.user.id}` });
        const lang = db.read('lang', { key: `${(interaction.locale == 'ru') ? ('ru') : ('en')}` });

        // Если была использована кнопка
        if (interaction.isButton()) {
            const targetMemberID = interaction.customId.split('_')[1]; // ID пользователя, которому надо перевести
            const targetMember = interaction.guild.members.cache.get(targetMemberID); // Объект получателя

            const modal = new Modal()
                .setCustomId(`pay_${targetMemberID}`)
                .setTitle(`${lang.pay.modal.title} ${targetMember.username}`)

            const amount = new TextInputComponent()
                .setCustomId(`amount`)
                .setStyle('SHORT')
                .setLabel(`${lang.pay.modal.amount.label}`)
                .setPlaceholder(`${lang.pay.modal.amount.placeholder} ${userData.userBank}`)
                .setRequired(true)
            
            const amountRow = new MessageActionRow().addComponents(amount);
            modal.addComponents(amountRow);
            await interaction.showModal(modal);
            return;
        }

        // Если было использовано модальное окно
        if (interaction.isModalSubmit()) {
            const targetMemberID = interaction.customId.split('_')[1]; // ID получателя
            const targetMember = interaction.guild.members.cache.get(targetMemberID); // Объект получателя
            let amount = interaction.fields.getTextInputValue('amount'); // Сумма для перевода

            // Если пользователь указал не число - Ошибка
            if (/^\d+$/.test(amount)) return await interaction.reply({ content: `${lang.pay.error.isNotNumber}`, ephemeral: true });
            amount = parseInt(amount); // Из строки делаем число

            // Если пользователя нет в Базе Данных - Добавить
            if (!db.check('account', { key: `${targetMemberID}` })) {
                db.edit('account', { key: `${targetMemberID}`, value: {
                    'userCash': 0,
                    'userBank': 0,
                    'createdAt': timestamp(Date.now())
                }, newline: true });
            }

            // Проверка на корректного получателя. Если перевод самому себе - Ошибка
            if (interaction.user.id == targetMemberID)
            return await interaction.reply({ content: lang.pay.error.payMeToMe, ephemeral: true });

            // Проверка на корректную сумму. Если сумма не более 0 иои больше, чем есть у отправителя - Ошибка
            if (amount <= 0 || amount > userData.userBank) 
                return await interaction.reply({ content: lang.pay.error.amountMoreUserBank, ephemeral: true })

            var eventCode = snowflake.generate(); // Генератор номера операции
            let targetMemberData = db.read('account', { key: targetMemberID });
            db.edit('account', { key: `${interaction.user.id}.userBank`, value: userData.userBank - amount }); // Изменение счёта в Банке у отправителя (Убавление денег)
            db.edit('account', { key: `${targetMemberID}.userBank`, value: targetMemberData.userBank + amount }); // Изменение счёта в Банке у получателя (Прибавление денег)
            
            // Сохранение информации об операции у отправаителя
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

            // Сохранение инфомрации об операции у получателя
            db.edit('account', {
                key: `${targetMemberID}.history.${eventCode}`, value: {
                    "action": "pay",
                    "timestamp": timestamp(Date.now()),
                    "amount": amount,
                    "sender": interaction.user.id,
                    "receiver": targetMemberID,
                    "eventCode": eventCode
                }, newline: true
            });

            let oldUserBank = new Intl.NumberFormat("de").format(userData.userBank); // Старый баланс, до изменения
            let bank = new Intl.NumberFormat("de").format(userData.userData - amount); // Новйы баланс, после изменения

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
        const targetMemberID = targetMember.id;
        let amount = interaction.options.getNumber('amount');

        
        // Если пользователь указал не число - Ошибка
        if (/^\d+$/.test(amount)) return await interaction.reply({ content: `${lang.pay.error.isNotNumber}`, ephemeral: true });
        amount = parseInt(amount); // Из строки делаем число

        // Если пользователя нет в Базе Данных - Добавить
        if (!db.check('account', { key: `${targetMemberID}` })) {
            db.edit('account', { key: `${targetMemberID}`, value: {
                'userCash': 0,
                'userBank': 0,
                'createdAt': timestamp(Date.now())
            }, newline: true });
        }

        // Проверка на корректного получателя. Если перевод самому себе - Ошибка
        if (interaction.user.id == targetMember.id)
            return await interaction.reply({ content: lang.pay.error.payMeToMe, ephemeral: true });

        // Проверка на корректуню сумму. Если сумма <= 0 или больше того, чем есть у отправителя - Ошибка
        if (amount <= 0 || amount > userData.userBank) 
            return await interaction.reply({ content: lang.pay.error.amountMoreUserBank, ephemeral: true })

        
        var eventCode = snowflake.generate(); // Генератор номера операции
        let targetMemberData = db.read('account', { key: targetMember.id });
        db.edit('account', { key: `${interaction.user.id}.userBank`, value: userData.userBank - amount }); // Изменение Банка у отправителя (Убавление денег)
        db.edit('account', { key: `${targetMember.id}.userBank`, value: targetMemberData.userBank + amount }); // Изменение Банка у получателя (Прибавление денег)

        // Сохранение информации об операции у отправителя
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

        // Сохранение информации об операции у получателя
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

        let oldUserBank = new Intl.NumberFormat("de").format(userData.userBank); // Старый баланс, до изменения
        let bank = new Intl.NumberFormat("de").format(userData.userData + amount); // Новый баланс, после изменения

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
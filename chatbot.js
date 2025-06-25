// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Criando cliente com autenticação local (salva a sessão)
const client = new Client({
    authStrategy: new LocalAuth()
});

// leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// mensagem de sucesso ao conectar
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// Mapa para armazenar o contexto do usuário
const contextoUsuario = new Map();

client.on('message', async msg => {
    const chat = await msg.getChat();
    const input = msg.body.trim().toLowerCase();

    if (input.match(/^(oi|ol[aá]|menu|dia|tarde|noite)$/i) && msg.from.endsWith('@c.us')) {
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);

        await client.sendMessage(msg.from,
            'Oi! 👋 Eu sou a Carol Rezende, fotógrafa apaixonada por registrar momentos com sensibilidade e autenticidade. 💛\n\nMe conta o que você está procurando:\n\n1️⃣ Fotografia Infantil\n2️⃣ Ensaio de 15 Anos\n3️⃣ Ensaio Adulto / Família\n4️⃣ Eventos (casamento, aniversário, batizado...)\n5️⃣ Só quero tirar uma dúvida ou pedir orçamento');
        contextoUsuario.set(msg.from, null);
        return;
    }

    // Armazena a escolha principal e responde com submenu
    if (['1', '2', '3', '4', '5'].includes(input)) {
        contextoUsuario.set(msg.from, input);

        if (input === '1') {
            await client.sendMessage(msg.from,
                'Dentro da fotografia infantil, o que você procura? ✨\n\n a) 📸 Ensaio em Estúdio\n b) 🌿 Ensaio Externo\n c) 🎉 Festa de Aniversário Infantil');
        } else if (input === '2') {
            await client.sendMessage(msg.from,
                'Os 15 anos são um momento mágico! ✨ Você gostaria de:\n\n a) 📸 Apenas o ensaio fotográfico\n b) 🎊 Apenas a cobertura da festa\n c) 💖 Ensaio + Festa (pacote completo)');
        } else if (input === '3') {
            await client.sendMessage(msg.from,
                'Que tipo de ensaio você está buscando? 💁‍♀️\n\n a) 👩‍💼 Ensaio Corporativo\n b) ✨ Ensaio Pessoal\n c) 🤰 Ensaio Gestante\n d) 👨‍👩‍👧 Ensaio em Família');
        } else if (input === '4') {
            await client.sendMessage(msg.from,
                'Qual evento você precisa registrar? 🎉\n\n a) 💍 Casamento\n b) 🎉 Aniversário Infantil\n c) ✝️ Batizado\n d) 🎓 Formatura\n e) 🥂 Confraternização\n f) 📌 Outro tipo de evento');
        } else if (input === '5') {
            await client.sendMessage(msg.from,
                '🚨 Um momento, vou te encaminhar para nosso atendimento! 🚨');
        }
        return;
    }

    // Se o usuário mandar qualquer outra coisa depois de escolher o menu, só envia o aviso
    if (contextoUsuario.get(msg.from)) {
        await client.sendMessage(msg.from, '🚨 Um momento, vou te encaminhar para nosso atendimento! 🚨');
    }
});

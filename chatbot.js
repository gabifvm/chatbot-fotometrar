const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));
const contextoUsuario = new Map();
const mediaRecebida = new Map();

// Cria o cliente com autenticação local (pasta .wwebjs_auth)
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Gera o QR Code para conectar
client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

// Mensagem de sucesso
client.on('ready', () => {
  console.log('✅ Tudo certo! WhatsApp conectado.');
});

client.on('authenticated', () => {
  console.log('🔐 Autenticado com sucesso.');
});

client.on('auth_failure', msg => {
  console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', reason => {
  console.log('🔌 Desconectado:', reason);
});

// Inicializa o cliente
client.initialize();

// Tratamento de mensagens
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
    mediaRecebida.set(msg.from, false);
    return;
  }

  if (["1", "2", "3", "4", "5"].includes(input)) {
    contextoUsuario.set(msg.from, input);
    mediaRecebida.set(msg.from, false);

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

  const midiaBase = path.join(__dirname, 'midias');
  const opcoesMidia = {
    '1.a': 'infantil estudio.jpeg',
    '1.b': 'infantil externo.jpeg',
    '1.c': 'festa kid.jpeg',
    '2.a': '15 ANOS.pdf',
    '2.b': '15 ANOS.pdf',
    '2.c': '15 ANOS.pdf',
    '3.a': 'corporativo.jpeg',
    '3.b': 'pessoal.jpeg',
    '3.c': 'gestante.jpeg',
    '3.d': 'familia.jpeg',
    '4.a': 'CASAMENTO.pdf',
    '4.b': 'festa kid.jpeg',
    '4.c': 'batizado.jpeg',
    '4.e': 'confra.jpeg'
  };

  if (input.match(/^[a-f]$/i)) {
    const contexto = contextoUsuario.get(msg.from);
    if (contexto) {
      const chave = `${contexto}.${input}`;
      const arquivo = opcoesMidia[chave];
      if (arquivo) {
        const filePath = path.join(midiaBase, arquivo);
        const media = MessageMedia.fromFilePath(filePath);
        await delay(2000);
        await client.sendMessage(msg.from, media);
        mediaRecebida.set(msg.from, true);
      } else {
        await client.sendMessage(msg.from, 'Ops! Não encontrei essa opção. Tente novamente.');
      }
    } else {
      await client.sendMessage(msg.from, 'Por favor, escolha uma das opções do menu primeiro. 😊');
    }
    return;
  }

  if (mediaRecebida.get(msg.from)) {
    await client.sendMessage(msg.from, '🚨 Um momento, vou te encaminhar para nosso atendimento! 🚨');
    mediaRecebida.set(msg.from, false);
  }
});

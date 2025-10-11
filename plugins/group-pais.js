import fetch from "node-fetch";

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args}) => {
  const chat = global.db.data.chats[m.chat] || {};
  // const emoji = chat.emojiTag || '🤖'; // Ya no se usa

  // Asegurar que solo administradores u dueños puedan usar el comando
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw new Error('No tienes permisos para usar este comando.');
}

  const customMessage = args.join(' ');
  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject;

  // Lista de prefijos de países y sus banderas (más completa y enfocada en países latinos)
  const countryFlags = {
    '1': '🇺🇸', '44': '🇬🇧', '33': '🇫🇷', '49': '🇩🇪', '39': '🇮🇹', '81': '🇯🇵',
    '86': '🇨🇳', '7': '🇷🇺', '91': '🇮🇳', '61': '🇦🇺', '34': '🇪🇸', '55': '🇧🇷',
    '52': '🇲🇽', '54': '🇦🇷', '57': '🇨🇴', '51': '🇵🇪', '56': '🇨🇱', '58': '🇻🇪',
    '591': '🇧🇴', '593': '🇪🇨', '595': '🇵🇾', '598': '🇺🇾', '502': '🇬🇹', '503': '🇸🇻',
    '504': '🇭🇳', '505': '🇳🇮', '506': '🇨🇷', '507': '🇵🇦', '53': '🇨🇺', '1809': '🇩🇴',
    '1829': '🇩🇴', '1849': '🇩🇴', '1787': '🇵🇷', '1939': '🇵🇷', '509': '🇭🇹', '1876': '🇯🇲',
    '244': '🇦🇴', '225': '🇨🇮', '234': '🇳🇬', '27': '🇿🇦', '212': '🇲🇦', '237': '🇨🇲',
    '63': '🇵🇭', '62': '🇮🇩', '60': '🇲🇾', '65': '🇸🇬', '66': '🇹🇭', '90': '🇹🇷'
    // Añadir más prefijos si es necesario
};

  const getCountryInfo = (id) => {
    const phoneNumber = id.split('@')[0];
    let prefix = '';
    let countryName = 'Desconocido';
    let flag = '🌎'; // Bandera neutra por defecto

    // Buscar prefijo de 3 dígitos
    if (phoneNumber.length >= 3 && countryFlags[phoneNumber.substring(0, 3)]) {
      prefix = phoneNumber.substring(0, 3);
    } 
    // Buscar prefijo de 2 dígitos
    else if (phoneNumber.length >= 2 && countryFlags[phoneNumber.substring(0, 2)]) {
      prefix = phoneNumber.substring(0, 2);
    }
    // Buscar prefijo de 1 dígito (principalmente para el +1)
    else if (phoneNumber.length >= 1 && countryFlags[phoneNumber.substring(0, 1)]) {
      prefix = phoneNumber.substring(0, 1);
    }

    if (prefix) {
      flag = countryFlags[prefix];
      // Nota: Para obtener el nombre del país se necesitaría un mapa más grande, 
      // pero por ahora solo retornamos el prefijo y la bandera
      countryName = `+${prefix}`; 
    }

    return { flag, countryName };
  };

  let messageText = `*${groupName}*\n\n*Integrantes: ${participants.length}*\n${customMessage}\n┌──⭓ *Lista de Paises*\n`;
  for (const mem of participants) {
    const info = getCountryInfo(mem.id);
    // Cambiado 'emoji' por 'info.countryName' para mostrar el prefijo del país
    messageText += `${info.flag} ${info.countryName} @${mem.id.split('@')[0]}\n`; 
}
  messageText += `└───────⭓\n\n𝘚𝘶𝘱𝘦𝘳 𝘉𝘰𝘵 𝘞𝘩𝘢𝘵𝘴𝘈𝘱𝘱 🚩`;

  const imageUrl = 'https://cdn-sunflareteam.vercel.app/images/fa68a035ca.jpg';
  // const audioUrl = 'https://cdn.russellxz.click/a8f5df5a.mp3'; // Audio eliminado

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "AlienMenu"
},
    message: {
      locationMessage: {
        name: "*Sasuke Bot MD 🌀*",
        jpegThumbnail: await (await fetch('https://cdn-sunflareteam.vercel.app/images/fa68a035ca.jpg')).buffer(),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Sasuke;;;\n" +
          "FN:Sasuke Bot\n" +
          "ORG:Barboza Developers\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Alien\n" +
          "X-WA-BIZ-DESCRIPTION:🛸 Llamado grupal universal con estilo.\n" +
          "X-WA-BIZ-NAME:Sasuke\n" +
          "END:VCARD"
}
},
    participant: "0@s.whatsapp.net"
};

  // Envío del mensaje con la imagen y el caption (taggeando a todos)
  await conn.sendMessage(m.chat, {
    image: { url: imageUrl},
    caption: messageText,
    mentions: participants.map(a => a.id)
}, { quoted: fkontak});

  // El envío del audio ha sido eliminado
  /*
  await conn.sendMessage(m.chat, {
    audio: { url: audioUrl},
    mimetype: 'audio/mp4',
    ptt: true
}, { quoted: fkontak});
  */
};

// Comando y etiquetas actualizadas
handler.help = ['pais'];
handler.tags = ['group'];
handler.command = /^(pais|bandera|paises)$/i; // Ahora el comando es /pais o /bandera o /paises
handler.admin = true; // Se mantiene como admin
handler.group = true;

export default handler;
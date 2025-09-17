import { sticker} from '../lib/sticker.js';

let handler = async (m, { conn, text, usedPrefix, command}) => {
  // Validación de texto
  if (!text) {
    return m.reply(
      `《★》Ingresa un texto para crear tu sticker\n> *Ejemplo:* ${usedPrefix + command} Hola mundo`
);
}

  try {
    const username = conn.getName(m.sender);
    const apiUrl = `https://star-void-api.vercel.app/api/brat?text=${encodeURIComponent(text)}`;
    const stiker = await sticker(null, apiUrl, text, username);

    await conn.sendFile(
      m.chat,
      stiker,
      'brat.webp',
      '',
      m,
      true,
      {
        contextInfo: {
          forwardingScore: 200,
          isForwarded: false,
          externalAdReply: {
            showAdAttribution: false,
            title: `Sticker: ${text}`,
            body: `Creado por ${username}`,
            mediaType: 2,
            sourceUrl: 'https://github.com/WillZek', // Puedes cambiar esto
            thumbnail: 'https://i.imgur.com/JP52fdP.jpg' // Imagen de vista previa
}
}
}
);
} catch (e) {
    console.error('Error al generar sticker:', e);
    return m.reply(
      `《★》Ocurrió un error al generar el sticker\n> Intenta nuevamente más tarde.`
);
}
};

handler.help = ['brat <texto>'];
handler.tags = ['sticker'];
handler.command = /^brat$/i;

export default handler;
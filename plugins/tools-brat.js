
import { sticker} from '../lib/sticker.js';

let handler = async (m, { conn, text, usedPrefix, command}) => {
  // Validación de entrada
  if (!text) {
    return m.reply(
      `╭─⬣「 *STICKER TEXTO* 」⬣
│ ≡◦ 🧩 *Ingresa un texto para crear tu sticker.*
│ ≡◦ ✏️ *Ejemplo:* ${usedPrefix + command} Hola mundo
╰─⬣`
);
}

  try {
    const username = conn.getName(m.sender);
    const apiUrl = `https://star-void-api.vercel.app/api/brat?text=${encodeURIComponent(text)}`;
    const stickerBuffer = await sticker(null, apiUrl, text, username);

    await conn.sendFile(
      m.chat,
      stickerBuffer,
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
            sourceUrl: 'https://github.com/WillZek',
            thumbnail: imagen1 // Asegúrate de que esta variable esté definida globalmente
}
}
}
);
} catch (e) {
    console.error(e);
    return m.reply(
      `╭─⬣「 *STICKER TEXTO* 」⬣
│ ≡◦ ⚠️ *Ocurrió un error al generar el sticker.*
│ ≡◦ Intenta nuevamente más tarde.
╰─⬣`
);
}
};

handler.help = ['brat <texto>'];
handler.tags = ['sticker'];
handler.command = /^brat$/i;

export default handler;
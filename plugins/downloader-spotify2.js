
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) throw m.reply(`
╭━━〔 *❌ FALTA TEXTO* 〕━━⬣
┃ 🍡 *Usa el comando así:*
┃ ⎔ ${usedPrefix + command} <nombre canción>
┃ 💽 *Ejemplo:* ${usedPrefix + command} Believer
╰━━━━━━━━━━━━━━━━━━━━⬣
  `.trim());

  await m.react('🌀');

  try {
    const apiKey = "sylphy-e321";
    const searchUrl = `https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(text)}&apikey=sylphy-e321`;
    const res = await fetch(searchUrl);
    const json = await res.json();

    if (!json?.res?.url) {
      throw new Error('No se encontró la canción o no se pudo descargar.');
}

    const { title, thumbnail, url} = json.res;

    // Enviar imagen si existe
    if (thumbnail) {
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail},
        caption: `🎶 *${title || text}*\n🎤 *Spotify Track*`
}, { quoted: m});
}

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
}, { quoted: m});

    // Confirmación final
    await m.reply(`
╭━〔 *🔊 SPOTIFY - SASUKE BOT* 〕━⬣
┃ 🌀 *Petición:* ${text}
┃ ✅ *Estado:* Canción enviada con éxito.
╰━━━━━━━━━━━━━━━━━━━━⬣
    `.trim());

    await m.react('🎵');
} catch (e) {
    console.error(e);
    await m.reply('❌ Hubo un error al procesar tu solicitud. Intenta con otro nombre de canción o verifica el enlace.');
    await m.react('❌');
}
};

handler.help = ['music *<texto>*'];
handler.tags = ['descargas'];
handler.command = ['music'];

export default handler;
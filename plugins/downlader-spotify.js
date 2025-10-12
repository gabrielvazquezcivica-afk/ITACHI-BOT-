import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command}) => {
  const thumbnailCard = 'https://files.catbox.moe/he2fri.jpg';

  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `🎧 *Ingresa el enlace de una canción de Spotify.*\n\n📌 *Ejemplo:* ${usedPrefix + command} https://open.spotify.com/track/xyz`,
      footer: '🔍 Sylphy API - Spotify Downloader',
      contextInfo: {
        externalAdReply: {
          title: 'Spotify Downloader 🎶',
          body: 'Descarga directa desde Spotify',
          thumbnailUrl: thumbnailCard,
          sourceUrl: 'https://api.sylphy.xyz'
}
}
}, { quoted: m});
}

  const isSpotifyLink = text.includes('spotify.com/track');
  if (!isSpotifyLink) {
    return m.reply("❌ *Solo se aceptan enlaces directos de Spotify.*");
}

  const apiKey = "sylphy-e321";
  const apiUrl = `https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(text)}&apikey=sylphy-e321`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.res?.url) {
      return m.reply("⚠️ No se pudo obtener el archivo desde Spotify.");
}

    const { title, thumbnail, url} = data.res;

    const caption = `
╭━━━〔 *SPOTIFY - SASUKE BOT 🎧* 〕━━━
┃🎵 *Título:* ${title}
┃🔗 *Spotify:* ${text}
╰━━━━━━━━━━━━━━━━━━━━━━
📥 *Enviando audio...*
`.trim();

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail || thumbnailCard},
      caption,
      footer: '🟢 Música desde Sylphy API',
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Haz clic para escuchar o descargar',
          thumbnailUrl: thumbnail || thumbnailCard,
          sourceUrl: url
}
}
}, { quoted: m});

    await conn.sendMessage(m.chat, {
      audio: { url},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
}, { quoted: m});

    await m.react("✅");

} catch (err) {
    console.error('❌ Error:', err);
    m.reply(`💥 *Ocurrió un error al procesar tu solicitud.*\n📛 ${err.message}`);
}
};

handler.command = ['spotify'];
export default handler;
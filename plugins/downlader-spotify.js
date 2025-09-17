
import fetch from 'node-fetch';

let handler = async (m, { conn, args, command, usedPrefix}) => {
  const url = args[0];
  if (!url ||!url.includes('spotify.com')) {
    return m.reply(
      `╭─⬣「 *SASUKE* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ ${usedPrefix + command} https://open.spotify.com/track/ID
╰─⬣`
);
}

  try {
    const res = await fetch(`https://api.lolhuman.xyz/api/spotify?apikey=beta&url=${encodeURIComponent(url)}`);
    const json = await res.json();

    if (!json.status ||!json.result) {
      return m.reply(`╭─⬣「 *SASUKE* 」⬣
│ ≡◦ ❌ *No se encontró resultado para:* ${url}
╰─⬣`);
}

    const { title, artists, thumbnail, link} = json.result;

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail},
      caption: `╭─⬣「 *INFO SPOTIFY* 」⬣
│ ≡◦ 🎵 *Título:* ${title}
│ ≡◦ 👤 *Artista:* ${artists}
│ ≡◦ 🌐 *Spotify:* ${link}
╰─⬣`
}, { quoted: m});

} catch (e) {
    console.error('Error en Spotify:', e);
    return m.reply(`╭─⬣「 *SASUKE* 」⬣
│ ≡◦ ⚠️ *Error al procesar la solicitud.*
│ ≡◦ Detalles: ${e.message}
╰─⬣`);
}
};

handler.help = ['spotify <url>'];
handler.tags = ['descargas'];
handler.command = ['spotify']

export default handler;
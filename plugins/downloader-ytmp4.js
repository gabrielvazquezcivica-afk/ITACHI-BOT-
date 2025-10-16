// Codigo Echo Por MediaHub..No Editar 
import axios from 'axios';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const formatSize = (bytes) => {
  if (!bytes) return 'Desconocido';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDuration = (seconds) => {
  if (!seconds) return 'Desconocido';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const fetchDownloadUrl = async (videoUrl) => {
  const api = `https://apis-starlights-team.koyeb.app/starlight/youtube-mp4?url=${encodeURIComponent(videoUrl)}&format=360p`;
  try {
    const { data } = await axios.get(api, { timeout: 15000 });
    if (!data?.dl_url) return null;

    return {
      title: data.title || "Sin título",
      quality: data.quality || "360p",
      thumbnail: data.thumbnail,
      author: data.author || "Desconocido",
      url: data.dl_url
    };
  } catch (error) {
    console.error(`❌ Error en la API: ${error.message}`);
    return null;
  }
};

let handler = async (m, { conn, text }) => {
  if (!text?.trim() || (!text.includes('youtube.com') && !text.includes('youtu.be'))) {
    await conn.reply(m.chat, `
╭───〔 *YTMP4* 〕───✦
│ ⚠️ Debes ingresar un enlace válido de YouTube.
│ Ejemplo: *.ytmp4 https://youtu.be/abc123*
╰───────────────✦
`, m);
    return;
  }

  const msg = await conn.reply(m.chat, `
╭───〔 *YTMP4* 〕───✦
│ 🎬 Iniciando conversión de video...
│ ⏳ Espera unos segundos por favor.
╰──────────────────✦
`, m);
  await conn.sendMessage(m.chat, { react: { text: '⏱️', key: msg.key } });

  try {
    const info = await fetchDownloadUrl(text);
    if (!info) throw new Error("No se pudo obtener el enlace de descarga.");

   
    await conn.sendMessage(m.chat, { react: { text: '✅', key: msg.key } });

    
    const caption = `*💌 ${info.title}*\n> ⚖️ Peso: Desconocido\n> ⏱️ Duración: Desconocido\n> 🌎 URL: ${text}`;

    await conn.sendMessage(m.chat, {
      video: { url: info.url },
      mimetype: 'video/mp4',
      fileName: `${info.title}.mp4`,
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("❌ Error general:", error);
    await conn.sendMessage(m.chat, { react: { text: '🔴', key: msg.key } });
    await conn.reply(m.chat, `
╭───〔 *Error al procesar* 〕───✦
│ ⚠️ ${error.message || "Ocurrió un error desconocido."}
│ 🔁 Intenta nuevamente más tarde.
╰─────────────────────✦
`, m);
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['descargas'];
handler.command = /^ytmp4$/i;

export default handler;

// Codigo Echo Por MediaHub..No Editar Ni Copiar Para Sus Bots Bugs
import axios from 'axios';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchDownloadUrl = async (videoUrl) => {
  const api = `https://apis-mediahub.vercel.app/api/ytmp3?url=${encodeURIComponent(videoUrl)}`;
  try {
    const { data } = await axios.get(api, { timeout: 15000 });
    if (data?.status !== 200 || !data?.data?.download) return null;

    return {
      title: data.data.title,
      duration: data.data.duration,
      thumbnail: data.data.thumbnail,
      url: data.data.download
    };
  } catch (error) {
    console.error(`❌ Error en la API: ${error.message}`);
    return null;
  }
};

const sendAudioWithRetry = async (conn, chat, audioUrl, title, thumbnail, maxRetries = 2) => {
  let attempt = 0;
  let thumbBuffer;

  try {
    const response = await axios.get(thumbnail, { responseType: 'arraybuffer' });
    thumbBuffer = Buffer.from(response.data, 'binary');
  } catch {
    console.warn("⚠️ Miniatura no disponible.");
  }

  while (attempt < maxRetries) {
    try {
      await conn.sendMessage(chat, {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        contextInfo: {
          externalAdReply: {
            title: title,
            body: "Tu descarga está lista 🎧",
            thumbnail: thumbBuffer,
            mediaType: 1,
            renderLargerThumbnail: false,
            sourceUrl: 'https://youtube.com'
          }
        }
      });
      return;
    } catch (error) {
      console.error(`❌ Error al enviar audio (intento ${attempt + 1}): ${error.message}`);
      if (attempt < maxRetries - 1) await wait(10000);
    }
    attempt++;
  }
};

let handler = async (m, { conn, text }) => {
  if (!text?.trim() || (!text.includes('youtube.com') && !text.includes('youtu.be'))) {
    await conn.reply(m.chat, `
╭───〔 *YTMP3* 〕───✦
│ ⚠️ Debes ingresar un enlace válido de YouTube.
│ Ejemplo: *.ytmp3 https://youtu.be/abc123*
╰───────────────✦
`, m);
    return;
  }

  const msg = await conn.reply(m.chat, `
╭───〔 *YTMP3* 〕───✦
│ 🔄 Procesando tu enlace...
│ 🎧 Espera mientras preparo el audio.
╰──────────────────✦
`, m);
  await conn.sendMessage(m.chat, { react: { text: '🎶', key: msg.key } });

  try {
    const info = await fetchDownloadUrl(text);
    if (!info) throw new Error("No se pudo obtener el enlace de descarga.");

    await conn.sendMessage(m.chat, { react: { text: '🟢', key: msg.key } });

    await conn.reply(m.chat, `
╭───〔 *Descargando* 〕──✦
│ 📀 *Título:* ${info.title}
│ ⏱️ *Duración:* ${info.duration}
│ 📦 *Formato:* MP3 (audio)
│ 🔗 *Fuente:* YouTube
│ ⬇️ Enviando archivo...
╰──────────────────✦
`, m);

    await sendAudioWithRetry(conn, m.chat, info.url, info.title, info.thumbnail);
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

handler.help = ['ytmp3 <url>'];
handler.tags = ['descargas'];
handler.command = /^ytmp3$/i;

export default handler;

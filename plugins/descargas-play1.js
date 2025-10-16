import yts from "yt-search";
import fetch from "node-fetch";

const limit = 100;

const handler = async (m, { conn, text, command }) => {
  if (!text || !text.trim()) {
    return m.reply("🔎 *Por favor ingresa el nombre de un video o una URL de YouTube.*");
  }

  await m.react("🎶");

  try {
    const res = await yts(text.trim());
    if (!res || !res.all || res.all.length === 0) {
      return m.reply("❌ *No se encontraron resultados para tu búsqueda.*");
    }

    const video = res.all[0];
    const caption = `
╭─[*Sasuke YouTube*]─╮
│
│ 📌 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration.timestamp}
│ 👁️ *Vistas:* ${video.views.toLocaleString()}
│ 🔗 *Enlace:* ${video.url}
╰──────────────────╯

📥 *Procesando tu descarga...*
`;

    const thumbnailRes = await fetch(video.thumbnail);
    const thumbnail = await thumbnailRes.buffer();
    await conn.sendFile(m.chat, thumbnail, "thumb.jpg", caption, m);

    if (command === "play") {
      let apiRes;
      try {
        apiRes = await fetch(`https://apis-starlights-team.koyeb.app/starlight/youtube-mp3?url=${encodeURIComponent(video.url)}&format=mp3`);
      } catch {
        apiRes = await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=sylphy-e321`);
      }

      const api = await apiRes.json();
      const dl = api.dl_url || (api.res ? api.res.url : null);

      if (!dl) return m.reply("❌ *No se pudo obtener el audio.*");

      await conn.sendFile(m.chat, dl, `${video.title}.mp3`, "", m, null, {
        mimetype: "audio/mpeg",
        ptt: false
      });
      await m.react("✅");

    } else if (command === "play2" || command === "playvid") {
      let apiRes;
      try {
        apiRes = await fetch(`https://apis-starlights-team.koyeb.app/starlight/youtube-mp4?url=${encodeURIComponent(video.url)}&format=360p`);
      } catch {
        apiRes = await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=sylphy-e321`);
      }

      const api = await apiRes.json();
      const dl = api.dl_url || (api.res ? api.res.url : null);

      if (!dl) return m.reply("❌ *No se pudo obtener el video.*");

      const fileRes = await fetch(dl);
      const contentLength = fileRes.headers.get("Content-Length");
      const bytes = parseInt(contentLength || 0, 10);
      const sizeMB = bytes / (1024 * 1024);
      const sendAsDoc = sizeMB >= limit;

      await conn.sendFile(m.chat, dl, `${video.title}.mp4`, "", m, null, {
        asDocument: sendAsDoc,
        mimetype: "video/mp4"
      });

      await m.react("📽️");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    return m.reply("⚠️ *Ocurrió un error al procesar tu solicitud.*");
  }
};

handler.help = ["play", "play2", "playvid"];
handler.tags = ["descargas", "youtube"];
handler.command = ["play", "play2", "playvid"];

export default handler;

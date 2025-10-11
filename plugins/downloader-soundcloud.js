
import yts from "yt-search";
import fetch from "node-fetch";

const limit = 100;

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("🔎 *Por favor ingresa el nombre de un video o una URL de YouTube.*");

  await m.react("🎶");

  const res = await yts(text);
  if (!res ||!res.all || res.all.length === 0) {
    return m.reply("❌ *No se encontraron resultados para tu búsqueda.*");
}

  const video = res.all[0];
  const caption = `
╭─🎬 *Sasuke Bot - YouTube Finder* 🎬─╮
│
│ 📌 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration.timestamp}
│ 👁️ *Vistas:* ${video.views.toLocaleString()}
│ 🔗 *Enlace:* ${video.url}
│
╰──────────────────────────────╯

📥 *Procesando tu descarga...*
`;

  const thumbnail = await (await fetch(video.thumbnail)).buffer();
  await conn.sendFile(m.chat, thumbnail, "thumb.jpg", caption, m);

  try {
    if (command === "play") {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=sylphy-e321`)).json();
      await conn.sendFile(m.chat, api.res.url, `${video.title}.mp3`, "", m);
      await m.react("✅");
} else if (command === "play2" || command === "playvid") {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${video.url}&apikey=sylphy-e321`)).json();
      const dl = api.res.url;

      const res = await fetch(dl);
      const cont = res.headers.get("Content-Length");
      const bytes = parseInt(cont, 10);
      const sizemb = bytes / (1024 * 1024);
      const doc = sizemb>= limit;

      await conn.sendFile(m.chat, dl, `${video.title}.mp4`, "", m, null, {
        asDocument: doc,
        mimetype: "video/mp4"
});

      await m.react("📽️");
}
} catch (error) {
    console.error(error);
    return m.reply("⚠️ *Ocurrió un error al procesar tu solicitud.*");
}
};

handler.help = ["play", "play2"];
handler.tags = ["descargas", "youtube"];
handler.command = ["play", "play2", "playvid"];

export default handler;

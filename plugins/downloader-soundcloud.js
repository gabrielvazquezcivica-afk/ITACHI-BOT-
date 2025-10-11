
import yts from "yt-search";
import fetch from "node-fetch";

const limit = 100;

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("🌀 *Sasuke Bot* necesita que escribas el nombre de un video o una URL de YouTube.");

  await m.react("🔎");

  const res = await yts(text);
  if (!res ||!res.all || res.all.length === 0) {
    return m.reply("⚠️ No se encontraron resultados para tu búsqueda.");
}

  const video = res.all[0];
  const total = Number(video.duration.seconds) || 0;

  const caption = `
╭─「 *📺 Sasuke Bot - YouTube Search* 」─╮
│
│ 🌀 *Título:* ${video.title}
│ 🧠 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration.timestamp}
│ 👁️ *Vistas:* ${video.views.toLocaleString()}
│ 🔗 *Enlace:* ${video.url}
│
╰───────────────╯

*🌀 Descargando...*
`;

  const thumbnailBuffer = await (await fetch(video.thumbnail)).buffer();
  await conn.sendFile(m.chat, thumbnailBuffer, "thumb.jpg", caption, m);

  if (command === "play") {
    try {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=S`)).json();
      await conn.sendFile(m.chat, api.res.url, `${video.title}.mp3`, "", m);
      await m.react("🎧");
} catch (error) {
      return m.reply("❌ Error al descargar el audio.");
}
} else if (command === "play2" || command === "playvid") {
    try {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${video.url}&apikey=S`)).json();
      const dl = api.res.url;
      const res = await fetch(dl);
      const cont = res.headers.get('Content-Length');
      const bytes = parseInt(cont, 10);
      const sizemb = bytes / (1024 * 1024);
      const doc = sizemb>= limit;

      await conn.sendFile(m.chat, dl, `${video.title}.mp4`, "", m, null, {
        asDocument: doc,
        mimetype: "video/mp4"
});
      await m.react("🎬");
} catch (error) {
      return m.reply("❌ Error al descargar el video.");
}
}
};

handler.help = ["play1", "play2"];
handler.tags = ["descargas", "youtube"];
handler.command = ["play1", "play2", "playvid"];

export default handler;
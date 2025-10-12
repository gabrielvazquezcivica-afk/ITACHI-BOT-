import yts from "yt-search";

const limit = 100;

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("🎯 *Escribe el nombre de un video o pega una URL de YouTube.*");

  await m.react("🔍");

  let res = await yts(text);
  if (!res ||!res.all || res.all.length === 0) {
    return m.reply("🚫 *No encontré resultados. Intenta con otro título o URL.*");
}

  let video = res.all[0];
  let total = Number(video.duration.seconds) || 0;

  const caption = `
╭─🎧 *SASUKE BOT - YOUTUBE PLAYER* 🎧─╮
│
│ 📀 *Título:* ${video.title}
│ 👤 *Canal:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration.timestamp}
│ 👁️ *Vistas:* ${video.views.toLocaleString()}
│ 🌐 *Link:* ${video.url}
│ 📡 *Estado:* Preparando descarga...
╰────────────────────────────────────╯
`;

  await conn.sendFile(
    m.chat,
    await (await fetch(video.thumbnail)).buffer(),
    "thumb.jpg",
    caption,
    m
);

  try {
    if (command === "play1") {
      const api = await (
        await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=sylphy-e321`)
).json();

      const audioCap = `
🎶 *Descarga lista:* ${video.title}
📥 *Formato:* MP3
✅ *¡Reproduciendo audio ahora!*
`;

      await conn.sendFile(m.chat, api.res.url, `${video.title}.mp3`, audioCap, m);
      await m.react("🎧");
} else if (command === "play3" || command === "playvid") {
      const api = await (
        await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${video.url}&apikey=sylphy-e321`)
).json();

      let dl = api.res.url;
      const res = await fetch(dl);
      const cont = res.headers.get("Content-Length");
      const bytes = parseInt(cont, 10);
      const sizemb = bytes / (1024 * 1024);
      const doc = sizemb>= limit;

      const videoCap = `
🎬 *Descarga lista:* ${video.title}
📥 *Formato:* MP4
📦 *Tamaño:* ${sizemb.toFixed(2)} MB
✅ *¡Reproduciendo video ahora!*
`;

      await conn.sendFile(
        m.chat,
        dl,
        `${video.title}.mp4`,
        videoCap,
        m,
        null,
        { asDocument: doc, mimetype: "video/mp4"}
);
      await m.react("🎬");
}
} catch (error) {
    return m.reply(`⚠️ *Error:* ${error.message}`);
}
};

handler.help = ["play"];
handler.tags = ["descargas"];
handler.command = ["play"];

export default handler;

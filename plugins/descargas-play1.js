import yts from "yt-search";
const limit = 100;

const handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply("🌀 Ingresa el nombre de un video o una URL de YouTube.");

  await m.react("🌀");

  let res = await yts(text);
  if (!res ||!res.all || res.all.length === 0) {
    return m.reply("❌ No se encontraron resultados para tu búsqueda.");
}

  let video = res.all[0];
  let total = Number(video.duration.seconds) || 0;

  const banner = `
╭─🎶 *Sasuke Bot - Audio YouTube* 🎶─╮
│
│ 🎵 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration.timestamp}
│ 📥 *Descargando archivo de audio...*
╰──────────────────────────────────╯
`;

  await conn.sendFile(
    m.chat,
    await (await fetch(video.thumbnail)).buffer(),
    "thumb.jpg",
    banner,
    m
);

  try {
    if (command === "play") {
      const api = await (
        await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=sylphy-e321`)
).json();

      await conn.sendFile(m.chat, api.res.url, `${video.title}.mp3`, "", m);
      await m.react("✔️");

} else if (command === "play5" || command === "playvid") {
      const api = await (
        await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${video.url}&apikey=sylphy-e321`)
).json();

      let dl = api.res.url;
      const res = await fetch(dl);
      const cont = res.headers.get("Content-Length");
      const bytes = parseInt(cont, 10);
      const sizemb = bytes / (1024 * 1024);
      const doc = sizemb>= limit;

      await conn.sendFile(
        m.chat,
        dl,
        `${video.title}.mp4`,
        "",
        m,
        null,
        { asDocument: doc, mimetype: "video/mp4"}
);
      await m.react("✔️");
}
} catch (error) {
    return m.reply(`⚠️ Error: ${error.message}`);
}
};

handler.help = ["play", "play5", "playvid"];
handler.tags = ["download"];
handler.command = ["play", "play5", "playvid"];

export default handler;
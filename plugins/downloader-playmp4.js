
import yts from "yt-search";
import fetch from "node-fetch";

const handler = async (m, { conn, text}) => {
  if (!text) {
    return m.reply("🎧 *Ingresa el nombre de un video o una URL de YouTube para descargar el audio.*");
}

  await m.react("🔎");

  try {
    const search = await yts(text);
    const video = search?.videos?.[0];

    if (!video) {
      return m.reply("❌ *No se encontró ningún resultado para tu búsqueda.*");
}

    const apiUrl = `https://api.sylphy.xyz/download/ytmp3/?url=${video.url}&apikey=sylphy-e321`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data?.res?.url) {
      return m.reply("⚠️ *No se pudo obtener el audio desde la API.*");
}

    const caption = `
╭─🎶 *Sasuke Bot - Audio YouTube* 🎶─╮
│
│ 🎵 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author.name}
│ ⏱️ *Duración:* ${video.duration.timestamp}
│ 📥 *Descargando archivo de audio...*
╰──────────────────────────────────╯
`;

    const thumbnail = await (await fetch(video.thumbnail)).buffer();
    await conn.sendFile(m.chat, thumbnail, "thumb.jpg", caption, m);

    const audioRes = await fetch(data.res.url);
    const audioBuffer = await audioRes.buffer();

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${video.title}.mp3`
}, { quoted: m});

    await m.react("✅");

} catch (err) {
    console.error(err);
    return m.reply("💥 *Ocurrió un error al procesar tu solicitud.*");
}
};

handler.help = ["play"];
handler.tags = ["descargas", "youtube"];
handler.command = ["play"];

export default handler;
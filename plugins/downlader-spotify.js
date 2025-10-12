
import fetch from "node-fetch";

const handler = async (m, { conn, text}) => {
  if (!text) {
    return m.reply("🎧 Ingresa el enlace de una canción de Spotify.");
}

  await m.react("🔎");

  const apiUrl = `https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(text)}&apikey=sylphy-e321`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data ||!data.res ||!data.res.url) {
      return m.reply("❌ No se pudo obtener el archivo desde Spotify.");
}

    const { title, thumbnail, url} = data.res;

    const caption = `
╭─🎶 *Sasuke Bot - Spotify Downloader* 🎶─╮
│
│ 🎵 *Título:* ${title}
│ 🔗 *Enlace:* ${text}
│ 📥 *Descargando archivo...*
│
╰──────────────────────────────╯
`;

    const thumb = await (await fetch(thumbnail)).buffer();
    await conn.sendFile(m.chat, thumb, "spotify.jpg", caption, m);
    await conn.sendFile(m.chat, url, `${title}.mp3`, "", m);
    await m.react("✅");

} catch (error) {
    console.error(error);
    return m.reply("⚠️ Ocurrió un error al procesar tu solicitud.");
}
};

handler.help = ["spotify"];
handler.tags = ["descargas", "musica"];
handler.command = ["spotify"];

export default handler;
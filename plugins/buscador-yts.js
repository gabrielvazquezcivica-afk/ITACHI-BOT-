
const handler = async (m, { conn, text}) => {
  const query = text || "Messi"; // Puedes cambiar esto por cualquier término
  const apikey = "sylphy-e321";

  try {
    const res = await fetch(`https://api.sylphy.xyz/search/youtube?q=${encodeURIComponent(query)}&apikey=sylphy-e321`);
    const json = await res.json();

    if (!json.status ||!json.res || json.res.length === 0) {
      return m.reply("❌ No se encontraron resultados.");
}

    const video = json.res[0]; // Primer resultado

    const banner = `
╭─🎶 *Sasuke Bot - Audio YouTube* 🎶─╮
│
│ 🎵 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author}
│ ⏱️ *Duración:* ${video.duration}
│ 👁️ *Vistas:* ${video.views.toLocaleString()}
│ 📅 *Publicado:* ${video.published}
│ 🔗 *Enlace:* ${video.url}
│ 📥 *Descargando archivo de audio...*
╰──────────────────────────────────╯
`;

    await conn.sendFile(
      m.chat,
      video.thumbnail,
      "thumb.jpg",
      banner,
      m
);

} catch (error) {
    return m.reply(`⚠️ Error: ${error.message}`);
}
};

handler.help = ["ytsearch"];
handler.tags = ["search"];
handler.command = ["ytsearch", "buscar"];

export default handler;

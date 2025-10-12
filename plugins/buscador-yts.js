const ytSearchHandler = async (m, { conn, text, usedPrefix, command}) => {
  const apikey = "sylphy-e321";

  // Validar entrada
  if (!text ||!text.trim()) {
    await conn.reply(
      m.chat,
      `📌 *Uso correcto:*\n${usedPrefix + command} <término de búsqueda>\n📍 *Ejemplo:* ${usedPrefix + command} Nio Garcia Infinitamente remix`,
      m
);
    return;
}

  const query = text.trim();
  await conn.reply(m.chat, `🔎 Buscando en YouTube por: *${query}*`, m);

  try {
    const res = await fetch(`https://api.sylphy.xyz/search/youtube?q=${encodeURIComponent(query)}&apikey=${apikey}`);
    const json = await res.json();

    if (!json.status ||!json.res || json.res.length === 0) {
      return m.reply("❌ No se encontraron resultados.");
}

    const videos = json.res.slice(0, 5); // Primeros 5 resultados

    for (const video of videos) {
      const caption = `
╭─🎶 *Sasuke Bot - Audio YouTube* 🎶─╮
│
│ 🎵 *Título:* ${video.title}
│ 👤 *Autor:* ${video.author}
│ ⏱️ *Duración:* ${video.duration}
│ 👁️ *Vistas:* ${video.views.toLocaleString()}
│ 📅 *Publicado:* ${video.published}
│ 🔗 *Enlace:* ${video.url}
│
│ 🎧 *Para descargar:*
│.ytmp3+ ${video.url}  ➤ Audio
│.ytmp4+ ${video.url}  ➤ Video
╰──────────────────────────────────╯

> © Código Oficial de Barboza MD™
`;

      await conn.sendMessage(
        m.chat,
        { image: { url: video.thumbnail}, caption},
        { quoted: m}
);
}
} catch (error) {
    console.error("❌ Error:", error);
    await conn.reply(m.chat, `🚨 *Error:* ${error.message || "Error desconocido"}`, m);
}
};

ytSearchHandler.help = ["ytsearch", "yts <texto>"];
ytSearchHandler.tags = ["búsquedas"];
ytSearchHandler.command = /^(ytsearch|yts)$/i;

export default ytSearchHandler;
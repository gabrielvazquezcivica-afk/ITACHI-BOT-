
const handler = async (m, { conn, text}) => {
  const query = text || "Messi";
  const apikey = "sylphy-e321";

  try {
    const res = await fetch(`https://api.sylphy.xyz/stickerly/search?q=${encodeURIComponent(query)}&apikey=sylphy-e321`);
    const json = await res.json();

    if (!json.status ||!json.res || json.res.length === 0) {
      return m.reply("❌ No se encontraron stickers.");
}

    const packs = json.res.slice(0, 5); // Solo los primeros 5

    for (const pack of packs) {
      const caption = `
╭─🎉 *Stickerly - Pack de Stickers* 🎉─╮
│
│ 🏷️ *Nombre:* ${pack.name}
│ 👤 *Autor:* ${pack.author}
│ 🧩 *Stickers:* ${pack.stickerCount}
│ 👁️ *Vistas:* ${pack.viewCount.toLocaleString()}
│ 📤 *Exportados:* ${pack.exportCount.toLocaleString()}
│ 🔗 *Link:* ${pack.url}
╰────────────────────────────────────╯
`;

      await conn.sendMessage(
        m.chat,
        { image: { url: pack.thumbnailUrl}, caption},
        { quoted: m}
);
}

} catch (error) {
    console.error(error);
    await m.reply(`⚠️ Error: ${error.message}`);
}
};

handler.help = ["stikerly <texto>"];
handler.tags = ["stickers"];
handler.command = ["stikerly"];

export default handler;
import yts from "yt-search";
const limit = 100;
const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply("🌴 Ingresa el nombre de un video o una URL de YouTube.");
    m.react("🌱")
    let res = await yts(text);
    if (!res || !res.all || res.all.length === 0) {
      return m.reply("No se encontraron resultados para tu búsqueda.");
    }

    let video = res.all[0];
    let total = Number(video.duration.seconds) || 0;

    const cap = `
\`\`\`⊜─⌈ 📻 ◜YouTube Play◞ 📻 ⌋─⊜\`\`\`

≡ 🌿 \`Título\` : » ${video.title}
≡ 🌾 \`Author\` : » ${video.author.name}
≡ 🌱 \`Duración\` : » ${video.duration.timestamp}
≡ 🌴 \`Vistas\` : » ${video.views}
≡ ☘️ \`URL\`      : » ${video.url}

тнe вeѕт wнaтѕapp вy ι'м ғz
`;
    await conn.sendFile(m.chat, await (await fetch(video.thumbnail)).buffer(), "image.jpg", cap, m);

    if (command === "play") {
      try {
    const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${video.url}&apikey=S`)).json()
 await conn.sendFile(m.chat, api.res.url, video.title, "", m);
            await m.react("✔️");
        } catch (error) {
          return error.message
        }
    } else if (command === "play2" || command === "playvid") {
    try {
      const api = await (await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${video.url}&apikey=S`)).json()
      let dl = api.res.url
      const res = await fetch(dl);
      const cont = res.headers.get('Content-Length');
      const bytes = parseInt(cont, 10);
      const sizemb = bytes / (1024 * 1024);
      const doc = sizemb >= limit;
 await conn.sendFile(m.chat, dl, video.title, "", m, null, { asDocument: doc, mimetype: "video/mp4" });
            await m.react("✔️");
        } catch (error) {
          return error.message
        }
    }
}
handler.help = ["play1", "play2"];
handler.tags = ["download"];
handler.command = ["play", "play2", "playvid"];
export default handler;
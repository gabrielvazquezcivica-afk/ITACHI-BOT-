
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "stellar-kxcJan1f"

  if (!text ||!text.includes("open.spotify.com/track")) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <URL de Spotify>\n📍 *Ejemplo:* ${usedPrefix + command} https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6`)
}

  try {
    const res = await fetch(`https://api.stellarwa.xyz/dow/spotify?url=${encodeURIComponent(text)}&apikey=stellar-kxcJan1f`)
    const json = await res.json()

    if (!json.status ||!json.data ||!json.data.dl_url) {
      return m.reply("❌ No se pudo descargar la canción.")
}

    const info = json.data
    const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│ 🎵 *Título:* ${info.title}
│ 👤 *Autor:* ${info.author}
│ ⏱️ *Duración:* ${info.duration}
│ 📥 *Descargando audio...*
╰────────────────────────────╯
`

    await conn.sendMessage(m.chat, { image: { url: info.image}, caption}, { quoted: m})
    await conn.sendMessage(m.chat, {
      audio: { url: info.dl_url},
      mimetype: 'audio/mp4',
      fileName: `${info.title}.m4a`
}, { quoted: m})

} catch (e) {
    console.error("Error:", e)
    m.reply("⚠️ Ocurrió un error al procesar la URL.")
}
}

handler.help = ['spotify <URL>']
handler.tags = ['music']
handler.command = /^\.spotify$/i

export default handler
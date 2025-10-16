
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "stellar-kxcJan1f"

  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de canción o URL de Spotify>\n📍 *Ejemplo:* ${usedPrefix + command} lupit\n📍 *Ejemplo:* ${usedPrefix + command} https://open.spotify.com/track/...`)
}

  const isSpotifyUrl = text.includes("open.spotify.com/track")

  try {
    let info

    if (isSpotifyUrl) {
      // 🔽 Descargar directamente desde URL
      const res = await fetch(`https://api.stellarwa.xyz/dow/spotify?url=${encodeURIComponent(text)}&apikey=stellar-kxcJan1f `)
      const json = await res.json()

      if (!json.status ||!json.data ||!json.data.dl_url) {
        return m.reply("❌ No se pudo descargar la canción desde la URL.")
}

      info = json.data
} else {
      // 🔍 Buscar canción por texto
      const searchRes = await fetch(`https://api.stellarwa.xyz/search/spotify?query=${encodeURIComponent(text)}&apikey=stellar-kxcJan1f `)
      const searchJson = await searchRes.json()

      if (!searchJson.status ||!Array.isArray(searchJson.data) || searchJson.data.length === 0) {
        return m.reply("❌ No se encontraron resultados.")
}

      const track = searchJson.data[0]
      const downloadRes = await fetch(`https://api.stellarwa.xyz/dow/spotify?url=${encodeURIComponent(track.url)}&apikey=stellar-kxcJan1f`)
      const downloadJson = await downloadRes.json()

      if (!downloadJson.status ||!downloadJson.data ||!downloadJson.data.dl_url) {
        return m.reply("❌ No se pudo descargar el audio.")
}

      info = downloadJson.data
}

    const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│
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
    m.reply("⚠️ Ocurrió un error al procesar tu solicitud.")
}
}

handler.help = ['spotify <texto o URL>']
handler.tags = ['music']
handler.command = /^spotify$/i

export default handler;
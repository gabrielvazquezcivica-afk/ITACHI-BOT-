
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "stellar-kxcJan1f"

  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de canción o URL de Spotify>\n📍 *Ejemplo:* ${usedPrefix + command} lupit\n📍 *Ejemplo:* ${usedPrefix + command} https://open.spotify.com/track/...`)
}

  // Si es una URL directa de Spotify
  if (text.includes("open.spotify.com/track")) {
    try {
      const res = await fetch(`https://api.stellarwa.xyz/dow/spotify?url=${encodeURIComponent(text)}&apikey=stellar-kxcJan1f `)
      const json = await res.json()

      if (!json.status ||!json.data ||!json.data.dl_url) {
        return m.reply("❌ No se pudo descargar la canción.")
}

      const info = json.data
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
      console.error(e)
      m.reply("⚠️ Error al descargar la canción.")
}
    return
}

  // Si es texto, buscar y descargar automáticamente el primer resultado
  try {
    const res = await fetch(`https://api.stellarwa.xyz/search/spotify?query=${encodeURIComponent(text)}&apikey=stellar-kxcJan1f `)
    const json = await res.json()

    if (!json.status ||!Array.isArray(json.data) || json.data.length === 0) {
      return m.reply("❌ No se encontraron canciones.")
}

    const track = json.data[0] // Primer resultado
    const downloadRes = await fetch(`https://api.stellarwa.xyz/dow/spotify?url=${encodeURIComponent(track.url)}&apikey=stellar-kxcJan1f`)
    const downloadJson = await downloadRes.json()

    if (!downloadJson.status ||!downloadJson.data ||!downloadJson.data.dl_url) {
      return m.reply("❌ No se pudo descargar el audio.")
}

    const info = downloadJson.data
    const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│
│ 🎵 *Título:* ${info.title}
│ 👤 *Autor:* ${info.author}
│ ⏱️ *Duración:* ${info.duration}
│ 🔗 *Enlace:* ${track.url}
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
    console.error(e)
    m.reply("⚠️ Error al buscar o descargar la canción.")
}
}

handler.help = ['spotify <texto o URL>']
handler.tags = ['music']
handler.command = /^spotify$/i

export default handler
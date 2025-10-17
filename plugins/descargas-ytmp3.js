
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "sylphy-e321"

  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <URL de YouTube>\n📍 *Ejemplo:* ${usedPrefix + command} https://youtube.com/watch?v=abc123`)
}

  if (!text.includes("youtube.com")) {
    return m.reply("❌ Por favor, proporciona una URL válida de YouTube.")
}

  try {
    const res = await fetch(`https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(text)}&apikey=sylphy-e321`)
    const json = await res.json()

    if (!json.status ||!json.data ||!json.data.dl_url) {
      return m.reply("❌ No se pudo descargar el audio.")
}

    const info = json.data
    const caption = `
╭─🎶 *YouTube MP3 Downloader* 🎶─╮
│
│ 🎵 *Título:* ${info.title}
│ ⏱️ *Duración:* ${info.duration}
│ 📥 *Descargando audio...*
╰────────────────────────────╯
`

    await conn.sendMessage(m.chat, { image: { url: info.thumbnail}, caption}, { quoted: m})
    await conn.sendMessage(m.chat, {
      audio: { url: info.dl_url},
      mimetype: 'audio/mp4',
      fileName: `${info.title}.mp3`
}, { quoted: m})

} catch (e) {
    console.error(e)
    m.reply("⚠️ Error al descargar el audio.")
}
}

handler.help = ['ytmp3 <url>']
handler.tags = ['music']
handler.command = /^ytmp3$/i

export default handler
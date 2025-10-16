
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "stellar-kxcJan1f"

  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de archivo o URL de MediaFire>\n📍 *Ejemplo:* ${usedPrefix + command} DragonBall\n📍 *Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/...`)
}

  try {
    let info

    // 🔗 Si es una URL directa de MediaFire
    if (text.includes("mediafire.com/file")) {
      const res = await fetch(`https://api.stellarwa.xyz/dow/mediafire?url=${encodeURIComponent(text)}&apikey=${apikey}`)
      const json = await res.json()

      if (json.status!== true ||!json.data ||!json.data.url) {
        return m.reply("❌ No se pudo descargar el archivo desde la URL.")
}

      info = json.data
} else {
      // 🔍 Buscar archivo por nombre
      const searchRes = await fetch(`https://api.stellarwa.xyz/search/mediafire?query=${encodeURIComponent(text)}&apikey=${apikey}`)
      const searchJson = await searchRes.json()

      if (searchJson.status!== true ||!Array.isArray(searchJson.data) || searchJson.data.length === 0) {
        return m.reply("❌ No se encontraron archivos con ese nombre.")
}

      const file = searchJson.data[0]
      const downloadRes = await fetch(`https://api.stellarwa.xyz/dow/mediafire?url=${encodeURIComponent(file.url)}&apikey=${apikey}`)
      const downloadJson = await downloadRes.json()

      if (downloadJson.status!== true ||!downloadJson.data ||!downloadJson.data.url) {
        return m.reply("❌ No se pudo descargar el archivo encontrado.")
}

      info = downloadJson.data
}

    const caption = `
╭─📁 *MediaFire Downloader* ─╮
│ 📄 *Nombre:* ${info.filename}
│ 📦 *Tamaño:* ${info.filesize}
│ 📥 *Descargando archivo...*
╰────────────────────────────╯
`

    await conn.sendMessage(m.chat, {
      document: { url: info.url, fileName: info.filename},
      mimetype: info.mimetype || 'application/octet-stream',
      caption
}, { quoted: m})

} catch (e) {
    console.error("Error:", e)
    m.reply("⚠️ Ocurrió un error al procesar tu solicitud. Verifica que la URL o el nombre sean válidos.")
}
}

handler.help = ['mediafire <texto o URL>']
handler.tags = ['downloader']
handler.command = ['media']

export default handler
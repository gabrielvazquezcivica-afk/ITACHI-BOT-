
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "stellar-kxcJan1f"

  if (!text ||!text.includes("mediafire.com/file")) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <URL de MediaFire>\n📍 *Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/...`)
}

  try {
    const res = await fetch(`https://api.stellarwa.xyz/dow/mediafire?url=${encodeURIComponent(text)}&apikey=${apikey}`)
    const json = await res.json()

    if (!json.status ||!json.data ||!json.data.url) {
      return m.reply("❌ No se pudo obtener el archivo. Verifica que la URL sea válida.")
}

    const info = json.data
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
    m.reply("⚠️ Error al procesar la URL. Puede que la API esté caída o la URL no sea compatible.")
}
}

handler.help = ['mediafire <URL>']
handler.tags = ['downloader']
handler.command = /^mediafire$/i

export default handler
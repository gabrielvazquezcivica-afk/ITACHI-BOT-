
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "sylphy-e321"

  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <URL de MediaFire>\n📍 *Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/abc123/archivo.zip`)
}

  if (!text.includes("mediafire.com")) {
    return m.reply("❌ *La URL proporcionada no parece ser de MediaFire.*")
}

  try {
    const res = await fetch(`https://api.sylphy.xyz/download/mediafire?url=${encodeURIComponent(text)}&apikey=${apikey}`)
    const json = await res.json()

    if (!json.status ||!json.data ||!json.data.dl_url) {
      return m.reply("❌ No se pudo obtener el archivo.")
}

    const info = json.data
    const caption = `
╭─📁 *MediaFire Downloader* 📁─╮
│
│ 📌 *Nombre:* ${info.filename}
│ 📦 *Tipo:* ${info.mimetype}
│ 📥 *Descargando archivo...*
╰──────────────────────────────╯
`

    await conn.sendMessage(m.chat, { image: { url: info.image || "https://i.imgur.com/JP52fdP.png"}, caption}, { quoted: m})
    await conn.sendMessage(m.chat, {
      document: { url: info.dl_url},
      mimetype: info.mimetype || 'application/octet-stream',
      fileName: info.filename
}, { quoted: m})

} catch (e) {
    console.error(e)
    m.reply("⚠️ Error al descargar el archivo.")
}
}

handler.help = ['mediafire <url>']
handler.tags = ['descargas']
handler.command = /^mediafire$/i

export default handler

import fetch from 'node-fetch'
import { Sticker} from 'wa-sticker-formatter'

const handler = async (m, { conn, text, command}) => {
  const apikey = "sylphy-e321"
  if (!text) return m.reply(`📌 Ejemplo:.${command} Messi`)

  try {
    // Buscar packs relacionados
    const res = await fetch(`https://api.sylphy.xyz/stickerly/search?q=${encodeURIComponent(text)}&apikey=${apikey}`)
    const json = await res.json()

    if (!json.status ||!Array.isArray(json.res) || json.res.length === 0) {
      return m.reply("❌ No se encontraron packs de stickers.")
}

    // Seleccionar un pack aleatorio
    const pack = json.res[Math.floor(Math.random() * json.res.length)]

    // Obtener detalles del pack (simulado, ya que Sylphy no expone stickers individuales)
    const stickerUrls = [
      pack.thumbnailUrl,
      pack.thumbnailUrl + "?v=1",
      pack.thumbnailUrl + "?v=2"
    ]

    m.reply(`🎉 Pack encontrado: *${pack.name}* de *${pack.author}*\n📦 Enviando 3 stickers diferentes...`)

    for (let i = 0; i < stickerUrls.length; i++) {
      const sticker = new Sticker(stickerUrls[i], {
        pack: pack.name,
        author: pack.author,
        type: 'full',
        categories: ['🔥'],
        id: `sylphy-${i}`
})
      const buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer}, { quoted: m})
}

} catch (e) {
    console.error(e)
    m.reply("⚠️ Error al procesar los stickers.")
}
}

handler.help = ['stikerly <consulta>']
handler.tags = ['sticker']
handler.command = /^stikerly$/i

export default handler
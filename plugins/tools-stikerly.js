
import fetch from 'node-fetch'
import { Sticker} from 'wa-sticker-formatter'

let handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply(`📌 Ejemplo:.${command} Messi`)

  try {
    const res = await fetch(`https://api.sylphy.xyz/stickerly/search?q=${encodeURIComponent(text)}&apikey=sylphy-e321`)
    const json = await res.json()

    if (!json.status ||!Array.isArray(json.res) || json.res.length === 0) {
      return m.reply('❌ No se encontraron stickers.')
}

    const pack = json.res[Math.floor(Math.random() * json.res.length)]

    m.reply(`🎉 Pack encontrado: *${pack.name}* de *${pack.author}*\n📦 Enviando 3 stickers diferentes...`)

    // Simulación de 3 stickers únicos usando variaciones del thumbnail
    const stickerUrls = [
      pack.thumbnailUrl,
      pack.thumbnailUrl + "?v=1", // Simulación de variación
      pack.thumbnailUrl + "?v=2"
    ]

    for (let i = 0; i < 3; i++) {
      let sticker = new Sticker(stickerUrls[i], {
        pack: pack.name,
        author: pack.author,
        type: 'full',
        categories: ['🔥'],
        id: `sylphy-${i}`
})
      let buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer}, { quoted: m})
}

} catch (e) {
    console.error(e)
    m.reply('⚠️ Error al procesar los stickers.')
}
}

handler.help = ['stikerly *<consulta>*']
handler.tags = ['sticker']
handler.command = /^stikerly$/i

export default handler
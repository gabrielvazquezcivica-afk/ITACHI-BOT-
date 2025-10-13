import fetch from 'node-fetch'
import { Sticker} from 'wa-sticker-formatter'

let handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply(`📌 Ejemplo:.${command} Barboza`)

  try {
    const searchRes = await fetch(`https://api.sylphy.xyz/stickerly/search?q=${encodeURIComponent(text)}&apikey=sylphy-e321`)
    const searchJson = await searchRes.json()

    if (!searchJson.status ||!Array.isArray(searchJson.res) || searchJson.res.length === 0) {
      return m.reply('❌ No se encontraron stickers.')
}

    const pick = searchJson.res[Math.floor(Math.random() * searchJson.res.length)]

    const packName = pick.name
    const authorName = pick.author || 'Desconocido'

    m.reply(`🎉 Pack encontrado: *${packName}* de *${authorName}*\n📦 Enviando 5 stickers...`)

    // Simulación de 5 stickers únicos usando variaciones del thumbnail
    const stickerUrls = [
      pick.thumbnailUrl,
      pick.thumbnailUrl + "?v=1",
      pick.thumbnailUrl + "?v=2",
      pick.thumbnailUrl + "?v=3",
      pick.thumbnailUrl + "?v=4"
    ]

    for (let i = 0; i < stickerUrls.length; i++) {
      const sticker = new Sticker(stickerUrls[i], {
        pack: packName,
        author: authorName,
        type: 'full',
        categories: ['🔥'],
        id: `sylphy-${i}`
})
      const buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer}, { quoted: m})
}

} catch (e) {
    console.error(e)
    m.reply('⚠️ Error al procesar los stickers.')
}
}

handler.help = ['stikerly <consulta>']
handler.tags = ['sticker']
handler.command = /^stikerly$/i

export default handler
import fetch from 'node-fetch'
import { Sticker} from 'wa-sticker-formatter'

let handler = async (m, { conn, text, command}) => {
  if (!text) return m.reply(`📌 Ejemplo:.${command} Messi`)

  try {
    const searchRes = await fetch(`https://api.sylphy.xyz/stickerly/search?q=${encodeURIComponent(text)}&apikey=sylphy-e321`)
    const searchJson = await searchRes.json()

    if (!searchJson.status ||!Array.isArray(searchJson.res) || searchJson.res.length === 0) {
      return m.reply('❌ No se encontraron stickers.')
}

    const pick = searchJson.res[Math.floor(Math.random() * searchJson.res.length)]

    m.reply(`🎉 Encontré el pack *${pick.name}* de *${pick.author}*\n📦 Enviando 5 stickers...`)

    // Simulación de 5 stickers usando la miniatura repetida
    for (let i = 0; i < 5; i++) {
      let sticker = new Sticker(pick.thumbnailUrl, {
        pack: pick.name,
        author: pick.author,
        type: 'full',
        categories: ['⚽'],
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
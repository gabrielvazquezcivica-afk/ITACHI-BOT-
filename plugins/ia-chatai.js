
import fetch from 'node-fetch'

let handler = async (m, { text, command}) => {
  const apikey = "sylphy-e321"
  if (!text) return m.reply(`📌 Ejemplo:.${command} ¿Cuál es el significado de la vida?`)

  try {
    const res = await fetch(`https://api.sylphy.xyz/ai/chatgpt?text=${encodeURIComponent(text)}&apikey=sylphy-e321 `)
    const json = await res.json()

    if (!json.status ||!json.result) {
      return m.reply("❌ No se pudo obtener respuesta de la IA.")
}

    await m.reply(`🤖 *Respuesta IA:*\n\n${json.result}`)

} catch (e) {
    console.error(e)
    m.reply("⚠️ Error al procesar la solicitud de IA.")
}
}

handler.help = ['ia <pregunta o mensaje>']
handler.tags = ['ai']
handler.command = /^ia$/i

export default handler

import fetch from 'node-fetch'

let handler = async (m, { text, command}) => {
  const apikey = "sylphy-e321"
  if (!text ||!text.trim()) {
    return m.reply(`📌 Ejemplo:.${command} ¿Cuál es el significado de la vida?`)
}

  try {
    const url = `https://api.sylphy.xyz/ai/chatgpt?text=${encodeURIComponent(text.trim())}&apikey=sylphy-e321`
    const res = await fetch(url)
    const json = await res.json()

    if (!json.status ||!json.result) {
      return m.reply("❌ No se pudo obtener respuesta de la IA.")
}

    await m.reply(`🤖 *Respuesta IA:*\n\n${json.result}`)

} catch (e) {
    console.error("Error en.ai:", e)
    m.reply("⚠️ Error al procesar la solicitud de IA.")
}
}

handler.help = ['ai <pregunta o mensaje>']
handler.tags = ['ai']
handler.command = ['ai2', 'chatgpt2']

export default handler


import fetch from 'node-fetch'

let handler = async (m, { text, command}) => {
  const apikey = "sylphy-e321"
  if (!text ||!text.trim()) {
    return m.reply(`📌 Ejemplo:.${command} ¿Quién es Messi?`)
}

  try {
    const url = `https://api.sylphy.xyz/ai/blackbox?text=${encodeURIComponent(text.trim())}&apikey=sylphy-e321`
    const res = await fetch(url)
    const json = await res.json()

    if (!json.status ||!json.result) {
      return m.reply("❌ No se pudo obtener respuesta de Blackbox AI.")
}

    await m.reply(`🧠 *Blackbox AI responde:*\n\n${json.result}`)

} catch (e) {
    console.error("Error en.blackbox:", e)
    m.reply("⚠️ Error al procesar la solicitud de IA.")
}
}

handler.help = ['blackbox <pregunta o mensaje>']
handler.tags = ['ai']
handler.command = ['blackbox']

export default handler
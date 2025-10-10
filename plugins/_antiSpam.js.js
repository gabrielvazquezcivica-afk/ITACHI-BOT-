
import fetch from "node-fetch"

async function mediafireAPI(url) {
  try {
    const res1 = await fetch("https://staging-mediafire-direct-url-ui-txd2.frontend.encr.app/api/mediafire/taskid", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "content-type": "application/json",
        "accept-language": "id-ID"
}
})

    const data1 = await res1.json()
    const taskId = data1.taskId

    const res2 = await fetch(`https://staging-mediafire-direct-url-ui-txd2.frontend.encr.app/api/mediafire/download/${taskId}`, {
      method: "POST",
      headers: {
        "accept": "*/*",
        "content-type": "application/json",
        "accept-language": "id-ID"
},
      body: JSON.stringify({ url})
})

    const data2 = await res2.json()
    return {
      fileName: data2.fileName,
      downloadUrl: data2.downloadUrl
}
} catch (e) {
    return null
}
}

let handler = async (m, { args}) => {
  try {
    const url = args[0]
    if (!url ||!url.includes("mediafire.com")) throw "```[ 📎 ] Proporciona una URL válida de MediaFire```"

    const result = await mediafireAPI(url)
    if (!result) throw "```[ ⚠️ ] No se pudo obtener el enlace de descarga```"

    const caption = `
\`\`\`[ 📁 ] Nombre: ${result.fileName}
[ 🔗 ] Enlace directo: ${result.downloadUrl}\`\`\`
    `.trim()

    await m.reply(caption)
} catch (e) {
    await m.reply(`${e}`)
}
}

handler.help = ["mediafire"]
handler.tags = ["downloader"]
handler.command = /^mediafire3$/i
export default handler
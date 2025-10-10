
import axios from "axios"
import cheerio from "cheerio"
import fs from "fs"
import path from "path"
import { tmpdir} from "os"
import fetch from "node-fetch"
import FormData from "form-data"

async function mediafire(url) {
  const { data} = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N)",
      "Referer": "https://www.mediafire.com/",
      "Accept": "text/html"
},
});

  const $ = cheerio.load(data);
  const name = $('div.dl-btn-label').text().trim()
  const size = $('a#downloadButton').text().match(/\((.*?)\)/)?.[1] || '';
  let downloadUrl = $('a#downloadButton').attr('href');
  const fileType = $('div.filetype').text().trim();

  if (downloadUrl && downloadUrl.startsWith('//')) {
    downloadUrl = 'https:' + downloadUrl;
}

  return {
    name,
    size,
    fileType,
    downloadUrl
};
}

async function uploadUguu(filePath) {
  const form = new FormData()
  form.append("file", fs.createReadStream(filePath))

  const res = await fetch("https://uguu.se/api.php?d=upload-tool", {
    method: "POST",
    body: form
})

  const url = await res.text()
  return { url}
}

let handler = async (m, { args}) => {
  try {
    const url = args[0]
    if (!url ||!url.includes("mediafire.com")) throw "```[ 📎 ] Proporciona una URL válida de MediaFire```"

    const fileInfo = await mediafire(url)
    const fileName = fileInfo.name.replace(/\s+/g, "_")
    const filePath = path.join(tmpdir(), fileName)

    const response = await axios.get(fileInfo.downloadUrl, { responseType: "stream"})
    const writer = fs.createWriteStream(filePath)
    await new Promise((resolve, reject) => {
      response.data.pipe(writer)
      writer.on("finish", resolve)
      writer.on("error", reject)
})

    const { url: uploadedUrl} = await uploadUguu(filePath)
    await fs.promises.unlink(filePath)

    const caption = `
\`\`\`[ 📁 ] Nombre: ${fileInfo.name}
[ 📦 ] Tamaño: ${fileInfo.size}
[ 📄 ] Tipo: ${fileInfo.fileType}
[ 🔗 ] Enlace original: ${fileInfo.downloadUrl}
[ ☁️ ] Subido a Uguu: ${uploadedUrl}\`\`\`
    `.trim()

    await m.reply(caption)
} catch (e) {
    await m.reply(`\`\`\`[ ⚠️ ] Error: ${e}\`\`\``)
}
}

handler.help = ["mediafire"]
handler.tags = ["downloader"]
handler.command = /^mediafire3$/i
export default handler
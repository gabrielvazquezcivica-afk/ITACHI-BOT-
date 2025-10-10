import axios from "axios"
import cheerio from "cheerio"

async function mediafire(url) {
  const { data} = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
      "Referer": "https://www.mediafire.com/",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
},
});

  const $ = cheerio.load(data);
  const name = $('div.dl-btn-label').text().trim()
  const size = $('a#downloadButton').text().match(/\((.*?)\)/)?.[1] || '';
  let downloadUrl = $('a#downloadButton').attr('href');
  const imageUrl = $('meta[itemprop="image"]').attr('content');
  const description = $('meta[itemprop="description"]').attr('content') || '-'
  const fileType = $('div.filetype').text().trim();

  if (downloadUrl && downloadUrl.startsWith('//')) {
    downloadUrl = 'https:' + downloadUrl;
}

  return {
    name,
    downloadUrl,
    details: {
      size,
      description,
      imageUrl,
      fileType
}
};
}

let handler = async (m, { args}) => {
  try {
    const url = args[0]
    if (!url ||!url.includes("mediafire.com")) throw "```[ 📎 ] Proporciona una URL válida de MediaFire```"

    const res = await mediafire(url)
    const caption = `
\`\`\`[ 📁 ] Nombre: ${res.name}
[ 📦 ] Tamaño: ${res.details.size}
[ 📄 ] Tipo: ${res.details.fileType}
[ 📝 ] Descripción: ${res.details.description}
[ 🔗 ] Enlace de descarga: ${res.downloadUrl}\`\`\`
    `.trim()

    await m.reply(caption)
} catch (e) {
    await m.reply(`\`\`\`[ ⚠️ ] Error: ${e}\`\`\``)
}
}

handler.help = ["mediafire"]
handler.tags = ["downloader"]
handler.command = /^mediafire$/i
export default handler
/*
- Ã°Å¸â€™â„¢ Seticono por WillZek >> https://github.com/WillZek
- Ã°Å¸ÂªÂ CDN SUNFLARE por WillZek y SunFlare Team
- Ã°Å¸â€œÂ CDN RUSSELLXZ de Russel.xyz
*/

importar fs desde 'fs';
importar ruta desde 'ruta';
importar fetch desde "node-fetch";
importar cripto desde "cripto";
importar {FormData, Blob} desde "formdata-nodo";
importar { fileTypeFromBuffer } de "tipo-de-archivo";

emoji constante = 'Ã¢Å“â€¦'
constante emoji2 = 'Ã¢Å“â€¦'

deje que el controlador = async (m, { conexión, argumentos, prefijoUsado, comando }) => {

intentar {
constante tipo = args[0];
if (!['1', '2'].includes(tipo)) return conn.reply(m.chat, `Usa: *${usedPrefix+ command} 1* o *.seticono 2* respondiendo a una imagen.`, m, fake);

si (!m.quoted || !/imagen/.prueba(m.quoted.tipomime)) {
return m.reply(`Responde a una imagen con *${usedPrefix + command} ${tipo}* para actualizar el icono.`);
}

const media = await m.quoted.download();
constante tipo de archivo = await fileTypeFromBuffer(media);

si (!tipo de archivo || !tipo de archivo.mime.startsWith('image/')) {
return m.reply(`El archivo enviado no es una imagen válida.`);
}

deje url;
intentar {
const sunflare = await uploadToSunflare(media);
url = llamarada solar.url;
} captura (e) {
const russell = await uploadToRussellXZ(media);
url = russell.url;
}

deje que botData = global.db.data.settings[conn.usuario.jid] || {};
si (tipo === '1') {
botData.icon1 = url;
} demás {
botData.icon2 = url;
}
    global.db.data.settings[conn.usuario.jid] = botData;

await conn.sendFile(m.chat, media, 'icon.jpg', `${emoji} Icono ${tipo}.`, m);

} captura (e) {
m.reply(`Ã°Å¸ÂªÂ Error: ${e.message}`);
}}

handler.help = ['seticono <1|2>'];
handler.tags = ['herramientas'];
manejador.comando = /^seticono$/i;
manejador.rowner = falso;

controlador de exportación predeterminado;

función asíncrona uploadToSunflare(buffer) {
const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: 'bin', mime: 'application/octet-stream' };
constante blob = nuevo Blob([buffer], { tipo: mime });
constante randomName = crypto.randomBytes(5).toString('hex') + '.' + ext;

deje que la carpeta = 'archivos';
si (mime.startsWith('image/')) carpeta = 'imágenes';

constante arrayBuffer = await blob.arrayBuffer();
constante base64Content = Buffer.from(arrayBuffer).toString('base64');

constante resp = await fetch('https://cdn-sunflareteam.vercel.app/api/upload', {
método: 'POST',
encabezados: { 'Content-Type': 'application/json' },
cuerpo: JSON.stringify({
carpeta,
nombre de archivo: randomName,
Contenido base64
})
});

constante resultado = esperar resp.json();

si (resp.ok && resultado?.url) {
devolver { url: resultado.url, nombre: randomName };
} demás {
lanzar nuevo Error(resultado?.error || 'Error cdn.sunflare');
}}

función asíncrona uploadToRussellXZ(buffer) {
constante formulario = nuevo FormData();
form.set("archivo", nuevo Blob([buffer], { tipo: 'imagen/jpeg' }), "imagen.jpg");

const resp = await fetch("https://cdn.russellxz.click/upload.php", {
método: "POST",
cuerpo: forma
});

constante resultado = esperar resp.json();

si (resp.ok && resultado?.url) {
devolver { url: resultado.url };
} demás {
lanzar nuevo Error(resultado?.error || 'Error cdn.russellxz');
}}
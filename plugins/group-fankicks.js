import fs from "fs";
import path from "path";

global.listaFantasmas = {}; // Lista temporal de usuarios sin actividad

const fankickHandler = async (msg, { conn}) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || chatId;
  const senderClean = senderId.replace(/\D/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    await conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
}, { quoted: msg});
    return;
}

  const metadata = await conn.groupMetadata(chatId);
  const participante = metadata.participants.find(p => p.id === senderId);
  const isAdmin = ["admin", "superadmin"].includes(participante?.admin);
  const isOwner = global.owner?.some(([id]) => id === senderClean);
  const isFromMe = msg.key.fromMe;

  if (!isAdmin &&!isOwner &&!isFromMe) {
    await conn.sendMessage(chatId, {
      text: "🚫 Solo administradores o owners pueden usar este comando."
}, { quoted: msg});
    return;
}

  const conteoPath = path.resolve("conteo.json");
  const conteoData = fs.existsSync(conteoPath)
? JSON.parse(fs.readFileSync(conteoPath, "utf-8"))
: {};

  const groupConteo = conteoData[chatId] || {};

  const fantasmas = metadata.participants.filter(p =>!groupConteo[p.id]);

  if (fantasmas.length === 0) {
    await conn.sendMessage(chatId, {
      text: "✅ No hay fantasmas en este grupo. ¡Todos han enviado mensajes!"
}, { quoted: msg});
    return;
}

  global.listaFantasmas[chatId] = fantasmas.map(u => u.id);

  const texto = `⚠️ *Se detectaron ${fantasmas.length} usuarios fantasmas.*\n` +
                `Para eliminar a estos usuarios escribe el comando *okfan*.\n\n` +
                fantasmas.map(u => `@${u.id.split("@")[0]}`).join("\n");

  await conn.sendMessage(chatId, {
    text: texto,
    mentions: fantasmas.map(u => u.id)
}, { quoted: msg});
};

handler.command = ["fankick"];

export default fankickHandler;
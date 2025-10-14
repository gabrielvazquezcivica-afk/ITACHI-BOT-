
const handler = async (m, { conn, participants}) => {
  // Verifica que el mensaje sea en un grupo
  if (!m.isGroup) return m.reply("❌ Este comando solo funciona en grupos.");

  // Verifica que el bot tenga permisos de administrador
  const botAdmin = participants.find(p => p.id === conn.user.jid)?.admin;
  if (!botAdmin) return m.reply("⚠️ Necesito ser administrador para poder expulsar usuarios.");

  // Verifica que el autor del mensaje sea administrador
  const senderAdmin = participants.find(p => p.id === m.sender)?.admin;
  if (!senderAdmin) return m.reply("🚫 Solo los administradores pueden usar este comando.");

  // Determina el usuario a expulsar: etiquetado o mensaje respondido
  const target = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!target) return m.reply("👤 Etiqueta o responde al usuario que deseas expulsar.");

  // Evita que se expulse a administradores
  const targetAdmin = participants.find(p => p.id === target)?.admin;
  if (targetAdmin) return m.reply("❌ No puedo expulsar a un administrador.");

  // Ejecuta la expulsión
  await conn.groupParticipantsUpdate(m.chat, [target], "remove");
  await m.reply(`👢 Usuario expulsado: @${target.split("@")[0]}`, null, {
    mentions: [target]
});
};

handler.command = ["kick"];
handler.group = true;

export default handler;
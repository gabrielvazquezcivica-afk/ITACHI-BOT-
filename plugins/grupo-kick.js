
const fkontak = {
  key: {
    participants: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
    fromMe: false,
    id: 'SasukeBot'
},
  message: {
    contactMessage: {
      displayName: 'Sasuke Bot 👑 El Rey',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Sasuke Bot\nORG:Sasuke Empire\nTITLE:El Rey\nTEL;type=CELL;type=VOICE;waid=1234567890:+1 234 567 890\nEND:VCARD`
}
}
}

var handler = async (m, { conn, participants, usedPrefix, command}) => {
  let mentionedJid = await m.mentionedJid
  let user = mentionedJid?.[0] || (m.quoted && await m.quoted.sender) || null

  if (!user) {
    return conn.sendMessage(m.chat, { text: `🌸 Debes mencionar a un usuario para expulsarlo del grupo.`}, { quoted: fkontak})
}

  try {
    const groupInfo = await conn.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || `${m.chat.split`-`[0]}@s.whatsapp.net`
    const ownerBot = `${global.owner[0][0]}@s.whatsapp.net`

    // Validaciones
    if (user === conn.user.jid) {
      return conn.sendMessage(m.chat, { text: `🤖 No puedo eliminar al bot del grupo.`}, { quoted: fkontak})
}
    if (user === ownerGroup) {
      return conn.sendMessage(m.chat, { text: `👑 No puedo eliminar al propietario del grupo.`}, { quoted: fkontak})
}
    if (user === ownerBot) {
      return conn.sendMessage(m.chat, { text: `🛡️ No puedo eliminar al propietario del bot.`}, { quoted: fkontak})
}

    // Expulsar usuario
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    conn.sendMessage(m.chat, { text: `✅ Usuario eliminado con éxito por Sasuke Bot 👑.`}, { quoted: fkontak})
} catch (e) {
    conn.sendMessage(
      m.chat,
      {
        text: `⚠️ Ocurrió un error.\nUsa *${usedPrefix}report* para informarlo.\n\n📝 ${e.message}`
},
      { quoted: fkontak}
)
}
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i;

export async function before(m, { conn, isAdmin, isBotAdmin}) {
  if (m.isBaileys || m.fromMe) return true;
  if (!m.isGroup) return false;

  const chat = global.db.data.chats[m.chat];
  const botSettings = global.db.data.settings[conn.user.jid] || {};
  const isGroupLink = linkRegex.exec(m.text);
  const isChannelLink = channelLinkRegex.exec(m.text);

  if (chat.antiLink && (isGroupLink || isChannelLink) &&!isAdmin) {
    if (!isBotAdmin) {
      await conn.reply(m.chat, `⚠️ Link detected, but I need admin rights to take action.`, m);
      return true;
}

    // Check if the link is from this group
    const thisGroupCode = await conn.groupInviteCode(m.chat);
    const thisGroupLink = `https://chat.whatsapp.com/${thisGroupCode}`;

    if (m.text.includes(thisGroupLink)) return true; // Don't act on own group link

    // Delete message and kick user
    await conn.sendMessage(m.chat, { delete: m.key});
    await conn.reply(
      m.chat,
      `⚠️ Link detected!\n\n*@${m.sender.split('@')[0]}* has been removed for sharing external links.`,
      m,
      { mentions: [m.sender]}
);
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
}

  return true;
}
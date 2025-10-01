let handler = async (m, { conn, participants, isBotAdmin, isAdmin, args }) => {
  if (!m.isGroup) {
    return m.reply('❗ *Este comando solo funciona en grupos.*');
  }
  if (!isAdmin) {
    return m.reply('🚫 *Solo los admins pueden usar este comando, fiera.*');
  }
  if (!isBotAdmin) {
    return m.reply('😥 *No puedo eliminar a nadie si no soy admin.*');
  }

  let users = [];

  if (m.mentionedJid?.length) {
    users = m.mentionedJid;
  } else if (m.quoted?.sender) {
    users = [m.quoted.sender];
  } else if (args[0]) {
    let jid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    users = [jid];
  }

  if (!users.length) {
    return m.reply('👀 *Etiqueta, responde al mensaje o escribe el número de quien quieras eliminar, no adivino...*');
  }

  let successfullyRemoved = [];
  let failedToRemove = [];

  for (let user of users) {
    if (user === conn.user.jid) {
      m.reply(`😅 *¿Quieres que me elimine a mí mismo? Eso no se puede.*`);
      continue;
    }

    const participantExists = participants.some(p => p.id === user);
    if (!participantExists) {
      m.reply(`🤔 *No encontré a @${user.split('@')[0]} en este grupo, ¿estás seguro?*`, null, {
        mentions: [user],
      });
      continue;
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
      successfullyRemoved.push(user);
    } catch (e) {
      console.error(`Error al eliminar a ${user}:`, e);
      failedToRemove.push(user);
    }
  }

  if (successfullyRemoved.length > 0) {
    let removedList = successfullyRemoved.map(user => `@${user.split('@')[0]}`).join(', ');

    await m.reply(
      `👢 *${removedList} fue enviado(s) a volar del grupo...*\n\n✨ _Desarrollado por Barboza🌀_`,
      m.chat,
      {
        contextInfo: {
          mentionedJid: successfullyRemoved
        }
      }
    );
    m.react('✅');
  } else if (failedToRemove.length > 0) {
    m.reply('❌ *Hubo un problema al intentar eliminar a los usuarios. Quizás no tienen permiso o hubo un error en el servidor.*');
    m.react('❌');
  }
};

handler.help = ['kick', 'ban', 'echar', 'sacar'];
handler.tags = ['group'];
handler.command = /^(kick|ban|echar|sacar)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

let handler = async (m, { conn }) => {
m.reply('🌙 Reiniciando.')
process.exit(1)
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = ['restart', 'reiniciar']
handler.rowner = true

export default handler
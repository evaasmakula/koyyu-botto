const { default: XeonBotIncConnect, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto } = require("@adiwajshing/baileys");
require('colors')
const fs = require('fs')

/**
 * Basic message handler for the bot.
 * @param {baileys} conn socket connection from baileys
 * @param {baileys.message.upsert} m the message from the chat
 */
module.exports = async (conn, m) => {
    const sender = m.key.remoteJid;
    
    fs.writeFileSync('./msgLog.json', JSON.stringify(m, null, 2))

    // let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]

}
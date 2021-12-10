const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys-md")
const { state, saveState } = useSingleFileAuthState('./login.json');
const fs = require('fs');
const logDB = './dblog.json';
const handler = require('./handler.js');

const startSock = () => {
    const conn = makeWASocket({ printQRInTerminal: true, auth: state })

    conn.ev.on('messages.upsert', async m => {
        const message = m.messages[0]
        fs.writeFileSync(logDB, JSON.stringify(m));
        // if (!message.key.fromMe && m.type === 'notify') {
        //     await conn.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id])
        //     try {
                
        //     } catch (err) {
                
        //     }
        // }
        if (!message.message || message.key.fromMe || message.key && message.key.remoteJid == 'status@broadcast') return;
        if (message.message.ephemeralMessage) {
			message.message = message.message.ephemeralMessage.message;
		}
		
		await handler(conn, message);
    })

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                ? startSock()
                : console.log('+ connection closed')
        }
    })

    conn.ev.on('creds.update', saveState)

    return conn
}

startSock()
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys-md")
const { state, saveState } = useSingleFileAuthState('./login.json');
const fs = require('fs');
const logDB = './dblog.json';
const handler = require('./handler.js');
const errorHandler = require("./lib/errorHandler");

const startSock = () => {
    const conn = makeWASocket({ printQRInTerminal: true, auth: state })

    conn.ev.on('messages.upsert', async m => {
        const message = m.messages[0]

        // optional logging get last message received
        fs.writeFileSync(logDB, JSON.stringify(m));

        // send read receipt
        await conn.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id])
        
        try {
            if (!message.message || message.key.fromMe || message.key && message.key.remoteJid == 'status@broadcast') return;
            if (message.message.ephemeralMessage) {
                message.message = message.message.ephemeralMessage.message;
            }

            await handler(conn, message);
        } catch (err) {
            const error = err.message;
            console.log(error);

            await errorHandler(conn, message, error)
        }
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